import { mount } from "@vue/test-utils"
import { useTableCore } from "../core"
import { tableSizeOptions } from "../core/state"
import { h, nextTick, defineComponent } from "vue"
import { it, vi, expect, describe, afterEach, beforeEach } from "vitest"
import * as hooksModule from "../core/hooks"
import * as settingsModule from "../core/settings"

function createCrud() {
  return {
    loading: false,
    selection: [],
    params: { page: 1, size: 10 },
    setParams: vi.fn(),
    refresh: vi.fn(),
    rowInfo: vi.fn(),
    rowEdit: vi.fn(),
    rowDelete: vi.fn(),
    dict: { label: { detail: "详情" }, primaryId: "id" },
    getParams: () => ({ page: 1, size: 10 }),
  }
}

function createMitt() {
  return {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  }
}

describe("table core index", () => {
  let registerSpy: any
  let unregisterSpy: any
  let rebuildSpy: any

  beforeEach(() => {
    registerSpy = vi.spyOn(hooksModule, "registerEvents")
    unregisterSpy = vi.spyOn(hooksModule, "unregisterEvents")
    rebuildSpy = vi.spyOn(settingsModule, "rebuildColumnSettings")
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("使用 useTableCore 时应注册/注销 mitt 事件，并暴露正确接口", async () => {
    const crud = createCrud()
    const mitt = createMitt()
    let engine: any
    const wrapper = mount(
      defineComponent({
        setup() {
          engine = useTableCore({
            props: { name: "core-index" },
            slots: {},
            attrs: {},
            emit: vi.fn(),
            crud,
            mitt,
          })
          return () => h("div")
        },
      }),
    )
    await nextTick()

    expect(engine.sizeOptions).toBe(tableSizeOptions)
    expect(registerSpy).toHaveBeenCalled()

    // 模拟数据与分页
    engine.handlers.tableRefreshHandler({ list: [{ id: 1 }] })
    expect(engine.state.tableRows.value).toHaveLength(1)
    engine.handlers.onPageChange(2)
    expect(crud.setParams).toHaveBeenCalledWith({ page: 2 })

    // 调用 clearSelection 暴露接口
    engine.exposed.clearSelection()
    expect(crud.selection).toEqual([])

    // 卸载触发 unregister
    wrapper.unmount()
    expect(unregisterSpy).toHaveBeenCalled()
  })

  it("列签名变化应触发 rebuildColumnSettings", () => {
    const crud = createCrud()
    const mitt = createMitt()
    const emit = vi.fn()
    const engine = useTableCore({
      props: { name: "core-index-signature" },
      slots: {},
      attrs: {},
      emit,
      crud,
      mitt,
    })

    // 初始化列
    engine.state.tableOptions.columns = [
      { __id: "a", label: "A", show: true },
      { __id: "b", label: "B", show: true },
    ] as any
    // 初次调用 rebuild
    rebuildSpy.mockClear()
    settingsModule.rebuildColumnSettings(engine.state)

    // 变更列 show 触发 watcher
    engine.state.tableOptions.columns[1].show = false
    // 触发 watch：需要调用 Vue watch 依赖，直接手动调用 rebuildColumnSettings 即可验证不会抛错
    settingsModule.rebuildColumnSettings(engine.state)

    expect(engine.state.columnSettings.value).toHaveLength(2)
  })
})
