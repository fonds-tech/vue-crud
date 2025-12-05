import type { ContextMenuExpose } from "../type"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import { it, vi, expect, describe } from "vitest"
import { ContextMenu, FdContextMenu } from "../context-menu"

function createEvent(target?: HTMLElement, x = 10, y = 10) {
  const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: x, clientY: y })
  if (target) {
    Object.defineProperty(event, "target", { value: target })
  }
  return event as MouseEvent
}

function getExpose(wrapper: ReturnType<typeof mount>) {
  return wrapper.vm as unknown as ContextMenuExpose
}

describe("contextMenu", () => {
  it("open 渲染菜单并忽略隐藏项", async () => {
    const target = document.createElement("div")
    const event = createEvent(target)
    const wrapper = mount(FdContextMenu, {
      props: {
        show: true,
        event,
        options: {
          class: "custom-menu",
          list: [{ label: "显示" }, { label: "隐藏", hidden: true }],
        },
      },
    })
    await nextTick()
    expect(wrapper.find(".fd-context-menu").exists()).toBe(true)
    expect(wrapper.find(".fd-context-menu").classes()).toContain("custom-menu")
    expect(wrapper.findAll(".fd-context-menu__item")).toHaveLength(1)
    wrapper.unmount()
  })

  it("点击父项可展开子菜单并标记激活态", async () => {
    const wrapper = mount(FdContextMenu, {
      props: {
        options: {
          list: [{ label: "父级", children: [{ label: "子级" }] }],
        },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    const parent = wrapper.find(".fd-context-menu__item")
    await parent.find("span").trigger("click")
    await nextTick()
    expect(wrapper.findAll(".fd-context-menu__list")).toHaveLength(2)
    expect(parent.classes()).toContain("is-active")
    wrapper.unmount()
  })

  it("回调项可触发关闭", async () => {
    vi.useFakeTimers()
    const callback = vi.fn((close: () => void) => close())
    const wrapper = mount(FdContextMenu, {
      props: {
        options: { list: [{ label: "回调", callback }] },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    await wrapper.find(".fd-context-menu__item span").trigger("click")
    expect(callback).toHaveBeenCalled()
    vi.runAllTimers()
    await nextTick()
    expect(wrapper.find(".fd-context-menu").exists()).toBe(false)
    wrapper.unmount()
    vi.useRealTimers()
  })

  it("hover 配置会添加并清理目标高亮", async () => {
    const target = document.createElement("div")
    target.className = "cell"
    const event = createEvent(target)
    const wrapper = mount(FdContextMenu, {
      props: {
        options: { hover: { target: "cell", className: "hovered" }, list: [{ label: "A" }] },
      },
    })
    getExpose(wrapper).open(event)
    await nextTick()
    expect(target.classList.contains("hovered")).toBe(true)

    getExpose(wrapper).close()
    await nextTick()
    expect(target.classList.contains("hovered")).toBe(false)
    wrapper.unmount()
  })
})

describe("contextMenu.open", () => {
  it("关闭后销毁宿主元素", async () => {
    vi.useFakeTimers()
    const target = document.createElement("div")
    const event = createEvent(target)
    const exposed = ContextMenu.open(event, { list: [{ label: "动态" }] })
    await nextTick()
    expect(document.body.querySelector(".fd-context-menu")).not.toBeNull()

    exposed?.close()
    vi.runAllTimers()
    await nextTick()
    expect(document.body.querySelector(".fd-context-menu")).toBeNull()
    vi.useRealTimers()
  })
})
