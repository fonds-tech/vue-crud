import type { ContextMenuExpose } from "../types"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import ContextMenu, { contextMenu } from "../index"
import { it, vi, expect, describe } from "vitest"

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
    const wrapper = mount(ContextMenu, {
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
    const wrapper = mount(ContextMenu, {
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
    const wrapper = mount(ContextMenu, {
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
    const wrapper = mount(ContextMenu, {
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
    const exposed = contextMenu.open(event, { list: [{ label: "动态" }] })
    await nextTick()
    expect(document.body.querySelector(".fd-context-menu")).not.toBeNull()

    exposed?.close()
    vi.runAllTimers()
    await nextTick()
    expect(document.body.querySelector(".fd-context-menu")).toBeNull()
    vi.useRealTimers()
  })
})

describe("contextMenu 边缘情况", () => {
  it("禁用项点击无响应", async () => {
    const callback = vi.fn()
    const wrapper = mount(ContextMenu, {
      props: {
        options: {
          list: [{ label: "禁用项", disabled: true, callback }],
        },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    const item = wrapper.find(".fd-context-menu__item")
    expect(item.classes()).toContain("is-disabled")
    await item.trigger("click")
    expect(callback).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it("按 Escape 键关闭菜单", async () => {
    vi.useFakeTimers()
    const wrapper = mount(ContextMenu, {
      props: {
        options: { list: [{ label: "项目" }] },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    await wrapper.find(".fd-context-menu__item").trigger("keydown", { key: "Escape" })
    vi.runAllTimers()
    await nextTick()
    expect(wrapper.find(".fd-context-menu").exists()).toBe(false)
    wrapper.unmount()
    vi.useRealTimers()
  })

  it("按 Enter 键触发项目", async () => {
    const callback = vi.fn()
    const wrapper = mount(ContextMenu, {
      props: {
        options: { list: [{ label: "回调", callback }] },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    await wrapper.find(".fd-context-menu__item").trigger("keydown", { key: "Enter" })
    expect(callback).toHaveBeenCalled()
    wrapper.unmount()
  })

  it("按空格键触发项目", async () => {
    const callback = vi.fn()
    const wrapper = mount(ContextMenu, {
      props: {
        options: { list: [{ label: "回调", callback }] },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    await wrapper.find(".fd-context-menu__item").trigger("keydown", { key: " " })
    expect(callback).toHaveBeenCalled()
    wrapper.unmount()
  })

  it("渲染 prefixIcon 和 suffixIcon", async () => {
    const wrapper = mount(ContextMenu, {
      props: {
        options: {
          list: [{ label: "带图标", prefixIcon: "icon-add", suffixIcon: "icon-arrow" }],
        },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    const icons = wrapper.findAll(".fd-context-menu__icon")
    expect(icons.length).toBe(2)
    expect(icons[0].classes()).toContain("icon-add")
    expect(icons[1].classes()).toContain("icon-arrow")
    wrapper.unmount()
  })

  it("无 event 时 open 不渲染菜单", async () => {
    const wrapper = mount(ContextMenu, {
      props: {
        options: { list: [{ label: "项目" }] },
      },
    })
    getExpose(wrapper).open(undefined as any)
    await nextTick()
    expect(wrapper.find(".fd-context-menu").exists()).toBe(false)
    wrapper.unmount()
  })

  it("hover 为 true 时使用默认高亮类名", async () => {
    const target = document.createElement("div")
    const event = createEvent(target)
    const wrapper = mount(ContextMenu, {
      props: {
        options: { hover: true, list: [{ label: "A" }] },
      },
    })
    getExpose(wrapper).open(event)
    await nextTick()
    expect(target.classList.contains("fd-context-menu__target")).toBe(true)
    wrapper.unmount()
  })

  it("点击无子菜单的叶子节点关闭菜单", async () => {
    vi.useFakeTimers()
    const wrapper = mount(ContextMenu, {
      props: {
        options: { list: [{ label: "叶子节点" }] },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    await wrapper.find(".fd-context-menu__item").trigger("click")
    vi.runAllTimers()
    await nextTick()
    expect(wrapper.find(".fd-context-menu").exists()).toBe(false)
    wrapper.unmount()
    vi.useRealTimers()
  })

  it("ellipsis 默认为 true", async () => {
    const wrapper = mount(ContextMenu, {
      props: {
        options: { list: [{ label: "长文本" }] },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    expect(wrapper.find(".fd-context-menu__item").classes()).toContain("is-ellipsis")
    wrapper.unmount()
  })

  it("ellipsis 为 false 时不添加省略类名", async () => {
    const wrapper = mount(ContextMenu, {
      props: {
        options: { list: [{ label: "不省略", ellipsis: false }] },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    expect(wrapper.find(".fd-context-menu__item").classes()).not.toContain("is-ellipsis")
    wrapper.unmount()
  })

  it("使用自定义插槽内容", async () => {
    const wrapper = mount(ContextMenu, {
      props: {
        options: { list: [{ label: "默认" }] },
      },
      slots: {
        default: "<div class='custom-content'>自定义内容</div>",
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    expect(wrapper.find(".custom-content").exists()).toBe(true)
    expect(wrapper.find(".custom-content").text()).toBe("自定义内容")
    wrapper.unmount()
  })
})
