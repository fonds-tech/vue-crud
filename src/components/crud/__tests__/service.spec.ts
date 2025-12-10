import type { CrudRef, CrudParams, CrudOptions } from "../interface"
import Mitt from "../../../utils/mitt"
import { createService } from "../core/service"
import { ElMessage, ElMessageBox } from "element-plus"
import { it, vi, expect, describe, beforeEach } from "vitest"

// Mock Element Plus 消息与确认框
vi.mock("element-plus", () => ({
  ElMessage: {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
  ElMessageBox: vi.fn(),
}))

function createConfig(): CrudOptions {
  return {
    dict: {
      api: { add: "add", page: "page", list: "list", update: "update", delete: "delete" },
      primaryId: "id",
      label: {
        add: "新增",
        list: "列表",
        update: "更新",
        delete: "删除",
        detail: "详情",
      },
    },
    permission: {},
    style: { size: "default" },
  }
}

let mitt: Mitt
let emitSpy: ReturnType<typeof vi.spyOn>
function setupConfirmMock() {
  ;(ElMessageBox as any).mockImplementation(async (options: any) => {
    const instance: any = { confirmButtonLoading: false }
    await options.beforeClose("confirm", instance, () => {})
    return null
  })
}
describe("createService", () => {
  let crud: CrudRef
  let config: CrudOptions
  const paramsReplace = vi.fn((params: CrudParams) => params)

  beforeEach(() => {
    vi.clearAllMocks()
    mitt = new Mitt()
    emitSpy = vi.spyOn(mitt, "emit")
    crud = {
      dict: {
        api: { page: "page", delete: "delete" },
        label: {
          pageMissing: "缺少分页服务",
          tips: "提示",
          deleteConfirm: "确定删除？",
          confirm: "确定",
          close: "关闭",
          deleteSuccess: "删除成功",
        },
        primaryId: "id",
      },
      service: {
        page: vi.fn().mockResolvedValue({ list: [] }),
        delete: vi.fn(),
      },
      params: { page: 1 },
      permission: { page: true },
      loading: false,
    } as unknown as CrudRef
    config = createConfig()
  })

  it("page 服务缺失时给出警告并返回空对象", async () => {
    crud.service = {} as any
    const service = createService({ config, crud, mitt, paramsReplace })

    const res = await service.refresh({ extra: true })

    expect(paramsReplace).toHaveBeenCalledWith({ page: 1, extra: true })
    expect((ElMessage as any).warning).toHaveBeenCalledWith("缺少分页服务")
    expect(res).toEqual({})
    expect(crud.loading).toBe(false)
  })

  it("调用分页服务并将数组响应转换为列表与分页信息", async () => {
    const rows = [{ id: 1 }, { id: 2 }]
    crud.service.page = vi.fn().mockResolvedValue(rows)
    const service = createService({ config, crud, mitt, paramsReplace })

    const res = await service.refresh({ size: 10 })

    expect(crud.loading).toBe(false)
    expect(res).toEqual({ list: rows, pagination: { total: 2 } })
    expect(emitSpy).toHaveBeenCalledWith("crud.refresh", res)
    expect(emitSpy).toHaveBeenCalledWith("table.refresh", {
      list: rows,
      page: undefined,
      count: 2,
      pageSize: undefined,
    })
  })

  it("分页服务返回非数组对象时使用 count 兜底", async () => {
    crud.service.page = vi.fn().mockResolvedValue({ count: 5 })
    const service = createService({ config, crud, mitt, paramsReplace })

    const res = await service.refresh()

    expect(res).toEqual({ count: 5 })
    expect(emitSpy).toHaveBeenCalledWith("table.refresh", {
      list: [],
      page: undefined,
      count: 5,
      pageSize: undefined,
    })
  })

  it("分页服务返回空对象时 table.refresh count 回退为 0", async () => {
    crud.service.page = vi.fn().mockResolvedValue({})
    const service = createService({ config, crud, mitt, paramsReplace })

    await service.refresh()

    expect(emitSpy).toHaveBeenCalledWith("table.refresh", {
      list: [],
      page: undefined,
      count: 0,
      pageSize: undefined,
    })
  })

  it("分页服务返回列表对象且缺少 total 时回退到列表长度", async () => {
    crud.service.page = vi.fn().mockResolvedValue({ list: [{ id: 1 }, { id: 2 }] })
    const service = createService({ config, crud, mitt, paramsReplace })

    await service.refresh()

    expect(emitSpy).toHaveBeenCalledWith("table.refresh", {
      list: [{ id: 1 }, { id: 2 }],
      page: undefined,
      count: 2,
      pageSize: undefined,
    })
  })

  it("分页服务报错时提示错误并抛出异常", async () => {
    const error = new Error("page failed")
    crud.service.page = vi.fn().mockRejectedValue(error)
    const service = createService({ config, crud, mitt, paramsReplace })

    await service.refresh().catch((err) => {
      expect(err).toBe(error)
    })
    expect((ElMessage as any).error).toHaveBeenCalledWith("page failed")
    expect(crud.loading).toBe(false)
  })

  it("并发刷新时旧请求结果被跳过但仍完成 Promise", async () => {
    const firstResolve: any = {}
    const secondResolve: any = {}
    crud.service.page = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((res) => {
            firstResolve.res = res
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((res) => {
            secondResolve.res = res
          }),
      )
    const service = createService({ config, crud, mitt, paramsReplace })

    const first = service.refresh({ page: 1 })
    const second = service.refresh({ page: 2 })

    secondResolve.res([{ id: 2 }])
    await second
    firstResolve.res([{ id: 1 }])
    await first

    expect(emitSpy).toHaveBeenCalledWith("crud.refresh", { list: [{ id: 2 }], pagination: { total: 1 } })
    expect(emitSpy).not.toHaveBeenCalledWith("crud.refresh", { list: [{ id: 1 }], pagination: { total: 1 } })
  })

  it("onRefresh 钩子可自定义渲染并跳过默认服务调用", async () => {
    const onRefresh = vi.fn()
    const service = createService({ config: { ...config, onRefresh }, crud, mitt, paramsReplace })
    const renderPayload = { list: [{ id: 3 }], pagination: { total: 1 } }
    onRefresh.mockImplementation((_params, { render }) => render(renderPayload))

    const res = await service.refresh()

    expect(crud.service.page).not.toHaveBeenCalled()
    expect(res).toEqual(renderPayload)
    expect(emitSpy).toHaveBeenCalledWith("crud.refresh", renderPayload)
  })

  it("删除成功时调用删除接口、提示成功并触发刷新", async () => {
    const service = createService({ config, crud, mitt, paramsReplace })
    const refreshSpy = vi.spyOn(service, "refresh").mockResolvedValue({})
    crud.service.delete = vi.fn().mockResolvedValue({ ok: true })
    setupConfirmMock()

    await service.rowDelete({ id: 10 })

    expect(crud.service.delete).toHaveBeenCalledWith({ ids: [10] })
    expect((ElMessage as any).success).toHaveBeenCalledWith("删除成功")
    expect(refreshSpy).toHaveBeenCalled()
  })

  it("缺少 service 或无分页权限时跳过警告提示", async () => {
    crud.service = undefined as any
    crud.permission = { page: false } as any
    const service = createService({ config, crud, mitt, paramsReplace })

    const res = await service.refresh()

    expect(res).toEqual({})
    expect((ElMessage as any).warning).not.toHaveBeenCalled()
  })

  it("存在 service 但分页权限关闭时也跳过缺失警告", async () => {
    crud.service = {} as any
    crud.permission = { page: false } as any
    const service = createService({ config, crud, mitt, paramsReplace })

    const res = await service.refresh()

    expect(res).toEqual({})
    expect((ElMessage as any).warning).not.toHaveBeenCalled()
  })

  it("缺少 service 且权限未配置时仍给出警告", async () => {
    crud.service = {} as any
    crud.permission = undefined as any
    const service = createService({ config, crud, mitt, paramsReplace })

    await service.refresh()

    expect((ElMessage as any).warning).toHaveBeenCalled()
  })

  it("缺少 pageMissing 文案时使用默认提示", async () => {
    crud.service = {} as any
    crud.dict.label = {} as any
    const service = createService({ config, crud, mitt, paramsReplace })

    await service.refresh()

    expect((ElMessage as any).warning).toHaveBeenCalledWith("未配置分页服务，跳过刷新")
  })

  it("删除确认取消时不调用接口且返回 null", async () => {
    const service = createService({ config, crud, mitt, paramsReplace })
    crud.service.delete = vi.fn()
    ;(ElMessageBox as any).mockImplementation(() => Promise.reject(new Error("cancel")))

    const res = await service.rowDelete({ id: 9 })

    expect(res).toBeNull()
    expect(crud.service.delete).not.toHaveBeenCalled()
    expect((ElMessage as any).success).not.toHaveBeenCalled()
  })

  it("删除弹窗点击取消时走 beforeClose 分支并直接 resolve", async () => {
    const service = createService({ config, crud, mitt, paramsReplace })
    crud.service.delete = vi.fn()
    ;(ElMessageBox as any).mockImplementation(async (options: any) => {
      const instance: any = { confirmButtonLoading: false }
      await options.beforeClose("cancel", instance, () => {})
      return null
    })

    const res = await service.rowDelete({ id: 3 })

    expect(res).toBeNull()
    expect(crud.service.delete).not.toHaveBeenCalled()
  })

  it("删除钩子可拦截并传递附加数据", async () => {
    config.onDelete = vi.fn((_selection, { next }) => next({ force: true }))
    const service = createService({ config, crud, mitt, paramsReplace })
    crud.service.delete = vi.fn().mockResolvedValue({})
    setupConfirmMock()

    await service.rowDelete({ id: 1 })

    expect(crud.service.delete).toHaveBeenCalledWith({ ids: [1], force: true })
    expect(config.onDelete).toHaveBeenCalled()
  })

  it("删除接口报错时提示错误并抛出", async () => {
    const service = createService({ config, crud, mitt, paramsReplace })
    const error = new Error("delete failed")
    crud.service.delete = vi.fn().mockRejectedValue(error)
    setupConfirmMock()

    await expect(service.rowDelete({ id: 2 })).rejects.toThrow("delete failed")
    expect((ElMessage as any).error).toHaveBeenCalledWith("delete failed")
  })
})
