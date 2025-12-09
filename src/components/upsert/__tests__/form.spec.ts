import type { UpsertMode, UpsertOptions } from "../interface"
import type { FormRef, FormRecord, FormInstance } from "../../form/types"
import { createFormBuilder } from "../core/form"
import { ref, reactive, shallowRef } from "vue"
import { it, vi, expect, describe, beforeEach } from "vitest"

// 辅助函数：创建 mock options
function createMockOptions(): UpsertOptions<FormRecord> {
  return reactive({
    key: 0,
    mode: "add" as UpsertMode,
    form: {
      labelWidth: "100px",
      labelPosition: "right" as const,
    },
    model: { name: "默认值" },
    items: [{
      label: "名称",
      prop: "name",
      component: { is: "el-input" },
      labelPosition: "right",
      showMessage: true,
    }],
    group: {},
    grid: { cols: 2, rowGap: 10, colGap: 12 },
    actions: [],
    dialog: { width: "60%" },
    onNext: vi.fn(),
  })
}

// 辅助函数：创建 mock formRef
function createMockFormRef(): FormRef<FormRecord> {
  return {
    id: "test-form",
    mode: "add",
    items: [],
    form: ref<FormInstance | undefined>(undefined),
    use: vi.fn(),
    setMode: vi.fn(),
    bindFields: vi.fn(),
    model: {},
    submit: vi.fn(),
    validate: vi.fn(),
    validateField: vi.fn(),
    resetFields: vi.fn(),
    clearFields: vi.fn(),
    clearValidate: vi.fn(),
    setFields: vi.fn(),
    scrollToField: vi.fn(),
    setField: vi.fn(),
    getField: vi.fn(),
    setItem: vi.fn(),
    setOptions: vi.fn(),
    getOptions: vi.fn(),
    getOptionsState: vi.fn(),
    reloadOptions: vi.fn(),
    setData: vi.fn(),
    setRequired: vi.fn(),
    setProps: vi.fn(),
    setStyle: vi.fn(),
    hideItem: vi.fn(),
    showItem: vi.fn(),
    collapse: vi.fn(),
    next: vi.fn(),
    prev: vi.fn(),
  } as unknown as FormRef<FormRecord>
}

describe("createFormBuilder", () => {
  let mockOptions: UpsertOptions<FormRecord>

  beforeEach(() => {
    vi.clearAllMocks()
    mockOptions = createMockOptions()
  })

  describe("buildFormOptions", () => {
    it("构建默认表单配置", () => {
      const mode = ref<UpsertMode>("add")
      const formRef = shallowRef<FormRef<FormRecord>>()
      const builder = createFormBuilder({ options: mockOptions, mode, formRef })

      const result = builder.buildFormOptions()

      expect(result.mode).toBe("add")
      expect(result.form).toEqual(mockOptions.form)
      expect(result.items).toEqual(mockOptions.items)
      expect(result.group).toEqual(mockOptions.group)
      expect(result.grid).toEqual(mockOptions.grid)
      expect(result.onNext).toBe(mockOptions.onNext)
      expect(result.key).toBeDefined()
    })

    it("合并初始数据到 model", () => {
      const mode = ref<UpsertMode>("add")
      const formRef = shallowRef<FormRef<FormRecord>>()
      const builder = createFormBuilder({ options: mockOptions, mode, formRef })

      const result = builder.buildFormOptions({ id: 1, extra: "数据" })

      expect(result.model).toEqual({
        name: "默认值",
        id: 1,
        extra: "数据",
      })
    })

    it("初始数据覆盖 options.model 中同名字段", () => {
      const mode = ref<UpsertMode>("update")
      const formRef = shallowRef<FormRef<FormRecord>>()
      const builder = createFormBuilder({ options: mockOptions, mode, formRef })

      const result = builder.buildFormOptions({ name: "新名称" })

      expect(result.model).toEqual({ name: "新名称" })
      expect(result.mode).toBe("update")
    })

    it("使用当前模式", () => {
      const mode = ref<UpsertMode>("update")
      const formRef = shallowRef<FormRef<FormRecord>>()
      const builder = createFormBuilder({ options: mockOptions, mode, formRef })

      const result = builder.buildFormOptions()

      expect(result.mode).toBe("update")
    })

    it("更新 options.key 和 options.mode", () => {
      const mode = ref<UpsertMode>("update")
      const formRef = shallowRef<FormRef<FormRecord>>()
      const builder = createFormBuilder({ options: mockOptions, mode, formRef })

      const result = builder.buildFormOptions()

      expect(mockOptions.key).toBe(result.key)
      expect(mockOptions.mode).toBe("update")
    })
  })

  describe("applyForm", () => {
    it("调用 formRef.use 应用配置", async () => {
      const mode = ref<UpsertMode>("add")
      const mockFormRef = createMockFormRef()
      const formRef = shallowRef<FormRef<FormRecord>>(mockFormRef)
      const builder = createFormBuilder({ options: mockOptions, mode, formRef })

      await builder.applyForm({ id: 1 })

      expect(mockFormRef.use).toHaveBeenCalledWith(expect.objectContaining({
        mode: "add",
        model: expect.objectContaining({ id: 1, name: "默认值" }),
      }))
    })

    it("设置表单模式", async () => {
      const mode = ref<UpsertMode>("update")
      const mockFormRef = createMockFormRef()
      const formRef = shallowRef<FormRef<FormRecord>>(mockFormRef)
      const builder = createFormBuilder({ options: mockOptions, mode, formRef })

      await builder.applyForm()

      expect(mockFormRef.setMode).toHaveBeenCalledWith("update")
    })

    it("绑定表单字段", async () => {
      const mode = ref<UpsertMode>("add")
      const mockFormRef = createMockFormRef()
      const formRef = shallowRef<FormRef<FormRecord>>(mockFormRef)
      const builder = createFormBuilder({ options: mockOptions, mode, formRef })

      await builder.applyForm({ extra: "数据" })

      expect(mockFormRef.bindFields).toHaveBeenCalledWith(expect.objectContaining({
        name: "默认值",
        extra: "数据",
      }))
    })

    it("formRef 不存在时不报错", async () => {
      const mode = ref<UpsertMode>("add")
      const formRef = shallowRef<FormRef<FormRecord>>()
      const builder = createFormBuilder({ options: mockOptions, mode, formRef })

      await expect(builder.applyForm()).resolves.not.toThrow()
    })

    it("formRef 没有 use 方法时不报错", async () => {
      const mode = ref<UpsertMode>("add")
      const formRef = shallowRef<FormRef<FormRecord>>({
        model: {},
        bindFields: vi.fn(),
      } as any)
      const builder = createFormBuilder({ options: mockOptions, mode, formRef })

      await expect(builder.applyForm()).resolves.not.toThrow()
    })

    it("formRef 没有 setMode 方法时不报错", async () => {
      const mode = ref<UpsertMode>("add")
      const mockFormRef = createMockFormRef()
      ;(mockFormRef as any).setMode = undefined
      const formRef = shallowRef<FormRef<FormRecord>>(mockFormRef)
      const builder = createFormBuilder({ options: mockOptions, mode, formRef })

      await expect(builder.applyForm()).resolves.not.toThrow()
    })
  })
})
