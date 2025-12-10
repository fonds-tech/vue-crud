import { ref, computed } from "vue"
import { useComponentHelper } from "../core/helpers"
import { it, expect, describe } from "vitest"

describe("useComponentHelper", () => {
  it("注入 slot props", () => {
    const helper = useComponentHelper({
      mode: ref("add"),
      formModel: computed(() => ({ name: "Alice" })),
      loading: ref(true),
    })
    const slotProps = helper.createSlotProps({ value: 1 })
    expect(slotProps).toMatchObject({ value: 1, mode: "add", model: { name: "Alice" }, loading: true })
  })

  it("解析 component 与插槽名称", () => {
    const helper = useComponentHelper({
      mode: ref("add"),
      formModel: computed(() => ({ name: "Alice" })),
      loading: ref(false),
    })
    const cfg = {
      is: () => "el-button",
      slot: "custom",
      props: (model: any) => ({ label: model.name }),
      slots: { default: () => "ok" },
    }
    expect(helper.slotNameOf(cfg as any)).toBe("custom")
    expect(helper.componentOf(cfg as any)).toBe("el-button")
    expect(helper.componentProps(cfg as any)).toEqual({ label: "Alice" })
  })

  describe("componentStyle", () => {
    it("解析静态样式", () => {
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({})),
        loading: ref(false),
      })
      const cfg = {
        is: "el-button",
        style: { color: "red", fontSize: "14px" },
      }

      expect(helper.componentStyle(cfg as any)).toEqual({ color: "red", fontSize: "14px" })
    })

    it("解析函数型样式", () => {
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({ theme: "dark" })),
        loading: ref(false),
      })
      const cfg = {
        is: "el-button",
        style: (model: any) => ({ backgroundColor: model.theme === "dark" ? "#333" : "#fff" }),
      }

      expect(helper.componentStyle(cfg as any)).toEqual({ backgroundColor: "#333" })
    })

    it("component 为空时返回 undefined", () => {
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({})),
        loading: ref(false),
      })

      expect(helper.componentStyle(undefined)).toBeUndefined()
      expect(helper.componentStyle(null as any)).toBeUndefined()
    })
  })

  describe("componentEvents", () => {
    it("解析静态事件对象", () => {
      const onClick = () => {}
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({})),
        loading: ref(false),
      })
      const cfg = {
        is: "el-button",
        on: { click: onClick },
      }

      expect(helper.componentEvents(cfg as any)).toEqual({ click: onClick })
    })

    it("解析函数型事件对象", () => {
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({ id: 1 })),
        loading: ref(false),
      })
      const cfg = {
        is: "el-button",
        on: (model: any) => ({
          click: () => console.log(model.id),
        }),
      }

      const events = helper.componentEvents(cfg as any)
      expect(events).toHaveProperty("click")
    })

    it("component 为空时返回空对象", () => {
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({})),
        loading: ref(false),
      })

      expect(helper.componentEvents(undefined)).toEqual({})
      expect(helper.componentEvents(null as any)).toEqual({})
    })

    it("无 on 属性时返回空对象", () => {
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({})),
        loading: ref(false),
      })
      const cfg = { is: "el-button" }

      expect(helper.componentEvents(cfg as any)).toEqual({})
    })
  })

  describe("componentSlots", () => {
    it("解析静态 slots 对象", () => {
      const defaultSlot = () => "default content"
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({})),
        loading: ref(false),
      })
      const cfg = {
        is: "el-button",
        slots: { default: defaultSlot, prefix: () => "prefix" },
      }

      const slots = helper.componentSlots(cfg as any)
      expect(slots).toHaveProperty("default")
      expect(slots).toHaveProperty("prefix")
    })

    it("解析函数型 slots", () => {
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({ label: "动态" })),
        loading: ref(false),
      })
      const cfg = {
        is: "el-button",
        slots: (model: any) => ({
          default: () => model.label,
        }),
      }

      const slots = helper.componentSlots(cfg as any)
      expect(slots).toHaveProperty("default")
    })

    it("component 为空时返回空对象", () => {
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({})),
        loading: ref(false),
      })

      expect(helper.componentSlots(undefined)).toEqual({})
      expect(helper.componentSlots(null as any)).toEqual({})
    })

    it("无 slots 属性时返回空对象", () => {
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({})),
        loading: ref(false),
      })
      const cfg = { is: "el-button" }

      expect(helper.componentSlots(cfg as any)).toEqual({})
    })
  })

  describe("componentOf 边界情况", () => {
    it("component 为字符串时直接返回", () => {
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({})),
        loading: ref(false),
      })

      expect(helper.componentOf("el-button")).toBe("el-button")
    })

    it("component 为函数时直接返回", () => {
      const MyComponent = () => null
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({})),
        loading: ref(false),
      })

      expect(helper.componentOf(MyComponent as any)).toBe(MyComponent)
    })

    it("component 为 undefined 时返回 undefined", () => {
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({})),
        loading: ref(false),
      })

      expect(helper.componentOf(undefined)).toBeUndefined()
    })

    it("is 是静态字符串时正确解析", () => {
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({})),
        loading: ref(false),
      })
      const cfg = { is: "el-input" }

      expect(helper.componentOf(cfg as any)).toBe("el-input")
    })

    it("配置对象不含 is 属性时返回 undefined", () => {
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({})),
        loading: ref(false),
      })
      // 这是一个对象但不是组件配置（没有 is 属性）
      const invalidCfg = { props: { label: "test" } }

      expect(helper.componentOf(invalidCfg as any)).toBeUndefined()
    })
  })

  describe("slotNameOf 边界情况", () => {
    it("无 slot 属性时返回 undefined", () => {
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({})),
        loading: ref(false),
      })
      const cfg = { is: "el-button" }

      expect(helper.slotNameOf(cfg as any)).toBeUndefined()
    })

    it("component 不是配置对象时返回 undefined", () => {
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({})),
        loading: ref(false),
      })

      expect(helper.slotNameOf("el-button")).toBeUndefined()
      expect(helper.slotNameOf(() => null as any)).toBeUndefined()
    })
  })

  describe("componentProps 边界情况", () => {
    it("无 props 属性时返回空对象", () => {
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({})),
        loading: ref(false),
      })
      const cfg = { is: "el-button" }

      expect(helper.componentProps(cfg as any)).toEqual({})
    })

    it("component 不是配置对象时返回空对象", () => {
      const helper = useComponentHelper({
        mode: ref("add"),
        formModel: computed(() => ({})),
        loading: ref(false),
      })

      expect(helper.componentProps("el-button")).toEqual({})
      expect(helper.componentProps(() => null as any)).toEqual({})
    })
  })
})
