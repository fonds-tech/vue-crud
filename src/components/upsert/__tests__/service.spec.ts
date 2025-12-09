import type { CrudRef } from "../../crud/interface"
import type { UpsertState } from "../core/state"
import type { createFormBuilder } from "../core/form"
import { createUpsertService } from "../core/service"
import { ref, computed, reactive } from "vue"
import { it, vi, expect, describe, beforeEach } from "vitest"

// Mock ElMessage
vi.mock("element-plus", () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// 辅助函数：创建 mock state
function createMockState(): UpsertState {
  const options = reactive({
    key: 0,
    mode: "add" as const,
    form: {},
    model: {},
    items: [],
    group: {},
    grid: { cols: 1 },
    actions: [],
    dialog: { width: "60%" },
  })
  return {
    options,
    visible: ref(false),
    loading: ref(false),
    mode: ref<"add" | "update">("add"),
    closeAction: ref<"cancel" | "submit">("cancel"),
    formRef: ref(undefined),
    formModel: computed(() => options.model),
    useUpsert: vi.fn(),
  }
}

// 辅助函数：创建 mock crud
function createMockCrud(overrides: Partial<CrudRef> = {}): CrudRef {
  return {
    dict: {
      primaryId: "id",
      api: {
        add: "add",
        update: "update",
        detail: "detail",
      },
      label: {
        saveSuccess: "保存成功",
      },
    },
    service: {
      add: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
      detail: vi.fn().mockResolvedValue({ id: 1, name: "测试" }),
    },
    refresh: vi.fn(),
    ...overrides,
  } as unknown as CrudRef
}

// 辅助函数：创建 mock builder
function createMockBuilder(): ReturnType<typeof createFormBuilder> {
  return {
    buildFormOptions: vi.fn().mockReturnValue({
      key: Date.now(),
      mode: "add",
      form: {},
      model: {},
      items: [],
      group: {},
      grid: { cols: 1 },
    }),
    applyForm: vi.fn().mockResolvedValue(undefined),
  }
}

describe("createUpsertService", () => {
  let mockState: UpsertState
  let mockCrud: CrudRef
  let mockBuilder: ReturnType<typeof createFormBuilder>

  beforeEach(() => {
    vi.clearAllMocks()
    mockState = createMockState()
    mockCrud = createMockCrud()
    mockBuilder = createMockBuilder()
  })

  describe("close", () => {
    it("关闭弹窗并设置 closeAction", () => {
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      service.close("submit")

      expect(mockState.closeAction.value).toBe("submit")
      expect(mockState.visible.value).toBe(false)
    })

    it("默认使用 cancel 作为 closeAction", () => {
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      service.close()

      expect(mockState.closeAction.value).toBe("cancel")
    })
  })

  describe("add", () => {
    it("打开新增模式", async () => {
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      await service.add({ name: "新数据" })

      expect(mockState.mode.value).toBe("add")
      expect(mockState.loading.value).toBe(false)
      expect(mockState.visible.value).toBe(true)
      expect(mockBuilder.applyForm).toHaveBeenCalledWith({ name: "新数据" })
    })

    it("不传参数时使用空对象", async () => {
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      await service.add()

      expect(mockBuilder.applyForm).toHaveBeenCalledWith({})
    })
  })

  describe("append", () => {
    it("打开追加模式（本质是新增）", async () => {
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      await service.append({ parentId: 1 })

      expect(mockState.mode.value).toBe("add")
      expect(mockState.visible.value).toBe(true)
      expect(mockBuilder.applyForm).toHaveBeenCalledWith({ parentId: 1 })
    })
  })

  describe("update", () => {
    it("打开编辑模式并请求详情", async () => {
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      await service.update({ id: 1, name: "测试" })

      expect(mockState.mode.value).toBe("update")
      expect(mockState.visible.value).toBe(true)
      expect(mockCrud.service?.detail).toHaveBeenCalledWith({ id: 1 })
    })

    it("缺少主键时报错", async () => {
      const { ElMessage } = await import("element-plus")
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      await expect(service.update({ name: "无主键" })).rejects.toThrow("缺少主键字段 id")
      expect(ElMessage.error).toHaveBeenCalledWith("缺少主键字段 id")
    })

    it("使用自定义 onDetail 钩子", async () => {
      const onDetail = vi.fn()
      mockState.options.onDetail = onDetail
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      await service.update({ id: 1 })

      expect(onDetail).toHaveBeenCalledWith(
        { id: 1 },
        expect.objectContaining({
          mode: "update",
          done: expect.any(Function),
          next: expect.any(Function),
          close: expect.any(Function),
        }),
      )
      // 使用自定义钩子时，不会自动调用 detail API
      expect(mockCrud.service?.detail).not.toHaveBeenCalled()
    })

    it("detail API 不存在时报错", async () => {
      const { ElMessage } = await import("element-plus")
      mockCrud = createMockCrud({ service: {} as any })
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      await expect(service.update({ id: 1 })).rejects.toThrow("未在 CRUD service 中找到 detail 方法")
      expect(ElMessage.error).toHaveBeenCalled()
    })
  })

  describe("submit", () => {
    it("表单未初始化时返回错误", async () => {
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      await expect(service.submit()).rejects.toThrow("表单未初始化")
    })

    it("校验失败时返回 null", async () => {
      mockState.formRef.value = {
        submit: vi.fn().mockResolvedValue({ values: {}, errors: { name: "必填" } }),
      } as any
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      const result = await service.submit()

      expect(result).toBeNull()
      expect(mockState.loading.value).toBe(false)
    })

    it("新增模式调用 add API", async () => {
      const { ElMessage } = await import("element-plus")
      mockState.mode.value = "add"
      mockState.formRef.value = {
        submit: vi.fn().mockResolvedValue({ values: { name: "新数据" }, errors: null }),
      } as any
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      await service.submit()

      expect(mockCrud.service?.add).toHaveBeenCalledWith({ name: "新数据" })
      expect(mockCrud.refresh).toHaveBeenCalled()
      expect(ElMessage.success).toHaveBeenCalledWith("保存成功")
      expect(mockState.visible.value).toBe(false)
      expect(mockState.closeAction.value).toBe("submit")
    })

    it("编辑模式调用 update API", async () => {
      mockState.mode.value = "update"
      mockState.formRef.value = {
        submit: vi.fn().mockResolvedValue({ values: { id: 1, name: "更新" }, errors: null }),
      } as any
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      await service.submit()

      expect(mockCrud.service?.update).toHaveBeenCalledWith({ id: 1, name: "更新" })
    })

    it("合并 extra 数据到 payload", async () => {
      mockState.formRef.value = {
        submit: vi.fn().mockResolvedValue({ values: { name: "数据" }, errors: null }),
      } as any
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      await service.submit({ extra: "额外数据" })

      expect(mockCrud.service?.add).toHaveBeenCalledWith({ name: "数据", extra: "额外数据" })
    })

    it("使用自定义 onSubmit 钩子", async () => {
      const onSubmit = vi.fn()
      mockState.options.onSubmit = onSubmit
      mockState.formRef.value = {
        submit: vi.fn().mockResolvedValue({ values: { name: "数据" }, errors: null }),
      } as any
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      await service.submit()

      expect(onSubmit).toHaveBeenCalledWith(
        { name: "数据" },
        expect.objectContaining({
          mode: "add",
          done: expect.any(Function),
          next: expect.any(Function),
          close: expect.any(Function),
        }),
      )
      // 使用自定义钩子时，不会自动调用 add/update API
      expect(mockCrud.service?.add).not.toHaveBeenCalled()
    })

    it("add API 不存在时报错", async () => {
      const { ElMessage } = await import("element-plus")
      mockCrud = createMockCrud({ service: {} as any })
      mockState.formRef.value = {
        submit: vi.fn().mockResolvedValue({ values: { name: "数据" }, errors: null }),
      } as any
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      await expect(service.submit()).rejects.toThrow("未在 CRUD service 中找到 add 方法")
      expect(ElMessage.error).toHaveBeenCalled()
    })
  })

  describe("handleProxyEvent", () => {
    it("响应 add 事件", async () => {
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      service.handleProxyEvent({ name: "add", data: [{ name: "新增" }] })

      // 等待异步操作
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockState.mode.value).toBe("add")
      expect(mockState.visible.value).toBe(true)
    })

    it("响应 append 事件", async () => {
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      service.handleProxyEvent({ name: "append", data: [{ parentId: 1 }] })

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockState.mode.value).toBe("add")
      expect(mockState.visible.value).toBe(true)
    })

    it("响应 edit 事件（table 点击编辑）", async () => {
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      service.handleProxyEvent({ name: "edit", data: [{ id: 1, name: "编辑行" }] })

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockState.mode.value).toBe("update")
      expect(mockState.visible.value).toBe(true)
      expect(mockCrud.service?.detail).toHaveBeenCalledWith({ id: 1 })
    })

    it("响应 close 事件", () => {
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })
      mockState.visible.value = true

      service.handleProxyEvent({ name: "close", data: [] })

      expect(mockState.visible.value).toBe(false)
      expect(mockState.closeAction.value).toBe("cancel")
    })

    it("忽略无效 payload", () => {
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      service.handleProxyEvent(null)
      service.handleProxyEvent(undefined)
      service.handleProxyEvent("string")
      service.handleProxyEvent({ name: "unknown" })

      expect(mockState.visible.value).toBe(false)
    })

    it("data 为空数组时使用空对象", async () => {
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      service.handleProxyEvent({ name: "add", data: [] })

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockBuilder.applyForm).toHaveBeenCalledWith({})
    })
  })

  describe("handleNext / handlePrev", () => {
    it("调用 formRef 的 next 方法", () => {
      const next = vi.fn()
      mockState.formRef.value = { next } as any
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      service.handleNext()

      expect(next).toHaveBeenCalled()
    })

    it("调用 formRef 的 prev 方法", () => {
      const prev = vi.fn()
      mockState.formRef.value = { prev } as any
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      service.handlePrev()

      expect(prev).toHaveBeenCalled()
    })

    it("formRef 不存在时不报错", () => {
      mockState.formRef.value = undefined
      const service = createUpsertService({ crud: mockCrud, state: mockState, builder: mockBuilder })

      expect(() => service.handleNext()).not.toThrow()
      expect(() => service.handlePrev()).not.toThrow()
    })
  })
})
