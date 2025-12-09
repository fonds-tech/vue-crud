import type { DetailComponent } from "../interface"
import { it, vi, expect, describe } from "vitest"
import {
  slotsOf,
  slotNameOf,
  componentOf,
  componentProps,
  componentSlots,
  componentStyle,
  componentEvents,
  renderSlotValue,
  isDetailComponent,
  renderComponentSlot,
} from "../core/helpers"

const mockData = { name: "测试", value: 100 }

describe("isDetailComponent", () => {
  it("应该识别组件配置对象", () => {
    const component: DetailComponent = { is: "div" }
    expect(isDetailComponent(component)).toBe(true)
  })

  it("应该排除字符串", () => {
    expect(isDetailComponent("slot-name")).toBe(false)
  })

  it("应该排除 undefined", () => {
    expect(isDetailComponent(undefined)).toBe(false)
  })
})

describe("slotNameOf", () => {
  it("返回字符串值", () => {
    expect(slotNameOf("custom-slot", {})).toBe("custom-slot")
  })

  it("解析对象形式的 slot", () => {
    const slot = { slot: "dynamic" }
    expect(slotNameOf(slot, {})).toBe("dynamic")
  })

  it("函数式解析", () => {
    const slot = { slot: (row: any) => row.type }
    expect(slotNameOf(slot, { type: "video" })).toBe("video")
  })
})

describe("componentOf", () => {
  it("排除纯字符串和 slot 对象", () => {
    expect(componentOf("slot-name", {})).toBeUndefined()
    expect(componentOf({ slot: "slot" }, {})).toBeUndefined()
  })

  it("解析组件定义", () => {
    const comp = { is: "el-input" }
    expect(componentOf(comp, {})).toBe("el-input")
  })
})

describe("componentEvents", () => {
  it("空值返回空对象", () => {
    expect(componentEvents(undefined, {})).toEqual({})
  })

  it("解析事件", () => {
    const handler = vi.fn()
    const comp = { is: "el-input", on: { click: handler } }
    const events = componentEvents(comp, {})
    expect(events.click).toBe(handler)
  })
})

describe("componentProps", () => {
  it("解析 function props", () => {
    const comp = {
      is: "input",
      props: (row: any) => ({ value: row.val }),
    }
    expect(componentProps(comp, { val: 123 })).toEqual({ value: 123 })
  })

  it("非组件配置返回空对象", () => {
    expect(componentProps(undefined, mockData)).toEqual({})
    expect(componentProps("slot-name", mockData)).toEqual({})
  })
})

describe("componentStyle", () => {
  it("应该返回组件样式", () => {
    const component: DetailComponent = {
      is: "div",
      style: { color: "red" },
    }
    expect(componentStyle(component, mockData)).toEqual({ color: "red" })
  })

  it("非组件配置返回 undefined", () => {
    expect(componentStyle(undefined, mockData)).toBeUndefined()
    expect(componentStyle("slot-name", mockData)).toBeUndefined()
  })
})

describe("componentSlots", () => {
  it("应该返回组件的插槽配置", () => {
    const component: DetailComponent = {
      is: "div",
      slots: { default: "content", header: "title" },
    }
    const result = componentSlots(component, mockData)
    expect(result).toEqual({ default: "content", header: "title" })
  })

  it("非组件配置应该返回空对象", () => {
    expect(componentSlots(undefined, mockData)).toEqual({})
    expect(componentSlots("slot-name", mockData)).toEqual({})
  })

  it("支持函数式 slots", () => {
    const component: DetailComponent = {
      is: "div",
      slots: data => ({ test: data.name }),
    }
    const result = componentSlots(component, mockData)
    expect(result).toEqual({ test: "测试" })
  })
})

describe("slotsOf", () => {
  it("应该从目标对象提取 slots", () => {
    const target = {
      slots: { label: "custom-label", value: "custom-value" },
    }
    const result = slotsOf(target, mockData)
    expect(result).toEqual({ label: "custom-label", value: "custom-value" })
  })

  it("支持函数式 slots", () => {
    const target = {
      slots: (data: typeof mockData) => ({ dynamic: data.name }),
    }
    const result = slotsOf(target, mockData)
    expect(result).toEqual({ dynamic: "测试" })
  })

  it("无效目标应该返回空对象", () => {
    expect(slotsOf(undefined, mockData)).toEqual({})
    expect(slotsOf({}, mockData)).toEqual({})
    expect(slotsOf({ noSlots: true } as any, mockData)).toEqual({})
  })
})

describe("renderSlotValue", () => {
  it("执行函数式插槽", () => {
    const fn = vi.fn(() => "render")
    expect(renderSlotValue(fn)).toBe("render")
  })

  it("渲染组件插槽", () => {
    const vnode = renderSlotValue("div")
    expect(vnode.type).toBe("div")
  })
})

describe("renderComponentSlot", () => {
  it("应该优先使用用户提供的插槽", () => {
    const component: DetailComponent = {
      is: "div",
      slot: "custom-slot",
    }
    const userSlot = vi.fn(() => "user content")
    const userSlots = { "custom-slot": userSlot }

    renderComponentSlot(component, mockData, {}, userSlots)
    expect(userSlot).toHaveBeenCalled()
  })

  it("应该渲染组件及其子插槽", () => {
    const component: DetailComponent = {
      is: "div",
      props: { class: "test" },
      slots: { default: () => "child content" },
    }
    const result = renderComponentSlot(component, mockData)
    expect(result).toBeDefined()
    expect(result?.type).toBe("div")
  })

  it("无组件时应该返回 null", () => {
    const result = renderComponentSlot("slot-only", mockData)
    expect(result).toBeNull()
  })

  it("应该传递额外属性", () => {
    const component: DetailComponent = {
      is: "span",
    }
    const extra = { "data-test": "value" }
    const result = renderComponentSlot(component, mockData, extra)
    expect(result?.props).toMatchObject(extra)
  })

  it("应该包含组件的 props、style 和 events", () => {
    const onClick = vi.fn()
    const component: DetailComponent = {
      is: "button",
      props: { type: "button" },
      style: { color: "blue" },
      on: { click: onClick },
    }
    const result = renderComponentSlot(component, mockData)
    expect(result?.props).toMatchObject({
      type: "button",
      style: { color: "blue" },
      click: onClick,
    })
  })
})
