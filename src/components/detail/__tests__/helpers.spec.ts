import { it, vi, expect, describe } from "vitest"
import { slotNameOf, componentOf, componentProps, componentEvents, renderSlotValue } from "../core/helpers"

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
