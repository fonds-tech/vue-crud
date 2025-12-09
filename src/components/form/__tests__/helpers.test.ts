import type { FormItem, FormRecord, FormOptions, FormAsyncOptionsState } from "../interface"
import { createHelpers } from "../core"
import { ref, computed, reactive } from "vue"
import { it, vi, expect, describe } from "vitest"

const baseItemDefaults = { labelPosition: "", labelWidth: "", showMessage: true } as const

function createCtx(resolvedName?: string) {
  const options = reactive<FormOptions>({
    key: 0,
    mode: "add",
    model: {},
    items: [],
    group: resolvedName ? { type: "tabs", children: [{ name: "g1" }, { name: "g2" }] } : {},
    form: {},
    grid: {},
  })
  const model = reactive<FormRecord>({})
  const resolvedActiveGroup = computed(() => resolvedName)
  const step = ref(1)
  const loadedGroups = ref(new Set<string | number>())
  const optionState = reactive<Record<string, FormAsyncOptionsState>>({})
  const helpers = createHelpers({ options, model, resolvedActiveGroup, step, loadedGroups, optionState })
  return { options, model, helpers, step }
}

describe("fd-form helpers", () => {
  it("getModelValue/setModelValue 支持嵌套路径", () => {
    const { model, helpers } = createCtx()
    helpers.setModelValue("a.b.c", 123)
    expect(model.a?.b?.c).toBe(123)
    expect(helpers.getModelValue(["a", "b", "c"])).toBe(123)
  })

  it("show/required/disabled 解析函数型属性", () => {
    const { helpers } = createCtx()
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "name",
      label: "名称",
      component: { is: "el-input" },
      required: () => true,
      hidden: () => false,
      disabled: () => true,
    }
    expect(helpers.show(item)).toBe(true)
    expect(helpers.required(item)).toBe(true)
    expect(helpers.disabled(item)).toBe(true)
  })

  it("tabs 下 show 按 group 过滤", () => {
    const { helpers } = createCtx("g1")
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "foo",
      label: "Foo",
      component: { is: "el-input" },
      group: "g2",
    }
    expect(helpers.show(item)).toBe(false)
    expect(helpers.showInGroup(item, "g2")).toBe(true)
  })

  it("steps 下 itemsOfStep 按当前步骤过滤", () => {
    const options = reactive<FormOptions>({
      key: 0,
      mode: "add",
      model: {},
      items: [
        { ...baseItemDefaults, prop: "a", component: { is: "el-input" }, group: "s1" },
        { ...baseItemDefaults, prop: "b", component: { is: "el-input" }, group: "s2" },
      ],
      group: {
        type: "steps",
        children: [{ name: "s1" }, { name: "s2" }],
      },
      form: {},
    })
    const model = reactive<FormRecord>({})
    const step = ref(1)
    const optionState = reactive<Record<string, FormAsyncOptionsState>>({})
    const helpers = createHelpers({
      options,
      model,
      resolvedActiveGroup: computed(() => undefined),
      step,
      loadedGroups: ref(new Set<string | number>()),
      optionState,
    })
    expect(helpers.itemsOfStep().map(i => i.prop)).toEqual(["a"])
    step.value = 2
    expect(helpers.itemsOfStep().map(i => i.prop)).toEqual(["b"])
  })

  it("normalizeListeners 过滤无效 handler 并保持 key 不变", () => {
    const { helpers } = createCtx()
    const handler = vi.fn()
    const mapped = helpers.normalizeListeners({ onClick: handler, onChange: undefined as any })
    expect(mapped.onClick).toBe(handler)
    expect(mapped.onChange).toBeUndefined()
  })

  it("slotsOf 支持对象与函数形式", () => {
    const { helpers } = createCtx()
    const fnSlot = vi.fn(() => ({ default: "div" }))
    const objSlot = { default: "span" }
    expect(helpers.slotsOf({ slots: objSlot })).toEqual(objSlot)
    expect(helpers.slotsOf({ slots: fnSlot })).toEqual({ default: "div" })
    expect(fnSlot).toHaveBeenCalled()
  })

  it("component 属性解析与默认 span/offset", () => {
    const { helpers } = createCtx()
    const comp = helpers.is({ is: "el-input" })
    expect(comp).toBe("el-input")
    const item: FormItem = { ...baseItemDefaults, prop: "p", component: { is: "el-input" } }
    expect(helpers.resolveSpan(item)).toBe(1)
    expect(helpers.resolveOffset(item)).toBe(0)
  })
})
