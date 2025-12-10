import type { GridCollector, GridContextState } from "../interface"
import { mount } from "@vue/test-utils"
import { renderToString } from "@vue/server-renderer"
import { it, vi, expect, describe, afterEach } from "vitest"
import { GRID_CONTEXT_KEY, GRID_COLLECTOR_KEY } from "../interface"
import { h, inject, onMounted, createSSRApp, defineComponent } from "vue"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("fd-grid", () => {
  it("在无 window 环境下回退默认宽度并渲染", async () => {
    vi.stubGlobal("window", undefined as any)
    const { default: Grid } = await import("../grid")
    let injectedWidth: number | undefined
    const Consumer = defineComponent({
      setup() {
        const ctx = inject<GridContextState | undefined>(GRID_CONTEXT_KEY)
        injectedWidth = ctx?.viewportWidth.value
        return () => null
      },
    })

    const app = createSSRApp({
      render: () => h(Grid, null, { default: () => h(Consumer) }),
    })

    await renderToString(app)
    expect(injectedWidth).toBe(1920)
  })

  it("监听 resize 并更新上下文，卸载时移除监听", async () => {
    const { default: Grid } = await import("../grid")
    const addSpy = vi.spyOn(window, "addEventListener")
    const removeSpy = vi.spyOn(window, "removeEventListener")
    let ctx: GridContextState | undefined
    const Consumer = defineComponent({
      setup() {
        ctx = inject<GridContextState>(GRID_CONTEXT_KEY)!
        return () => null
      },
    })

    const wrapper = mount(Grid, {
      props: { cols: { sm: 2, xl: 4 }, rowGap: 4, colGap: 6 },
      attrs: { "data-x": "1", "class": "extra", "style": { color: "red" } },
      slots: { default: () => h(Consumer) },
    })

    const resizeHandler = addSpy.mock.calls.find(([event]) => event === "resize")?.[1] as () => void
    expect(typeof resizeHandler).toBe("function")

    window.innerWidth = 500
    resizeHandler()
    expect(ctx?.viewportWidth.value).toBe(500)

    expect(wrapper.classes()).toContain("fd-grid")
    expect(wrapper.classes()).toContain("extra")
    expect(wrapper.attributes("data-x")).toBe("1")

    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith("resize", resizeHandler)
  })

  it("折叠模式下附加类名并允许外部通过收集器移除数据", async () => {
    const { default: Grid } = await import("../grid")
    const Consumer = defineComponent({
      setup() {
        const collector = inject<GridCollector>(GRID_COLLECTOR_KEY)!
        onMounted(() => collector.removeItemData(0))
        return () => h("span", "slot")
      },
    })

    const wrapper = mount(Grid, {
      props: { collapsed: true, collapsedRows: 2, cols: { xs: 1, sm: 2 } },
      slots: { default: () => h(Consumer) },
    })

    expect(wrapper.classes()).toContain("is-collapsed")
  })
})
