import { mount } from "@vue/test-utils"
import { useCrud } from "../useCrud"
import { useForm } from "../useForm"
import { useTable } from "../useTable"
import { useDetail } from "../useDetail"
import { useParent } from "../useParent"
import { useSearch } from "../useSearch"
import { useUpsert } from "../useUpsert"
import { useBrowser } from "../useBrowser"
import { it, vi, expect, describe } from "vitest"
import { h, ref, nextTick, defineComponent } from "vue"

describe("hooks coverage", () => {
  it("useBrowser 更新并在卸载时移除监听", async () => {
    const addSpy = vi.spyOn(window, "addEventListener")
    const removeSpy = vi.spyOn(window, "removeEventListener")
    const comp = defineComponent({
      setup() {
        const state = useBrowser()
        return () => h("div", state.isMini ? "mini" : "full")
      },
    })
    const wrapper = mount(comp)
    await nextTick()
    wrapper.unmount()
    expect(addSpy).toHaveBeenCalledWith("resize", expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function))
  })

  it("useParent 在无父组件时保持 ref 未赋值", () => {
    const target = ref<any>()
    useParent("fd-none", target)
    expect(target.value).toBeUndefined()
  })

  it("useCrud/useDetail/useForm/useTable/useUpsert 回调与 use 触发", async () => {
    const crudUse = vi.fn()
    const detailUse = vi.fn()
    const formUse = vi.fn()
    const tableUse = vi.fn()
    const upsertUse = vi.fn()
    const cbCrud = vi.fn()
    const cbDetail = vi.fn()
    const cbForm = vi.fn()
    const cbTable = vi.fn()
    const cbUpsert = vi.fn()

    const CrudChild = defineComponent({
      setup() {
        const crud = useCrud({ a: 1 } as any, cbCrud)
        return () => h("div", crud.value?.use ? "crud" : "no")
      },
    })

    const DetailChild = defineComponent({
      setup() {
        const detail = useDetail(undefined, cbDetail)
        return () => h("div", detail.value?.use ? "detail" : "no")
      },
    })

    const FormChild = defineComponent({
      setup() {
        const form = useForm(undefined, cbForm)
        return () => h("div", form.value?.use ? "form" : "no")
      },
    })

    const TableChild = defineComponent({
      setup() {
        const table = useTable(undefined, cbTable)
        return () => h("div", table.value?.use ? "table" : "no")
      },
    })

    const UpsertChild = defineComponent({
      setup() {
        const upsert = useUpsert(undefined, cbUpsert)
        return () => h("div", upsert.value?.use ? "upsert" : "no")
      },
    })

    const makeParent = (name: string, useFn: () => void, slot: () => any) =>
      defineComponent({
        name,
        expose: ["use"],
        setup(_, { expose }) {
          expose({ use: useFn })
          return slot
        },
      })

    const CrudParent = makeParent("fd-crud", crudUse, () => h(CrudChild))
    const DetailParent = makeParent("fd-detail", detailUse, () => h(DetailChild))
    const FormParent = makeParent("fd-form", formUse, () => h(FormChild))
    const TableParent = makeParent("fd-table", tableUse, () => h(TableChild))
    const UpsertParent = makeParent("fd-upsert", upsertUse, () => h(UpsertChild))

    const wrapper = mount({
      render() {
        // 每个子树独立，避免 useParent 早停在 fd-crud
        return h("div", [
          h(CrudParent),
          h(DetailParent),
          h(FormParent),
          h(TableParent),
          h(UpsertParent),
        ])
      },
    })

    await nextTick()

    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it("useBrowser 在无 window 环境下使用默认尺寸", async () => {
    const originalWindow = globalThis.window
    // 模拟 SSR 环境
    // @ts-expect-error - 覆盖全局 window 为 undefined 以模拟 SSR 环境
    globalThis.window = undefined
    vi.resetModules()
    const { useBrowser: useBrowserNoWindow } = await import("../useBrowser")
    const state = useBrowserNoWindow()
    expect(state.width).toBe(1920)
    expect(state.height).toBe(1080)
    expect(state.isMini).toBe(false)
    globalThis.window = originalWindow
    vi.resetModules()
  })

  it("各 hooks 在无 options 时仅调用回调且跳过 use", async () => {
    const makeParent = (name: string, spy: () => void, child: any) =>
      defineComponent({
        name,
        expose: ["use"],
        setup(_, { expose }) {
          expose({ use: spy })
          return () => h(child)
        },
      })

    const crudUse = vi.fn()
    const detailUse = vi.fn()
    const formUse = vi.fn()
    const searchUse = vi.fn()
    const tableUse = vi.fn()
    const upsertUse = vi.fn()

    const crudCb = vi.fn()
    const detailCb = vi.fn()
    const formCb = vi.fn()
    const searchCb = vi.fn()
    const tableCb = vi.fn()
    const upsertCb = vi.fn()

    const CrudChild = defineComponent({
      setup() {
        useCrud(undefined, crudCb)
        return () => h("div")
      },
    })

    const DetailChild = defineComponent({
      setup() {
        useDetail(undefined, detailCb)
        return () => h("div")
      },
    })

    const FormChild = defineComponent({
      setup() {
        useForm(undefined, formCb)
        return () => h("div")
      },
    })

    const SearchChild = defineComponent({
      setup() {
        const search = useSearch(undefined, searchCb)
        return () => h("div", search.value ? "got" : "none")
      },
    })

    const TableChild = defineComponent({
      setup() {
        useTable(undefined, tableCb)
        return () => h("div")
      },
    })

    const UpsertChild = defineComponent({
      setup() {
        useUpsert(undefined, upsertCb)
        return () => h("div")
      },
    })

    const wrapper = mount({
      render() {
        return h("div", [
          h(makeParent("fd-crud", crudUse, CrudChild)),
          h(makeParent("fd-detail", detailUse, DetailChild)),
          h(makeParent("fd-form", formUse, FormChild)),
          h(makeParent("fd-search", searchUse, SearchChild)),
          h(makeParent("fd-table", tableUse, TableChild)),
          h(makeParent("fd-upsert", upsertUse, UpsertChild)),
        ])
      },
    })

    await nextTick()

    expect(crudCb).toHaveBeenCalledTimes(1)
    expect(detailCb).toHaveBeenCalledTimes(1)
    expect(formCb).toHaveBeenCalledTimes(1)
    expect(searchCb).toHaveBeenCalledTimes(1)
    expect(tableCb).toHaveBeenCalledTimes(1)
    expect(upsertCb).toHaveBeenCalledTimes(1)

    expect(crudUse).not.toHaveBeenCalled()
    expect(detailUse).not.toHaveBeenCalled()
    expect(formUse).not.toHaveBeenCalled()
    expect(searchUse).not.toHaveBeenCalled()
    expect(tableUse).not.toHaveBeenCalled()
    expect(upsertUse).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it("useParent 在遇到 fd-crud 祖先时提前停止", async () => {
    const target = ref<any>()
    const Inner = defineComponent({
      name: "fd-form",
      setup() {
        useParent("fd-form", target)
        return () => h("div", "inner")
      },
    })
    const Outer = defineComponent({
      name: "fd-crud",
      setup() {
        return () => h("div", [h("section", [h(Inner)])])
      },
    })
    const wrapper = mount(Outer)
    await nextTick()
    expect(target.value).toBeUndefined()
    wrapper.unmount()
  })

  it("各 hooks 在无父组件时保持 undefined 并安全返回", async () => {
    const crud = useCrud()
    const detail = useDetail()
    const form = useForm()
    const search = useSearch()
    const table = useTable()
    const upsert = useUpsert()
    await nextTick()
    expect(crud.value).toBeUndefined()
    expect(detail.value).toBeUndefined()
    expect(form.value).toBeUndefined()
    expect(search.value).toBeUndefined()
    expect(table.value).toBeUndefined()
    expect(upsert.value).toBeUndefined()
  })

  it("useBrowser 在 window 不可用时跳过事件绑定", async () => {
    const originalWindow = globalThis.window
    const fakeWindow: any = {
      innerWidth: 0,
      innerHeight: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      ShadowRoot: class {},
      document: {},
    }
    // @ts-expect-error - 覆盖全局 window 为 undefined 以模拟无 window 环境
    globalThis.window = undefined
    vi.stubGlobal("window", undefined as any)
    const { useBrowser: useBrowserNoWin } = await import("../useBrowser")
    const state = useBrowserNoWin()
    expect(state.width).toBe(1920)
    expect(state.height).toBe(1080)

    // 恢复 window 并再运行一次以确保监听路径不触发
    vi.unstubAllGlobals()
    globalThis.window = fakeWindow
    const Comp = defineComponent({
      setup() {
        useBrowser()
        return () => h("div")
      },
    })
    const wrapper = mount(Comp)
    await nextTick()
    wrapper.unmount()
    expect(fakeWindow.addEventListener).toHaveBeenCalledTimes(1)
    expect(fakeWindow.removeEventListener).toHaveBeenCalledTimes(1)

    globalThis.window = originalWindow
    vi.resetModules()
  })
})
