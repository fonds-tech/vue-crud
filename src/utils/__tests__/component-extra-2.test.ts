import { h, defineComponent } from "vue"
import { it, expect, describe } from "vitest"
import { slotName, componentIs } from "../component"

const Cmp = defineComponent({ name: "Cmp", setup: () => () => h("div") })

describe("component helpers additional", () => {
  it("slotName 支持字符串和配置对象", () => {
    expect(slotName("plain", {})).toBe("plain")
    expect(slotName({ slot: () => "dyn" } as any, { ok: true })).toBe("dyn")
    expect(slotName(undefined as any, {})).toBeUndefined()
  })

  it("componentIs 覆盖字符串/配置对象返回 undefined 情况", () => {
    expect(componentIs("plain", {})).toBeUndefined()
    expect(componentIs({ is: () => "text" } as any, {})).toBe("text")
    // 对象返回 markRaw 组件
    const result = componentIs({ is: Cmp } as any, {}) as any
    expect(result?.name).toBe("Cmp")
  })
})
