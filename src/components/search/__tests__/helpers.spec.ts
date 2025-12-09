import { it, vi, expect, describe } from "vitest"
import { resolveComponent, renderDynamicComponent } from "../core/helpers"

describe("resolveComponent", () => {
  it("当 component 未定义时返回 undefined", () => {
    const action = { type: "search" }
    expect(resolveComponent(action as any, "props", {})).toBeUndefined()
  })

  it("当 component 属性存在时解析对应值", () => {
    const action = {
      type: "search",
      component: {
        is: "el-input",
        props: { placeholder: "search" },
      },
    }
    expect(resolveComponent(action as any, "is", {})).toBe("el-input")
    expect(resolveComponent(action as any, "props", {})).toEqual({ placeholder: "search" })
  })

  it("支持函数式解析", () => {
    const action = {
      type: "search",
      component: {
        props: (model: any) => ({ placeholder: model.text }),
      },
    }
    const model = { text: "dynamic" }
    expect(resolveComponent(action as any, "props", model)).toEqual({ placeholder: "dynamic" })
  })
})

describe("renderDynamicComponent", () => {
  it("应该渲染基础组件", () => {
    const vnode = renderDynamicComponent("div", {}, {})
    expect(vnode).toBeDefined()
    expect(vnode.type).toBe("div")
  })

  it("应该渲染带属性的组件", () => {
    const props = { id: "test-id", class: "test-class" }
    const vnode = renderDynamicComponent("div", props, {})
    expect(vnode.props).toMatchObject(props)
  })

  it("应该渲染带事件的组件", () => {
    const onClick = vi.fn()
    const events = { onClick }
    const vnode = renderDynamicComponent("button", {}, events)
    expect(vnode.props).toHaveProperty("onClick")
    expect(vnode.props?.onClick).toBe(onClick)
  })

  it("应该渲染带样式的组件", () => {
    const style = { color: "red", fontSize: "14px" }
    const vnode = renderDynamicComponent("span", {}, {}, style)
    expect(vnode.props?.style).toEqual(style)
  })

  it("应该渲染带插槽的组件", () => {
    const slots = {
      default: () => "Default content",
      header: () => "Header content",
    }
    const vnode = renderDynamicComponent("div", {}, {}, undefined, slots)
    // VNode 的 children 会被渲染成第一个slot的内容
    expect(vnode.children).toBeDefined()
  })

  it("应该合并属性、事件和样式", () => {
    const props = { id: "combo" }
    const events = { onClick: vi.fn() }
    const style = { padding: "10px" }
    const vnode = renderDynamicComponent("div", props, events, style)

    expect(vnode.props).toMatchObject({
      id: "combo",
      style: { padding: "10px" },
      onClick: expect.any(Function),
    })
  })
})
