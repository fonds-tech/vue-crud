import type { ContextMenuExpose } from "../types"
import { mount } from "@vue/test-utils"
import { useContextMenuCore } from "../core"
import ContextMenu, { contextMenu } from "../index"
import { it, vi, expect, describe } from "vitest"
import { nextTick, defineComponent } from "vue"
import { markTarget, positionMenu, normalizeList, registerOutsideClose, removeHoverHighlight } from "../core/helpers"

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

function getCoreExpose(wrapper: ReturnType<typeof mount>) {
  const vm = wrapper.vm as any
  return vm.$?.exposed ?? vm
}

const CoreTester = defineComponent({
  props: {
    show: Boolean,
    event: Object as () => MouseEvent,
    options: Object,
  },
  setup(props, { expose }) {
    const core = useContextMenuCore(props as any)
    expose(core)
    return () => null
  },
})

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

  it("未传 options 时也能使用默认配置渲染", async () => {
    const wrapper = mount(ContextMenu, {
      props: {
        show: true,
        event: createEvent(),
      },
    })
    await nextTick()
    expect(wrapper.find(".fd-context-menu").exists()).toBe(true)
    wrapper.unmount()
  })

  it("show=true + event 会触发渲染，show 置 false 立即关闭", async () => {
    vi.useFakeTimers()
    const event = createEvent()
    const wrapper = mount(ContextMenu, {
      props: {
        show: true,
        event,
        options: { list: [{ label: "A" }] },
      },
    })
    await nextTick()
    expect(wrapper.find(".fd-context-menu").exists()).toBe(true)

    await wrapper.setProps({ show: false })
    vi.runAllTimers()
    await nextTick()
    expect(wrapper.find(".fd-context-menu").exists()).toBe(false)
    wrapper.unmount()
    vi.useRealTimers()
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

  it("回调项点击后自动关闭", async () => {
    vi.useFakeTimers()
    const onClick = vi.fn()
    const wrapper = mount(ContextMenu, {
      props: {
        options: { list: [{ label: "回调", onClick }] },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    await wrapper.find(".fd-context-menu__item span").trigger("click")
    expect(onClick).toHaveBeenCalled()
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

  it("自定义 document 环境下也能创建和清理宿主", async () => {
    vi.useFakeTimers()
    const customDoc = document.implementation.createHTMLDocument("custom")
    const hostBody = customDoc.body
    const target = customDoc.createElement("div")
    hostBody.appendChild(target)
    const event = createEvent(target)
    Object.defineProperty(event, "target", { value: target })
    const exposed = contextMenu.open(event, { document: customDoc, list: [{ label: "自定义" }] })
    await nextTick()
    expect(hostBody.querySelector(".fd-context-menu")).not.toBeNull()
    exposed?.close()
    vi.runAllTimers()
    await nextTick()
    expect(hostBody.querySelector(".fd-context-menu")).toBeNull()
    vi.useRealTimers()
  })

  it("无 target 且传入 document 时仍使用该 document 并可清理", async () => {
    vi.useFakeTimers()
    const customDoc = document.implementation.createHTMLDocument("no-target")
    const event = createEvent(undefined)
    const exposed = contextMenu.open(event, { document: customDoc, list: [{ label: "noop" }] })
    await nextTick()
    expect(customDoc.body.querySelector(".fd-context-menu")).not.toBeNull()
    exposed.close()
    vi.runAllTimers()
    await nextTick()
    expect(customDoc.body.querySelector(".fd-context-menu")).toBeNull()
    vi.useRealTimers()
  })

  it("无 target 且无自定义 document 时回退到全局 document", async () => {
    vi.useFakeTimers()
    const event = createEvent(undefined)
    const exposed = contextMenu.open(event, { list: [{ label: "global" }] })
    await nextTick()
    expect(document.body.querySelector(".fd-context-menu")).not.toBeNull()
    exposed.close()
    vi.runAllTimers()
    await nextTick()
    expect(document.body.querySelector(".fd-context-menu")).toBeNull()
    vi.useRealTimers()
  })
})

describe("contextMenu 边缘情况", () => {
  it("禁用项点击无响应", async () => {
    const onClick = vi.fn()
    const wrapper = mount(ContextMenu, {
      props: {
        options: {
          list: [{ label: "禁用项", disabled: true, onClick }],
        },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    const item = wrapper.find(".fd-context-menu__item")
    expect(item.classes()).toContain("is-disabled")
    await item.trigger("click")
    expect(onClick).not.toHaveBeenCalled()
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
    const onClick = vi.fn()
    const wrapper = mount(ContextMenu, {
      props: {
        options: { list: [{ label: "回调", onClick }] },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    await wrapper.find(".fd-context-menu__item").trigger("keydown", { key: "Enter" })
    expect(onClick).toHaveBeenCalled()
    wrapper.unmount()
  })

  it("arrowUp/arrowDown 在同级菜单间移动焦点", async () => {
    const wrapper = mount(ContextMenu, {
      props: {
        options: { list: [{ label: "一" }, { label: "二" }] },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    const items = wrapper.findAll(".fd-context-menu__item")
    const first = items[0]
    const second = items[1]
    const focusSpy = vi.fn()
    ;(second.element as HTMLElement).focus = focusSpy

    await first.trigger("keydown", { key: "ArrowDown" })
    expect(focusSpy).toHaveBeenCalled()

    const backFocusSpy = vi.fn()
    ;(first.element as HTMLElement).focus = backFocusSpy
    await second.trigger("keydown", { key: "ArrowUp" })
    expect(backFocusSpy).toHaveBeenCalled()
    wrapper.unmount()
  })

  it("按空格键触发项目", async () => {
    const onClick = vi.fn()
    const wrapper = mount(ContextMenu, {
      props: {
        options: { list: [{ label: "回调", onClick }] },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    await wrapper.find(".fd-context-menu__item").trigger("keydown", { key: " " })
    expect(onClick).toHaveBeenCalled()
    wrapper.unmount()
  })

  it("禁用项按键时不会触发回调", async () => {
    const onClick = vi.fn()
    const wrapper = mount(ContextMenu, {
      props: {
        options: { list: [{ label: "禁用", disabled: true, onClick }] },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    await wrapper.find(".fd-context-menu__item").trigger("keydown", { key: "Enter" })
    expect(onClick).not.toHaveBeenCalled()
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

  it("有子菜单时默认渲染右箭头图标", async () => {
    const wrapper = mount(ContextMenu, {
      props: {
        options: { list: [{ label: "父", children: [{ label: "子" }] }] },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    const item = wrapper.find(".fd-context-menu__item")
    expect(item.findAll(".fd-context-menu__icon")[0]?.classes()).toContain("fd-icon-right")
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

  it("hover.target 会向上寻找匹配的祖先元素", async () => {
    const parent = document.createElement("div")
    parent.className = "cell"
    const child = document.createElement("span")
    parent.appendChild(child)

    const event = createEvent(child)
    const wrapper = mount(ContextMenu, {
      props: {
        options: { hover: { target: "cell", className: "hovered" }, list: [{ label: "A" }] },
      },
    })
    getExpose(wrapper).open(event)
    await nextTick()

    expect(parent.classList.contains("hovered")).toBe(true)
    getExpose(wrapper).close()
    wrapper.unmount()
  })

  it("watch show 变更会触发 open 调用", async () => {
    const event = createEvent()
    const wrapper = mount(ContextMenu, {
      props: {
        show: false,
        event,
        options: { list: [{ label: "A" }] },
      },
    })
    await wrapper.setProps({ show: true })
    await nextTick()
    expect(wrapper.find(".fd-context-menu").exists()).toBe(true)
    wrapper.unmount()
  })

  it("hover 关闭后卸载时仍会清理高亮", async () => {
    const target = document.createElement("div")
    const wrapper = mount(ContextMenu, {
      props: {
        options: { hover: true, list: [{ label: "A" }] },
      },
    })
    const event = createEvent(target)
    getExpose(wrapper).open(event)
    await nextTick()
    expect(target.classList.contains("fd-context-menu__target")).toBe(true)

    wrapper.unmount()
    expect(target.classList.contains("fd-context-menu__target")).toBe(false)
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

  it("options.list 变更时会重新渲染列表", async () => {
    const wrapper = mount(ContextMenu, {
      props: {
        options: { list: [{ label: "A" }] },
      },
    })
    getExpose(wrapper).open(createEvent())
    await nextTick()
    expect(wrapper.findAll(".fd-context-menu__item")).toHaveLength(1)

    await wrapper.setProps({ options: { list: [{ label: "A" }, { label: "B" }] } })
    await nextTick()
    expect(wrapper.findAll(".fd-context-menu__item")).toHaveLength(2)
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

  it("点击菜单外部会关闭并移除宿主", async () => {
    vi.useFakeTimers()
    const wrapper = mount(ContextMenu, {
      props: {
        options: { list: [{ label: "外部" }] },
      },
    })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    vi.runAllTimers()
    await nextTick()

    expect(wrapper.find(".fd-context-menu").exists()).toBe(false)
    wrapper.unmount()
    vi.useRealTimers()
  })

  it("options.class 变更时同步额外类名", async () => {
    const options = { class: "first-menu", list: [{ label: "A" }] }
    const wrapper = mount(ContextMenu, { props: { options } })
    const event = createEvent()
    getExpose(wrapper).open(event)
    await nextTick()
    expect(wrapper.find(".fd-context-menu").classes()).toContain("first-menu")

    await wrapper.setProps({ options: { ...options, class: "second-menu" } })
    await nextTick()
    expect(wrapper.find(".fd-context-menu").classes()).toContain("second-menu")
    expect(wrapper.find(".fd-context-menu").classes()).not.toContain("first-menu")
    wrapper.unmount()
  })

  it("positionMenu 会在视口边界内收敛坐标", async () => {
    const style = { top: "0px", left: "0px" }
    const menuElement = document.createElement("div")
    Object.defineProperty(menuElement, "clientWidth", { value: 200, configurable: true })
    Object.defineProperty(menuElement, "clientHeight", { value: 200, configurable: true })

    const widthSpy = vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(100)
    const heightSpy = vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(100)
    const target = document.createElement("div")
    const event = createEvent(target, 80, 80)

    await positionMenu(event, menuElement, style)
    expect(style.left).toBe("5px")
    expect(style.top).toBe("5px")

    widthSpy.mockRestore()
    heightSpy.mockRestore()
  })

  it("onContextmenu 会阻止默认行为", async () => {
    const wrapper = mount(ContextMenu, {
      props: { show: true, event: createEvent(), options: { list: [{ label: "A" }] } },
    })
    await nextTick()
    const menu = wrapper.find(".fd-context-menu")
    const evt = new Event("contextmenu", { bubbles: true, cancelable: true })
    menu.element.dispatchEvent(evt)
    expect(evt.defaultPrevented).toBe(true)
    wrapper.unmount()
  })

  it("open 时会清理旧的关闭定时器并保持可见", async () => {
    vi.useFakeTimers()
    const wrapper = mount(ContextMenu, {
      props: { options: { list: [{ label: "A" }] } },
    })
    const exposed = getExpose(wrapper)
    exposed.open(createEvent())
    await nextTick()
    exposed.close()
    vi.advanceTimersByTime(50)

    exposed.open(createEvent())
    await nextTick()
    expect(wrapper.find(".fd-context-menu").exists()).toBe(true)
    wrapper.unmount()
    vi.useRealTimers()
  })
})

describe("helpers", () => {
  it("normalizeList 会深拷贝并重置 _showChildren", () => {
    const list = [{ label: "父", children: [{ label: "子" }] }]
    const normalized = normalizeList(list)
    expect(normalized).not.toBe(list)
    expect(normalized[0]._showChildren).toBe(false)
    expect(normalized[0].children?.[0]._showChildren).toBe(false)
  })

  it("normalizeList 在未传值时返回空数组", () => {
    const normalized = normalizeList()
    expect(normalized).toEqual([])
  })

  it("markTarget 无 hover 配置时不处理目标", () => {
    const hoverTarget = { value: null } as any
    const hoverClassName = { value: "" } as any
    const target = document.createElement("div")
    const event = createEvent(target)
    markTarget(event, undefined, hoverTarget, hoverClassName)
    expect(target.classList.contains("fd-context-menu__target")).toBe(false)
    expect(hoverTarget.value).toBeNull()
  })

  it("markTarget 会记录目标引用并添加类名", () => {
    const hoverTarget = { value: null } as any
    const hoverClassName = { value: "" } as any
    const target = document.createElement("div")
    const event = createEvent(target)
    markTarget(event, true, hoverTarget, hoverClassName)
    expect(hoverTarget.value).toBe(target)
    expect(target.classList.contains("fd-context-menu__target")).toBe(true)
  })

  it("markTarget 未找到匹配节点时保持为空", () => {
    const hoverTarget = { value: null } as any
    const hoverClassName = { value: "" } as any
    const target = document.createElement("div")
    const event = createEvent(target)
    markTarget(event, { target: "cell" }, hoverTarget, hoverClassName)
    expect(hoverTarget.value).toBeNull()
    expect(target.classList.contains("fd-context-menu__target")).toBe(false)
  })

  it("removeHoverHighlight 会清除旧的高亮类名", () => {
    const target = document.createElement("div")
    target.className = "cell hovered"
    const hoverTarget = { value: target } as any
    const hoverClassName = { value: "hovered" } as any
    removeHoverHighlight(hoverTarget, hoverClassName)
    expect(target.classList.contains("hovered")).toBe(false)
    expect(hoverTarget.value).toBeNull()
  })

  it("positionMenu 在没有菜单元素时直接返回", async () => {
    const style = { top: "10px", left: "10px" }
    await positionMenu(createEvent(), null, style)
    expect(style.top).toBe("10px")
    expect(style.left).toBe("10px")
  })

  it("positionMenu 在足够空间时保持原位置", async () => {
    const style = { top: "0px", left: "0px" }
    const menuElement = document.createElement("div")
    Object.defineProperty(menuElement, "clientWidth", { value: 50, configurable: true })
    Object.defineProperty(menuElement, "clientHeight", { value: 50, configurable: true })
    const widthSpy = vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(500)
    const heightSpy = vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(500)
    const event = createEvent(document.createElement("div"), 20, 20)
    await positionMenu(event, menuElement, style)
    expect(style.left).toBe("20px")
    expect(style.top).toBe("20px")
    widthSpy.mockRestore()
    heightSpy.mockRestore()
  })

  it("registerOutsideClose 仅在菜单外点击时触发", async () => {
    const menu = document.createElement("div")
    const inner = document.createElement("span")
    menu.appendChild(inner)
    const close = vi.fn()
    const cleanup: Array<() => void> = []
    registerOutsideClose(document, menu, close, cleanup)

    inner.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    expect(close).not.toHaveBeenCalled()

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    expect(close).toHaveBeenCalledTimes(1)

    cleanup[0]()
  })

  it("registerOutsideClose 当点击菜单本身时不会触发关闭", () => {
    const menu = document.createElement("div")
    const close = vi.fn()
    const cleanup: Array<() => void> = []
    registerOutsideClose(document, menu, close, cleanup)
    menu.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    expect(close).not.toHaveBeenCalled()
    cleanup[0]()
  })

  it("registerOutsideClose 在无菜单元素时直接忽略", () => {
    const close = vi.fn()
    const cleanup: Array<() => void> = []
    registerOutsideClose(document, null, close, cleanup)
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    expect(close).not.toHaveBeenCalled()
    cleanup[0]()
  })
})

describe("core", () => {
  it("close 会清理已有的关闭定时器", async () => {
    vi.useFakeTimers()
    const wrapper = mount(CoreTester, { props: { options: { list: [{ label: "A" }] } } })
    const core = getCoreExpose(wrapper)
    await nextTick()
    core.open(createEvent())
    await nextTick()
    core.close()
    core.close()
    vi.runAllTimers()
    expect(core.visible?.value ?? false).toBe(false)
    wrapper.unmount()
    vi.useRealTimers()
  })

  it("open 后立刻 close(true) 会跳过后续定位逻辑", async () => {
    vi.useFakeTimers()
    const wrapper = mount(CoreTester, { props: { options: { list: [{ label: "A" }] } } })
    const core = getCoreExpose(wrapper)
    await nextTick()
    core.open(createEvent())
    core.close(true)
    vi.runAllTimers()
    await nextTick()
    expect(core.visible?.value ?? false).toBe(false)
    wrapper.unmount()
    vi.useRealTimers()
  })

  it("open 后立即标记不可见时，nextTick 回调会跳过定位", async () => {
    const wrapper = mount(CoreTester, { props: { options: { list: [{ label: "A" }] } } })
    const core = getCoreExpose(wrapper)
    core.open(createEvent())
    core.visible.value = false
    await nextTick()
    expect(core.visible.value).toBe(false)
    wrapper.unmount()
  })

  it("watch class 会更新 extraClass", async () => {
    const wrapper = mount(CoreTester, { props: { options: { class: "first", list: [{ label: "A" }] } } })
    const core = getCoreExpose(wrapper)
    await nextTick()
    expect(core.extraClass.value).toBe("first")
    await wrapper.setProps({ options: { class: "second", list: [{ label: "A" }] } })
    await nextTick()
    expect(core.extraClass.value).toBe("second")
    wrapper.unmount()
  })

  it("watch class 在 falsy 时不会覆盖已有值", async () => {
    const wrapper = mount(CoreTester, { props: { options: { class: "first", list: [{ label: "A" }] } } })
    const core = getCoreExpose(wrapper)
    await nextTick()
    await wrapper.setProps({ options: { class: "", list: [{ label: "A" }] } })
    await nextTick()
    expect(core.extraClass.value).toBe("first")
    wrapper.unmount()
  })

  it("watch show=true 会调用 open", async () => {
    const event = createEvent()
    const wrapper = mount(CoreTester, { props: { show: false, event, options: { list: [{ label: "A" }] } } })
    const core = getCoreExpose(wrapper)
    await wrapper.setProps({ show: true })
    await nextTick()
    expect(core.visible.value).toBe(true)
    wrapper.unmount()
  })

  it("watch show=false 会调用 close(true)", async () => {
    vi.useFakeTimers()
    const event = createEvent()
    const wrapper = mount(CoreTester, { props: { show: true, event, options: { list: [{ label: "A" }] } } })
    const core = getCoreExpose(wrapper)
    await nextTick()
    expect(core.visible.value).toBe(true)
    await wrapper.setProps({ show: false })
    vi.runAllTimers()
    await nextTick()
    expect(core.visible.value).toBe(false)
    wrapper.unmount()
    vi.useRealTimers()
  })

  it("handleItemClick 针对禁用项时提前返回", async () => {
    const wrapper = mount(CoreTester, { props: { options: { list: [{ label: "禁用", disabled: true }] } } })
    const core = wrapper.vm as any
    await nextTick()
    const item = { label: "禁用", disabled: true }
    expect(() => core.handleItemClick(item, "0-0")).not.toThrow()
    wrapper.unmount()
  })
})
