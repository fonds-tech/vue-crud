import { h } from "vue"
import { it, expect, describe } from "vitest"
import { parse, isConfig, slotName, componentIs } from "../component"

describe("utils/component 分支补测", () => {
  it("识别配置对象与组件/VNode", () => {
    expect(isConfig(undefined)).toBe(false)
    expect(isConfig(h("div"))).toBe(false)
    expect(isConfig({ is: "el-button" })).toBe(true)
  })

  it("parse 处理字符串插槽名、VNode、组件与配置对象", () => {
    const ctx = { disabled: true }
    const vnode = h("span", "text")
    const component = { setup: () => () => h("div") }

    expect(parse<string>("custom-slot", ctx as any).slotName).toBe("custom-slot")
    expect(parse(vnode, ctx).is).toBe(vnode)
    expect(parse(component as any, ctx).is).toBe(component)

    const cfg = parse(
      {
        is: () => "el-input",
        props: () => ({ disabled: true }),
        style: () => ({ color: "red" }),
        on: () => ({ click: () => "ok" }),
        slots: () => ({ default: () => "slot" }),
        slot: () => "named",
        ref: "ref-el",
      },
      ctx,
    )

    expect(cfg.is).toBe("el-input")
    expect(cfg.props).toEqual({ disabled: true })
    expect(cfg.style).toEqual({ color: "red" })
    expect(cfg.events.click).toBeDefined()
    expect(cfg.slots.default).toBeDefined()
    expect(cfg.slotName).toBe("named")
    expect(cfg.ref).toBe("ref-el")
  })

  it("componentIs/slotName 边界", () => {
    expect(componentIs(undefined, {})).toBeUndefined()
    expect(componentIs("slot-name", {})).toBeUndefined()
    const comp = { setup: () => () => h("div") }
    expect(componentIs(comp as any, {})).toBe(comp)

    const resolved = componentIs({ is: () => h("p") }, {})
    expect(resolved && typeof resolved === "object").toBe(true)

    expect(slotName(undefined, {})).toBeUndefined()
    expect(slotName("named", {})).toBe("named")
    expect(slotName({ slot: () => "from-fn" } as any, {})).toBe("from-fn")
  })
})
