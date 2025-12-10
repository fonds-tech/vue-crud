import type { FormItem, FormRecord, FormOptions, FormAsyncOptionsState } from "../interface"
import { createHelpers } from "../core"
import { it, vi, expect, describe } from "vitest"
import { h, ref, computed, reactive, defineComponent } from "vue"

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

  it("itemsOfGroup 获取 Tabs 下指定分组的表单项", () => {
    const options = reactive<FormOptions>({
      key: 0,
      mode: "add",
      model: {},
      items: [
        { ...baseItemDefaults, prop: "a", component: { is: "el-input" }, group: "g1" },
        { ...baseItemDefaults, prop: "b", component: { is: "el-input" }, group: "g2" },
        { ...baseItemDefaults, prop: "c", component: { is: "el-input" }, group: "g1" },
      ],
      group: {
        type: "tabs",
        children: [{ name: "g1" }, { name: "g2" }],
      },
      form: {},
    })
    const model = reactive<FormRecord>({})
    const step = ref(1)
    const optionState = reactive<Record<string, FormAsyncOptionsState>>({})
    const helpers = createHelpers({
      options,
      model,
      resolvedActiveGroup: computed(() => "g1"),
      step,
      loadedGroups: ref(new Set<string | number>()),
      optionState,
    })
    expect(helpers.itemsOfGroup("g1").map(i => i.prop)).toEqual(["a", "c"])
    expect(helpers.itemsOfGroup("g2").map(i => i.prop)).toEqual(["b"])
  })

  it("rules 返回表单项的校验规则", () => {
    const { helpers } = createCtx()
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "name",
      label: "名称",
      component: { is: "el-input" },
      rules: [{ required: true, message: "必填" }],
    }
    const rules = helpers.rules(item)
    expect(rules).toEqual([{ required: true, message: "必填" }])
  })

  it("extra 解析函数形式", () => {
    const { helpers, model } = createCtx()
    model.name = "test"
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "name",
      label: "名称",
      component: { is: "el-input" },
      extra: (m: FormRecord) => `当前值: ${m.name}`,
    }
    expect(helpers.extra(item)).toBe("当前值: test")
  })

  it("extra 解析字符串形式", () => {
    const { helpers } = createCtx()
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "name",
      label: "名称",
      component: { is: "el-input" },
      extra: "静态提示文本",
    }
    expect(helpers.extra(item)).toBe("静态提示文本")
  })

  it("ensureComponentDefaults 补充空组件对象", () => {
    const { helpers } = createCtx()
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "name",
      label: "名称",
      component: {},
    }
    helpers.ensureComponentDefaults(item)
    expect(item.component).toBeDefined()
  })

  it("propKey 返回字符串格式的 prop", () => {
    const { helpers } = createCtx()
    expect(helpers.propKey("name")).toBe("name")
    expect(helpers.propKey(["user", "name"])).toBe("user.name")
    expect(helpers.propKey("id", 0)).toBe("id")
  })

  it("is 解析无效组件配置返回 undefined", () => {
    const { helpers } = createCtx()
    expect(helpers.is(undefined)).toBeUndefined()
    expect(helpers.is(null as any)).toBeUndefined()
  })

  it("styleOf 解析组件样式", () => {
    const { helpers } = createCtx()
    const style = helpers.styleOf({ style: { width: "100%" } })
    expect(style).toEqual({ width: "100%" })
  })

  it("styleOf 支持函数形式", () => {
    const { helpers, model } = createCtx()
    model.size = "large"
    const style = helpers.styleOf({ style: (m: FormRecord) => ({ width: m.size === "large" ? "200px" : "100px" }) })
    expect(style).toEqual({ width: "200px" })
  })

  it("itemsOfGroup 非 tabs 模式返回空数组", () => {
    // 创建非 tabs 模式的上下文
    const options = reactive<FormOptions>({
      key: 0,
      mode: "add",
      model: {},
      items: [{ ...baseItemDefaults, prop: "a", component: { is: "el-input" }, group: "g1" }],
      group: {}, // 非 tabs 模式
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
    // 非 tabs 模式应返回空数组
    expect(helpers.itemsOfGroup("g1")).toEqual([])
  })

  it("itemsOfStep 非 steps 模式返回所有项", () => {
    const options = reactive<FormOptions>({
      key: 0,
      mode: "add",
      model: {},
      items: [
        { ...baseItemDefaults, prop: "a", component: { is: "el-input" } },
        { ...baseItemDefaults, prop: "b", component: { is: "el-input" } },
      ],
      group: {}, // 非 steps 模式
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
    expect(helpers.itemsOfStep().length).toBe(2)
  })

  it("bindComponentRef 返回空函数用于非配置组件", () => {
    const { helpers } = createCtx()
    const refFn = helpers.bindComponentRef(undefined)
    // 应该返回一个函数，调用时不报错
    expect(typeof refFn).toBe("function")
    expect(() => refFn(null)).not.toThrow()
  })

  it("bindComponentRef 带 ref 处理器时正确调用", () => {
    const { helpers } = createCtx()
    const refSpy = vi.fn()
    const refFn = helpers.bindComponentRef({ is: "el-input", ref: refSpy })
    const mockEl = { focus: vi.fn() }
    refFn(mockEl)
    expect(refSpy).toHaveBeenCalledWith(mockEl)
  })

  it("onListeners 解析组件事件监听器", () => {
    const { helpers } = createCtx()
    const onClick = vi.fn()
    const listeners = helpers.onListeners({ is: "el-button", on: { onClick } })
    expect(listeners.onClick).toBe(onClick)
  })

  it("onListeners 非配置组件返回空对象", () => {
    const { helpers } = createCtx()
    const listeners = helpers.onListeners("el-input")
    expect(listeners).toEqual({})
  })

  it("slotNameOf 解析插槽名称", () => {
    const { helpers } = createCtx()
    const slotName = helpers.slotNameOf({ slot: "custom-slot" })
    expect(slotName).toBe("custom-slot")
  })

  it("slotNameOf 非配置组件返回 undefined", () => {
    const { helpers } = createCtx()
    const slotName = helpers.slotNameOf("el-input")
    expect(slotName).toBeUndefined()
  })

  it("componentOptions 解析组件选项", () => {
    const { helpers } = createCtx()
    const opts = [{ label: "A", value: "a" }]
    const result = helpers.componentOptions({ is: "el-select", options: opts })
    expect(result).toEqual(opts)
  })

  it("markGroupLoaded 和 isGroupLoaded 正确工作", () => {
    const options = reactive<FormOptions>({
      key: 0,
      mode: "add",
      model: {},
      items: [],
      group: { type: "tabs", children: [{ name: "g1" }, { name: "g2" }] },
      form: {},
    })
    const model = reactive<FormRecord>({})
    const step = ref(1)
    const loadedGroups = ref(new Set<string | number>())
    const optionState = reactive<Record<string, FormAsyncOptionsState>>({})
    const helpers = createHelpers({
      options,
      model,
      resolvedActiveGroup: computed(() => "g1"),
      step,
      loadedGroups,
      optionState,
    })

    expect(helpers.isGroupLoaded("g1")).toBe(false)
    helpers.markGroupLoaded("g1")
    expect(helpers.isGroupLoaded("g1")).toBe(true)
    // undefined 参数不标记
    helpers.markGroupLoaded(undefined)
    expect(helpers.isGroupLoaded(undefined)).toBe(true)
  })

  it("formatProps 生成正确的组件属性", () => {
    const { helpers } = createCtx()
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "name",
      label: "名称",
      component: { is: "el-input" },
    }
    const props = helpers.formatProps.value(item)
    expect(props.placeholder).toBe("请输入名称")
  })

  it("formatProps 为 el-select 生成选择提示", () => {
    const { helpers } = createCtx()
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "type",
      label: "类型",
      component: { is: "el-select" },
    }
    const props = helpers.formatProps.value(item)
    expect(props.placeholder).toBe("请选择类型")
  })

  it("formatProps 为 el-date-picker 生成日期提示", () => {
    const { helpers } = createCtx()
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "date",
      label: "日期",
      component: { is: "el-date-picker" },
    }
    const props = helpers.formatProps.value(item)
    expect(props.placeholder).toBe("请选择日期")
  })

  it("formatProps disabled 时添加 disabled 属性", () => {
    const { helpers } = createCtx()
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "name",
      disabled: true,
      component: { is: "el-input" },
    }
    const props = helpers.formatProps.value(item)
    expect(props.disabled).toBe(true)
  })

  it("rules 隐藏项返回空数组", () => {
    const { helpers } = createCtx()
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "name",
      hidden: true,
      rules: [{ required: true, message: "必填" }],
      component: { is: "el-input" },
    }
    expect(helpers.rules(item)).toEqual([])
  })

  it("rules 过滤 _inner 规则当非必填时", () => {
    const { helpers } = createCtx()
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "name",
      required: false,
      rules: [{ _inner: true, required: true } as any, { min: 2, message: "最少2字符" }],
      component: { is: "el-input" },
    }
    const rules = helpers.rules(item) as any[]
    // 非必填时应过滤掉 _inner 规则
    expect(rules.length).toBe(1)
    expect(rules[0].min).toBe(2)
  })

  it("isFormItemConfig 验证配置有效性", () => {
    const { helpers } = createCtx()
    expect(helpers.isFormItemConfig({ prop: "name", component: { is: "el-input" } })).toBe(true)
    expect(helpers.isFormItemConfig({ prop: "name" })).toBe(false)
    expect(helpers.isFormItemConfig(undefined)).toBe(false)
  })

  // 新增覆盖测试：activeStepName 边界情况 - 步骤索引越界时使用默认值
  it("activeStepName 步骤索引越界时使用默认值", () => {
    const options = reactive<FormOptions>({
      key: 0,
      mode: "add",
      model: {},
      items: [],
      group: {
        type: "steps",
        children: [{ name: "s1", title: "步骤1" }],
      },
      form: {},
    })
    const model = reactive<FormRecord>({})
    const step = ref(0) // 索引为 0 时，idx = Math.max(0, 0-1) = 0，但如果 children[0]?.name 不存在会使用 idx + 1
    const optionState = reactive<Record<string, FormAsyncOptionsState>>({})
    const helpers = createHelpers({
      options,
      model,
      resolvedActiveGroup: computed(() => undefined),
      step,
      loadedGroups: ref(new Set<string | number>()),
      optionState,
    })
    // step = 0 时，idx = Math.max(0, 0-1) = 0，应该返回 children[0].name = "s1"
    expect(helpers.activeStepName.value).toBe("s1")
  })

  // 新增覆盖测试：activeStepName 步骤有 name 时返回 name
  it("activeStepName 步骤有 name 时返回 name", () => {
    const options = reactive<FormOptions>({
      key: 0,
      mode: "add",
      model: {},
      items: [],
      group: {
        type: "steps",
        children: [{ name: "step1", title: "步骤1" }],
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
    // children[0].name 为 "step1"
    expect(helpers.activeStepName.value).toBe("step1")
  })

  // 新增覆盖测试：formatProps 中 optionValues 存在但组件不支持 options 属性
  it("formatProps optionValues 存在但组件不支持 options", () => {
    const { helpers } = createCtx()
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "name",
      label: "名称",
      component: {
        is: "el-input", // el-input 不支持 options
        options: [{ label: "A", value: "a" }], // 手动设置 options
      },
    }
    const props = helpers.formatProps.value(item)
    // el-input 不在 OPTION_COMPONENTS 中，所以不应添加 options 属性
    expect(props.options).toBeUndefined()
    expect(props.data).toBeUndefined()
  })

  // 新增覆盖测试：formatProps 中 el-tree-select 使用 data 属性
  it("formatProps el-tree-select 使用 data 属性", () => {
    const { helpers } = createCtx()
    const treeData = [{ label: "Node", value: 1 }]
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "tree",
      label: "树选择",
      component: {
        is: "el-tree-select",
        options: treeData,
      },
    }
    const props = helpers.formatProps.value(item)
    // el-tree-select 应使用 data 而非 options
    expect(props.data).toEqual(treeData)
    expect(props.options).toBeUndefined()
  })

  // 新增覆盖测试：ensureComponentDefaults 完整分支覆盖
  it("ensureComponentDefaults 无 component 时创建完整默认对象", () => {
    const { helpers } = createCtx()
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "name",
      label: "名称",
    } as FormItem // 强制类型，模拟无 component 的情况
    // 删除 component 属性
    delete (item as any).component
    helpers.ensureComponentDefaults(item)
    expect(item.component).toBeDefined()
    expect(item.component!.props).toEqual({})
    expect(item.component!.on).toEqual({})
    expect(item.component!.style).toEqual({})
  })

  // 新增覆盖测试：optionsOf 同步更新选项
  it("optionsOf 同步选项数组更新", () => {
    const options = reactive<FormOptions>({
      key: 0,
      mode: "add",
      model: {},
      items: [],
      group: {},
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

    const initialOpts = [{ label: "A", value: "a" }]
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "status",
      component: { is: "el-select", options: initialOpts },
    }

    // 第一次调用
    const result1 = helpers.optionsOf(item)
    expect(result1.options).toEqual(initialOpts)

    // 更新选项
    const newOpts = [{ label: "B", value: "b" }]
    item.component!.options = newOpts

    // 第二次调用应触发同步更新
    const result2 = helpers.optionsOf(item)
    expect(result2.options).toEqual(newOpts)
  })

  // 新增覆盖测试：rules 单个规则对象（非数组）且有 _inner 标记
  it("rules 单个规则对象带 _inner 标记时过滤", () => {
    const { helpers } = createCtx()
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "name",
      required: false, // 非必填
      rules: { _inner: true, required: true } as any, // 单个规则对象
      component: { is: "el-input" },
    }
    const rules = helpers.rules(item)
    // 非必填且规则有 _inner 标记，应返回空数组
    expect(rules).toEqual([])
  })

  // 新增覆盖测试：propKey 无效 prop 使用 fallback
  it("propKey 无效 prop 使用 fallback", () => {
    const { helpers } = createCtx()
    expect(helpers.propKey(undefined, 5)).toBe("5")
    expect(helpers.propKey(null as any, "default")).toBe("default")
    expect(helpers.propKey(undefined, undefined)).toBe("")
  })

  // 新增覆盖测试：formatProps 已有 placeholder 时不覆盖
  it("formatProps 已有 placeholder 时不覆盖", () => {
    const { helpers } = createCtx()
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "name",
      label: "名称",
      component: {
        is: "el-input",
        props: { placeholder: "自定义提示" },
      },
    }
    const props = helpers.formatProps.value(item)
    expect(props.placeholder).toBe("自定义提示")
  })

  // 新增覆盖测试：formatProps loading 状态
  it("formatProps loading 状态添加 loading 属性", async () => {
    const options = reactive<FormOptions>({
      key: 0,
      mode: "add",
      model: {},
      items: [],
      group: {},
      form: {},
    })
    const model = reactive<FormRecord>({})
    const step = ref(1)
    const optionState = reactive<Record<string, FormAsyncOptionsState>>({
      status: { value: [], loading: true, pending: Promise.resolve([]) },
    })
    const helpers = createHelpers({
      options,
      model,
      resolvedActiveGroup: computed(() => undefined),
      step,
      loadedGroups: ref(new Set<string | number>()),
      optionState,
    })

    const item: FormItem = {
      ...baseItemDefaults,
      prop: "status",
      label: "状态",
      component: { is: "el-select" },
    }
    const props = helpers.formatProps.value(item)
    expect(props.loading).toBe(true)
  })

  // 新增覆盖测试：componentProps 返回基础 props
  it("componentProps 返回组件基础 props", () => {
    const { helpers } = createCtx()
    const props = helpers.componentProps({ is: "el-input", props: { maxlength: 100 } })
    expect(props.maxlength).toBe(100)
  })

  // 新增覆盖测试：toPathArray 直接调用
  it("toPathArray 转换路径格式", () => {
    const { helpers } = createCtx()
    expect(helpers.toPathArray("a.b.c")).toEqual(["a", "b", "c"])
    expect(helpers.toPathArray(["x", "y"])).toEqual(["x", "y"])
  })

  // 新增覆盖测试：extra 隐藏项返回空字符串
  it("extra 隐藏项返回空字符串", () => {
    const { helpers } = createCtx()
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "name",
      hidden: true,
      extra: "提示文本",
      component: { is: "el-input" },
    }
    expect(helpers.extra(item)).toBe("")
  })

  // 新增覆盖测试：required 隐藏项返回 false
  it("required 隐藏项返回 false", () => {
    const { helpers } = createCtx()
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "name",
      hidden: true,
      required: true,
      component: { is: "el-input" },
    }
    expect(helpers.required(item)).toBe(false)
  })

  // 新增覆盖测试：is 函数传入 VNode 时包装为组件
  it("is 函数传入 VNode 时包装为组件", () => {
    const { helpers } = createCtx()
    const vnode = h("div", null, "内容")
    const result = helpers.is({ is: vnode })
    // 返回的应该是一个组件（对象）
    expect(result).toBeDefined()
    expect(typeof result).toBe("object")
  })

  // 新增覆盖测试：is 函数传入函数组件时返回 markRaw 包装
  it("is 函数传入函数组件时返回组件", () => {
    const { helpers } = createCtx()
    const FnComponent = defineComponent({
      setup() {
        return () => null
      },
    })
    const result = helpers.is({ is: FnComponent })
    // markRaw 包装后不完全等于原组件，但应定义
    expect(result).toBeDefined()
  })

  // 新增覆盖测试：optionsOf 函数形式选项已在加载中
  it("optionsOf 函数形式选项已在加载中时不重复触发", () => {
    const options = reactive<FormOptions>({
      key: 0,
      mode: "add",
      model: {},
      items: [],
      group: {},
      form: {},
    })
    const model = reactive<FormRecord>({})
    const step = ref(1)
    // 预设 loading 状态
    const optionState = reactive<Record<string, FormAsyncOptionsState>>({
      status: { value: [], loading: true, pending: Promise.resolve([]) },
    })
    const helpers = createHelpers({
      options,
      model,
      resolvedActiveGroup: computed(() => undefined),
      step,
      loadedGroups: ref(new Set<string | number>()),
      optionState,
    })

    const optionsFn = vi.fn(() => [{ label: "A", value: "a" }])
    const item: FormItem = {
      ...baseItemDefaults,
      prop: "status",
      component: { is: "el-select", options: optionsFn },
    }

    // 调用 optionsOf，由于已在 loading 状态，不应再次触发 optionsFn
    helpers.optionsOf(item)
    expect(optionsFn).not.toHaveBeenCalled()
  })

  // 新增覆盖测试：is 传入对象组件时返回 markRaw 包装
  it("is 传入对象组件定义时返回组件", () => {
    const { helpers } = createCtx()
    const ObjComponent = defineComponent({
      name: "TestComponent",
      setup() {
        return () => null
      },
    })
    const result = helpers.is({ is: ObjComponent })
    expect(result).toBeDefined()
  })
})
