import { mount } from "@vue/test-utils"
import { useBrowser } from "../useBrowser"
import { h, defineComponent } from "vue"
import { it, vi, expect, describe, afterEach, beforeEach } from "vitest"

describe("useBrowser", () => {
  const originalWidth = window.innerWidth
  const originalHeight = window.innerHeight
  let addSpy: ReturnType<typeof vi.spyOn>
  let removeSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    addSpy = vi.spyOn(window, "addEventListener")
    removeSpy = vi.spyOn(window, "removeEventListener")
  })

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: originalWidth })
    Object.defineProperty(window, "innerHeight", { configurable: true, writable: true, value: originalHeight })
    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it("初始化并响应 resize 事件", async () => {
    const App = defineComponent({
      setup() {
        const state = useBrowser()
        return () => h("div", { "data-width": state.width, "data-mini": state.isMini })
      },
    })

    const wrapper = mount(App)
    expect(addSpy).toHaveBeenCalledWith("resize", expect.any(Function))

    Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: 500 })
    Object.defineProperty(window, "innerHeight", { configurable: true, writable: true, value: 600 })
    window.dispatchEvent(new Event("resize"))
    await wrapper.vm.$nextTick()

    expect(wrapper.attributes("data-width")).toBe("500")
    expect(wrapper.attributes("data-mini")).toBe("true")

    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function))
  })
})
