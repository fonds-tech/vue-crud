import type { CrudRef, CrudOptions } from "../interface"
import { reactive } from "vue"
import { it, vi, expect, describe } from "vitest"
import { createHelper, paramsReplace } from "../helper"

function createCrud() {
  const config = reactive<CrudOptions>({
    dict: {
      api: { page: "page", delete: "remove" } as any,
      label: {} as any,
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

describe("fd-crud helper logic", () => {
  it("paramsReplace 映射与下划线恢复", () => {
    const dict: any = { pagination: { page: "p", size: "s" }, search: { name: "n" }, sort: {} }
    const res = paramsReplace(dict, { page: 1, size: 10, name: "foo", _bar: "x" })
    expect(res).toEqual({ _p: 1, _s: 10, _n: "foo", bar: "x" })
  })

  it("paramsReplace 处理无映射配置", () => {
    const dict: any = { pagination: {}, search: {}, sort: {} }
    const res = paramsReplace(dict, { page: 1, name: "foo" })
    expect(res).toEqual({ page: 1, name: "foo" })
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

  it("set(permission) 函数形式", () => {
    const { crud, config } = createCrud()
    const helper = createHelper({ crud, config, mitt: crud.mitt as any })

    helper.set("permission", () => ({ add: true, delete: false }))

    expect(crud.permission.add).toBe(true)
    expect(crud.permission.delete).toBe(false)
  })

  it("set(permission) 对象形式", () => {
    const { crud, config } = createCrud()
    const helper = createHelper({ crud, config, mitt: crud.mitt as any })

    helper.set("permission", { update: true })

    expect(crud.permission.update).toBe(true)
  })

  it("set 默认分支合并到 crud 对象", () => {
    const { crud, config } = createCrud()
    const helper = createHelper({ crud, config, mitt: crud.mitt as any })

    helper.set("params", { customKey: "value" })

    expect(crud.params.customKey).toBe("value")
  })

  it("set 空值时返回 false", () => {
    const { crud, config } = createCrud()
    const helper = createHelper({ crud, config, mitt: crud.mitt as any })

    const result = helper.set("service", undefined)

    expect(result).toBe(false)
  })

  it("getPermission 无权限时返回 false", () => {
    const { crud, config } = createCrud()
    crud.permission = {}
    const helper = createHelper({ crud, config, mitt: crud.mitt as any })

    expect(helper.getPermission("add")).toBe(false)
    expect(helper.getPermission("delete")).toBe(false)
  })

  it("rowInfo 触发 detail 代理事件", () => {
    const { crud, config } = createCrud()
    const helper = createHelper({ crud, config, mitt: crud.mitt as any })

    helper.rowInfo({ id: 1, name: "test" })

    expect(crud.mitt.emit).toHaveBeenCalledWith("crud.proxy", {
      name: "detail",
      data: [{ id: 1, name: "test" }],
    })
  })

  it("rowAdd 触发 add 代理事件", () => {
    const { crud, config } = createCrud()
    const helper = createHelper({ crud, config, mitt: crud.mitt as any })

    helper.rowAdd()

    expect(crud.mitt.emit).toHaveBeenCalledWith("crud.proxy", {
      name: "add",
      data: undefined,
    })
  })

  it("rowEdit 触发 edit 代理事件", () => {
    const { crud, config } = createCrud()
    const helper = createHelper({ crud, config, mitt: crud.mitt as any })

    helper.rowEdit({ id: 2 })

    expect(crud.mitt.emit).toHaveBeenCalledWith("crud.proxy", {
      name: "edit",
      data: [{ id: 2 }],
    })
  })

  it("rowAppend 触发 append 代理事件", () => {
    const { crud, config } = createCrud()
    const helper = createHelper({ crud, config, mitt: crud.mitt as any })

    helper.rowAppend({ parentId: 1 })

    expect(crud.mitt.emit).toHaveBeenCalledWith("crud.proxy", {
      name: "append",
      data: [{ parentId: 1 }],
    })
  })

  it("rowClose 触发 close 代理事件", () => {
    const { crud, config } = createCrud()
    const helper = createHelper({ crud, config, mitt: crud.mitt as any })

    helper.rowClose()

    expect(crud.mitt.emit).toHaveBeenCalledWith("crud.proxy", {
      name: "close",
      data: undefined,
    })
  })

  it("on 注册事件监听器", () => {
    const { crud, config } = createCrud()
    const helper = createHelper({ crud, config, mitt: crud.mitt as any })
    const callback = vi.fn()

    helper.on("refresh", callback)

    expect(crud.mitt.on).toHaveBeenCalledWith("refresh-test", callback)
  })

  it("getParams 返回当前参数", () => {
    const { crud, config } = createCrud()
    crud.params = { page: 2, size: 50 }
    const helper = createHelper({ crud, config, mitt: crud.mitt as any })

    expect(helper.getParams()).toEqual({ page: 2, size: 50 })
  })

  it("setParams 合并参数", () => {
    const { crud, config } = createCrud()
    crud.params = { page: 1 }
    const helper = createHelper({ crud, config, mitt: crud.mitt as any })

    helper.setParams({ size: 100, keyword: "test" })

    expect(crud.params.page).toBe(1)
    expect(crud.params.size).toBe(100)
    expect(crud.params.keyword).toBe("test")
  })
})
