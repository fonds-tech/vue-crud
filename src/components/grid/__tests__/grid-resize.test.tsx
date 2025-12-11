import Grid from "../grid"
import { mount } from "@vue/test-utils"
import { it, vi, expect, describe, afterEach, beforeEach } from "vitest"

describe("fd-grid 响应与透传", () => {
  const originalWidth = window.innerWidth
  let addSpy: ReturnType<typeof vi.spyOn>
  let removeSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    addSpy = vi.spyOn(window, "addEventListener")
    removeSpy = vi.spyOn(window, "removeEventListener")
  })

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: originalWidth })
    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it("透传非 class/style 的 attrs，并根据 collapsed 添加类名", () => {
    const wrapper = mount(Grid, {
      attrs: { "data-test-id": "grid-root", "class": "custom-class" },
      props: {
        cols: { xs: 2, md: 4 },
        colGap: { xs: 4, md: 8 },
        collapsed: true,
      },
      slots: { default: () => "content" },
    })

    const root = wrapper.find("[data-test-id=\"grid-root\"]")
    expect(root.exists()).toBe(true)
    expect(root.classes()).toContain("fd-grid")
    expect(root.classes()).toContain("is-collapsed")
    expect(root.classes()).toContain("custom-class")
  })

  it("监听 resize 并更新样式中的列间距", async () => {
    const wrapper = mount(Grid, {
      props: { colGap: { xs: 4, md: 12 }, rowGap: { xs: 2, md: 6 } },
      slots: { default: () => "content" },
    })

    expect(addSpy).toHaveBeenCalledWith("resize", expect.any(Function))

    Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: 640 })
    window.dispatchEvent(new Event("resize"))
    await wrapper.vm.$nextTick()

    // 640 命中 xs 配置，间距应使用 xs 值
    const style = (wrapper.element as HTMLElement).getAttribute("style") || ""
    expect(style).toContain("column-gap: 4px;")
    expect(style).toContain("row-gap: 2px;")

    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function))
  })
})
