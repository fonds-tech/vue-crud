import type { CrudRef, CrudOptions } from "../types"
import { reactive } from "vue"
import { createService } from "../service"
import { createHelper, paramsReplace } from "../helper"
import { it, vi, expect, describe, beforeEach } from "vitest"

const { elMessageWarning, elMessageError, elMessageSuccess, elMessageBox } = vi.hoisted(() => {
  const warning = vi.fn()
  const error = vi.fn()
  const success = vi.fn()
  const messageBox = vi.fn((options: any) => {
    const instance: any = { confirmButtonLoading: false }
    if (options?.beforeClose) {
      return new Promise((resolve) => {
        options.beforeClose("confirm", instance, () => resolve(undefined))
      })
    }
    return Promise.resolve()
  })
  return { elMessageWarning: warning, elMessageError: error, elMessageSuccess: success, elMessageBox: messageBox }
})

vi.mock("element-plus", () => ({
  ElMessage: {
    warning: elMessageWarning,
    error: elMessageError,
    success: elMessageSuccess,
  },
  ElMessageBox: elMessageBox,
}))

function createCrud() {
  const config = reactive<CrudOptions>({
    dict: {
      api: { page: "page", delete: "remove" } as any,
      label: {
        tips: "tips",
        deleteConfirm: "deleteConfirm",
        deleteSuccess: "deleteSuccess",
        confirm: "confirm",
        close: "close",
        pageMissing: "pageMissing",
      } as any,
      primaryId: "id",
      pagination: { page: "p", size: "s" } as any,
      search: {},
      sort: {},
    } as any,
    permission: { page: true } as any,
    style: { size: "default" },
    events: {},
  })

  const crud = reactive<CrudRef>({
    id: "test",
    loading: false,
    selection: [],
    params: { page: 1, size: 20 },
    service: {},
    dict: config.dict,
    permission: {},
    mitt: {
      emit: vi.fn(),
      on: vi.fn(),
    } as any,
    config,
    proxy: () => {},
    set: () => {},
    on: () => {},
    rowInfo: () => {},
    rowAdd: () => {},
    rowEdit: () => {},
    rowAppend: () => {},
    rowDelete: async () => {},
    rowClose: () => {},
    refresh: async () => ({}),
    getPermission: () => true,
    paramsReplace: () => ({}),
    getParams: () => ({}),
    setParams: () => {},
  })

  return { crud, config }
}

beforeEach(() => {
  elMessageWarning.mockClear()
  elMessageError.mockClear()
  elMessageSuccess.mockClear()
  elMessageBox.mockClear()
})

describe("fd-crud helper/service logic", () => {
  it("paramsReplace 映射与下划线恢复", () => {
    const dict: any = { pagination: { page: "p", size: "s" }, search: { name: "n" }, sort: {} }
    const res = paramsReplace(dict, { page: 1, size: 10, name: "foo", _bar: "x" })
    expect(res).toEqual({ _p: 1, _s: 10, _n: "foo", bar: "x" })
  })

  it("set(service) 透传 _permission 并保持原型", () => {
    const { crud, config } = createCrud()
    const helper = createHelper({ crud, config, mitt: crud.mitt as any })

    class ServiceClass {
      _permission = { list: true }
      ping() {
        return "pong"
      }
    }

    const service = new ServiceClass()
    helper.set("service", service)

    expect(crud.permission.list).toBe(true)
    expect(Object.getPrototypeOf(crud.service)).toBe(ServiceClass.prototype)
    expect((crud.service as any).ping()).toBe("pong")
  })

  it("refresh 成功时发送事件并清理 loading，缺省数组结果转换", async () => {
    const { crud, config } = createCrud()
    const helper = createHelper({ crud, config, mitt: crud.mitt as any })
    const service = createService({
      crud,
      config,
      mitt: crud.mitt as any,
      paramsReplace: helper.paramsReplace,
    })

    crud.service.page = vi.fn(async () => [{ id: 1 }, { id: 2 }])

    const res = await service.refresh({ extra: 1 })

    expect(res).toEqual({ list: [{ id: 1 }, { id: 2 }], pagination: { total: 2 } })
    expect(crud.mitt.emit).toHaveBeenCalledWith("crud.refresh", expect.anything())
    expect(crud.mitt.emit).toHaveBeenCalledWith(
      "table.refresh",
      expect.objectContaining({ count: 2, pageSize: undefined, list: expect.any(Array) }),
    )
    expect(crud.loading).toBe(false)
  })

  it("refresh 无服务时给出警告并结束 loading", async () => {
    const { crud, config } = createCrud()
    const helper = createHelper({ crud, config, mitt: crud.mitt as any })
    const service = createService({
      crud,
      config,
      mitt: crud.mitt as any,
      paramsReplace: helper.paramsReplace,
    })

    const res = await service.refresh()

    expect(res).toEqual({})
    expect(elMessageWarning).toHaveBeenCalled()
    expect(crud.loading).toBe(false)
  })

  it("rowDelete 默认流程调用删除接口并触发 refresh 与提示", async () => {
    const { crud, config } = createCrud()
    const helper = createHelper({ crud, config, mitt: crud.mitt as any })
    const service = createService({
      crud,
      config,
      mitt: crud.mitt as any,
      paramsReplace: helper.paramsReplace,
    })

    const refreshSpy = vi.spyOn(service, "refresh").mockResolvedValue({})
    crud.service.remove = vi.fn(async () => ({}))

    expect(service.rowDelete).toBeDefined()
    await service.rowDelete?.({ id: 1 })

    expect(crud.service.remove).toHaveBeenCalled()
    expect(elMessageSuccess).toHaveBeenCalled()
    expect(refreshSpy).toHaveBeenCalled()
  })
})
