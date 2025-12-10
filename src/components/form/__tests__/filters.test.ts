import type { FormItem, FormOptions, FilterRuntimeContext } from "../types"
import { it, expect, describe } from "vitest"
import { applyFilters, registerFilter, shouldShowItem, filterStepItems, filterGroupItems, shouldShowInGroup } from "../core/filters"

const baseItemDefaults = { labelPosition: "", labelWidth: "", showMessage: true } as const

function createFilterContext(overrides: Partial<FilterRuntimeContext> = {}): FilterRuntimeContext {
  const defaultOptions: FormOptions = {
    key: 0,
    mode: "add",
    model: {},
    items: [],
    group: {},
    form: {},
  }

  return {
    options: overrides.options ?? defaultOptions,
    resolvedActiveGroup: overrides.resolvedActiveGroup,
    activeStepName: overrides.activeStepName,
    resolveProp: <T>(target: unknown, prop: string): T | undefined => {
      if (!target || typeof target !== "object") return undefined
      const value = (target as Record<string, unknown>)[prop]
      if (typeof value === "function") return value({}) as T
      return value as T
    },
    ...overrides,
  }
}

describe("fd-form filters", () => {
  describe("shouldShowItem", () => {
    it("hidden 为 true 时不显示", () => {
      const ctx = createFilterContext()
      const item: FormItem = { ...baseItemDefaults, prop: "name", hidden: true, component: { is: "el-input" } }
      expect(shouldShowItem(item, ctx)).toBe(false)
    })

    it("hidden 为函数返回 true 时不显示", () => {
      const ctx = createFilterContext()
      const item: FormItem = { ...baseItemDefaults, prop: "name", hidden: () => true, component: { is: "el-input" } }
      expect(shouldShowItem(item, ctx)).toBe(false)
    })

    it("tabs 模式下非当前分组的项不显示", () => {
      const options: FormOptions = {
        key: 0,
        mode: "add",
        model: {},
        items: [],
        group: { type: "tabs", children: [{ name: "tab1" }, { name: "tab2" }] },
        form: {},
      }
      const ctx = createFilterContext({ options, resolvedActiveGroup: "tab1" })
      const item: FormItem = { ...baseItemDefaults, prop: "field", group: "tab2", component: { is: "el-input" } }
      expect(shouldShowItem(item, ctx)).toBe(false)
    })

    it("tabs 模式下当前分组的项显示", () => {
      const options: FormOptions = {
        key: 0,
        mode: "add",
        model: {},
        items: [],
        group: { type: "tabs", children: [{ name: "tab1" }, { name: "tab2" }] },
        form: {},
      }
      const ctx = createFilterContext({ options, resolvedActiveGroup: "tab1" })
      const item: FormItem = { ...baseItemDefaults, prop: "field", group: "tab1", component: { is: "el-input" } }
      expect(shouldShowItem(item, ctx)).toBe(true)
    })
  })

  describe("shouldShowInGroup", () => {
    it("hidden 为 true 时不显示", () => {
      const ctx = createFilterContext()
      const item: FormItem = { ...baseItemDefaults, prop: "name", hidden: true, component: { is: "el-input" } }
      expect(shouldShowInGroup(item, ctx, "anyGroup")).toBe(false)
    })

    it("指定分组匹配时显示", () => {
      const ctx = createFilterContext()
      const item: FormItem = { ...baseItemDefaults, prop: "name", group: "g1", component: { is: "el-input" } }
      expect(shouldShowInGroup(item, ctx, "g1")).toBe(true)
      expect(shouldShowInGroup(item, ctx, "g2")).toBe(false)
    })
  })

  describe("filterGroupItems", () => {
    it("筛选指定分组的表单项", () => {
      const ctx = createFilterContext()
      const items: FormItem[] = [
        { ...baseItemDefaults, prop: "a", group: "g1", component: { is: "el-input" } },
        { ...baseItemDefaults, prop: "b", group: "g2", component: { is: "el-input" } },
        { ...baseItemDefaults, prop: "c", group: "g1", component: { is: "el-input" } },
      ]
      const result = filterGroupItems(items, ctx, "g1")
      expect(result.map(i => i.prop)).toEqual(["a", "c"])
    })
  })

  describe("filterStepItems", () => {
    it("steps 模式下筛选当前步骤的表单项", () => {
      const options: FormOptions = {
        key: 0,
        mode: "add",
        model: {},
        items: [],
        group: { type: "steps", children: [{ name: "step1" }, { name: "step2" }] },
        form: {},
      }
      const ctx = createFilterContext({ options, activeStepName: "step1" })
      const items: FormItem[] = [
        { ...baseItemDefaults, prop: "a", group: "step1", component: { is: "el-input" } },
        { ...baseItemDefaults, prop: "b", group: "step2", component: { is: "el-input" } },
      ]
      const result = filterStepItems(items, ctx)
      expect(result.map(i => i.prop)).toEqual(["a"])
    })

    it("非 Steps 模式返回所有项", () => {
      const ctx = createFilterContext()
      const items: FormItem[] = [
        { ...baseItemDefaults, prop: "a", component: { is: "el-input" } },
        { ...baseItemDefaults, prop: "b", component: { is: "el-input" } },
      ]
      const result = filterStepItems(items, ctx)
      expect(result.map(i => i.prop)).toEqual(["a", "b"])
    })
  })

  describe("applyFilters", () => {
    it("应用注册的过滤器", () => {
      const ctx = createFilterContext()
      const item: FormItem = { ...baseItemDefaults, prop: "name", component: { is: "el-input" } }
      const result = applyFilters(item, ctx)
      expect(result).not.toBeNull()
    })

    it("hidden 项被过滤", () => {
      const ctx = createFilterContext()
      const item: FormItem = { ...baseItemDefaults, prop: "name", hidden: true, component: { is: "el-input" } }
      const result = applyFilters(item, ctx)
      expect(result).toBeNull()
    })
  })

  describe("registerFilter", () => {
    it("注册自定义过滤器", () => {
      // 注册一个过滤掉 label 包含 "skip" 的项
      registerFilter("skipLabel", (item, _ctx) => {
        if (item.label?.includes("skip")) return null
        return item
      })

      const ctx = createFilterContext()
      const normalItem: FormItem = { ...baseItemDefaults, prop: "a", label: "正常", component: { is: "el-input" } }
      const skipItem: FormItem = { ...baseItemDefaults, prop: "b", label: "skip me", component: { is: "el-input" } }

      expect(applyFilters(normalItem, ctx)).not.toBeNull()
      expect(applyFilters(skipItem, ctx)).toBeNull()
    })
  })

  describe("shouldShowItem 边缘情况", () => {
    it("未设置 hidden 时显示", () => {
      const ctx = createFilterContext()
      const item: FormItem = { ...baseItemDefaults, prop: "name", component: { is: "el-input" } }
      expect(shouldShowItem(item, ctx)).toBe(true)
    })

    it("tabs 模式下未指定分组的项使用默认分组", () => {
      const options: FormOptions = {
        key: 0,
        mode: "add",
        model: {},
        items: [],
        group: { type: "tabs", children: [{ name: "tab1" }, { name: "tab2" }] },
        form: {},
      }
      const ctx = createFilterContext({ options, resolvedActiveGroup: "tab1" })
      // 未指定 group 的项默认属于第一个分组
      const item: FormItem = { ...baseItemDefaults, prop: "field", component: { is: "el-input" } }
      expect(shouldShowItem(item, ctx)).toBe(true)
    })

    it("非 tabs/steps 模式下所有项都显示", () => {
      const options: FormOptions = {
        key: 0,
        mode: "add",
        model: {},
        items: [],
        group: {}, // 无分组类型
        form: {},
      }
      const ctx = createFilterContext({ options })
      const item: FormItem = { ...baseItemDefaults, prop: "field", group: "anyGroup", component: { is: "el-input" } }
      expect(shouldShowItem(item, ctx)).toBe(true)
    })
  })

  describe("shouldShowInGroup 边缘情况", () => {
    it("未指定 group 的项在任何分组中都显示", () => {
      const ctx = createFilterContext()
      const item: FormItem = { ...baseItemDefaults, prop: "name", component: { is: "el-input" } }
      expect(shouldShowInGroup(item, ctx, "anyGroup")).toBe(true)
    })
  })

  describe("filterStepItems 边缘情况", () => {
    it("使用传入的 groupName 筛选", () => {
      const options: FormOptions = {
        key: 0,
        mode: "add",
        model: {},
        items: [],
        group: { type: "steps", children: [{ name: "step1" }, { name: "step2" }] },
        form: {},
      }
      const ctx = createFilterContext({ options, activeStepName: "step1" })
      const items: FormItem[] = [
        { ...baseItemDefaults, prop: "a", group: "step1", component: { is: "el-input" } },
        { ...baseItemDefaults, prop: "b", group: "step2", component: { is: "el-input" } },
      ]
      // 明确传入 step2 来筛选
      const result = filterStepItems(items, ctx, "step2")
      expect(result.map(i => i.prop)).toEqual(["b"])
    })

    it("无 children 配置时返回所有项", () => {
      const options: FormOptions = {
        key: 0,
        mode: "add",
        model: {},
        items: [],
        group: { type: "steps", children: [] },
        form: {},
      }
      const ctx = createFilterContext({ options })
      const items: FormItem[] = [{ ...baseItemDefaults, prop: "a", component: { is: "el-input" } }]
      const result = filterStepItems(items, ctx)
      expect(result.map(i => i.prop)).toEqual(["a"])
    })
  })

  describe("applyFilters 边缘情况", () => {
    it("过滤器返回 undefined 时保持原 item", () => {
      registerFilter("returnUndefined", () => undefined as any)

      const ctx = createFilterContext()
      const item: FormItem = { ...baseItemDefaults, prop: "test", component: { is: "el-input" } }
      // undefined 被处理为保持原项
      const result = applyFilters(item, ctx)
      expect(result).not.toBeNull()
    })

    it("过滤器抛出异常时返回 null", () => {
      registerFilter("throwError", () => {
        throw new Error("测试异常")
      })

      const ctx = createFilterContext()
      const item: FormItem = { ...baseItemDefaults, prop: "throwTest", component: { is: "el-input" } }
      const result = applyFilters(item, ctx)
      // 过滤器抛出异常时应返回 null
      expect(result).toBeNull()
    })
  })
})

describe("fd-form normalizeItems", () => {
  const baseItemDefaults = { labelPosition: "", labelWidth: "", showMessage: true } as const

  function createMockHelpers(model: Record<string, unknown> = {}) {
    return {
      propKey: (prop?: string | string[]) => (Array.isArray(prop) ? prop.join(".") : (prop ?? "")),
      getModelValue: (prop?: string | string[]) => {
        const key = Array.isArray(prop) ? prop.join(".") : prop
        return key ? model[key] : undefined
      },
      setModelValue: (prop: string | string[], value: unknown) => {
        const key = Array.isArray(prop) ? prop.join(".") : prop
        if (key) model[key] = value
      },
      ensureComponentDefaults: (item: FormItem) => {
        if (!item.component) item.component = {}
        item.component.props = item.component.props ?? {}
        item.component.on = item.component.on ?? {}
        item.component.style = item.component.style ?? {}
      },
      required: (item: FormItem) => Boolean(item.required),
    }
  }

  it("设置默认值到 model", async () => {
    const { normalizeItems } = await import("../core/filters")
    const model: Record<string, unknown> = {}
    const helpers = createMockHelpers(model)
    const options: FormOptions = {
      key: 0,
      mode: "add",
      model: {},
      items: [{ ...baseItemDefaults, prop: "name", value: "默认名称", component: { is: "el-input" } }],
      group: {},
      form: {},
    }

    normalizeItems({ options, model, helpers: helpers as any })
    expect(model.name).toBe("默认名称")
  })

  it("model 中已有值时不覆盖", async () => {
    const { normalizeItems } = await import("../core/filters")
    const model: Record<string, unknown> = { name: "已有值" }
    const helpers = createMockHelpers(model)
    const options: FormOptions = {
      key: 0,
      mode: "add",
      model: {},
      items: [{ ...baseItemDefaults, prop: "name", value: "默认名称", component: { is: "el-input" } }],
      group: {},
      form: {},
    }

    normalizeItems({ options, model, helpers: helpers as any })
    expect(model.name).toBe("已有值")
  })

  it("带 hook 配置时触发 formHook.bind", async () => {
    const { normalizeItems } = await import("../core/filters")
    const model: Record<string, unknown> = { tags: "a,b,c" }
    const helpers = createMockHelpers(model)
    const options: FormOptions = {
      key: 0,
      mode: "add",
      model: {},
      items: [{ ...baseItemDefaults, prop: "tags", hook: "split", component: { is: "el-select" } }],
      group: {},
      form: {},
    }

    normalizeItems({ options, model, helpers: helpers as any })
    // hook 执行后应该将字符串分割为数组
    expect(model.tags).toEqual(["a", "b", "c"])
  })

  it("required 为 true 时注入必填规则（无现有规则）", async () => {
    const { normalizeItems } = await import("../core/filters")
    const model: Record<string, unknown> = {}
    const helpers = createMockHelpers(model)
    const options: FormOptions = {
      key: 0,
      mode: "add",
      model: {},
      items: [{ ...baseItemDefaults, prop: "name", label: "姓名", required: true, component: { is: "el-input" } }],
      group: {},
      form: {},
    }

    normalizeItems({ options, model, helpers: helpers as any })
    const item = options.items[0]
    expect(item.rules).toBeDefined()
    expect(Array.isArray(item.rules)).toBe(true)
    expect((item.rules as any[])[0]._inner).toBe(true)
  })

  it("required 为 true 且已有规则数组时前置注入", async () => {
    const { normalizeItems } = await import("../core/filters")
    const model: Record<string, unknown> = {}
    const helpers = createMockHelpers(model)
    const existingRule = { min: 2, message: "最少2个字符" }
    const options: FormOptions = {
      key: 0,
      mode: "add",
      model: {},
      items: [
        {
          ...baseItemDefaults,
          prop: "name",
          label: "姓名",
          required: true,
          rules: [existingRule],
          component: { is: "el-input" },
        },
      ],
      group: {},
      form: {},
    }

    normalizeItems({ options, model, helpers: helpers as any })
    const item = options.items[0]
    const rules = item.rules as any[]
    expect(rules.length).toBe(2)
    expect(rules[0]._inner).toBe(true)
    expect(rules[1]).toEqual(existingRule)
  })

  it("已有 _inner 规则时替换而非新增", async () => {
    const { normalizeItems } = await import("../core/filters")
    const model: Record<string, unknown> = {}
    const helpers = createMockHelpers(model)
    const options: FormOptions = {
      key: 0,
      mode: "add",
      model: {},
      items: [
        {
          ...baseItemDefaults,
          prop: "name",
          label: "姓名",
          required: true,
          rules: [{ _inner: true, required: true, message: "旧规则" } as any],
          component: { is: "el-input" },
        },
      ],
      group: {},
      form: {},
    }

    normalizeItems({ options, model, helpers: helpers as any })
    const item = options.items[0]
    const rules = item.rules as any[]
    // 应该仍然只有一条规则（替换而非新增）
    expect(rules.length).toBe(1)
    expect(rules[0]._inner).toBe(true)
    expect(rules[0].trigger).toEqual(["change", "blur"])
  })

  it("rules 为单个对象时转换为数组", async () => {
    const { normalizeItems } = await import("../core/filters")
    const model: Record<string, unknown> = {}
    const helpers = createMockHelpers(model)
    const singleRule = { min: 2, message: "最少2个字符" }
    const options: FormOptions = {
      key: 0,
      mode: "add",
      model: {},
      items: [
        {
          ...baseItemDefaults,
          prop: "name",
          label: "姓名",
          required: true,
          rules: singleRule as any,
          component: { is: "el-input" },
        },
      ],
      group: {},
      form: {},
    }

    normalizeItems({ options, model, helpers: helpers as any })
    const item = options.items[0]
    const rules = item.rules as any[]
    expect(Array.isArray(rules)).toBe(true)
    expect(rules.length).toBe(2)
  })

  it("必填验证器正确校验空值", async () => {
    const { normalizeItems } = await import("../core/filters")
    const model: Record<string, unknown> = {}
    const helpers = createMockHelpers(model)
    const options: FormOptions = {
      key: 0,
      mode: "add",
      model: {},
      items: [{ ...baseItemDefaults, prop: "name", label: "姓名", required: true, component: { is: "el-input" } }],
      group: {},
      form: {},
    }

    normalizeItems({ options, model, helpers: helpers as any })
    const item = options.items[0]
    const rule = (item.rules as any[])[0]

    // 测试空值校验
    const errors: Error[] = []
    rule.validator({}, undefined, (err?: Error) => {
      if (err) errors.push(err)
    })
    expect(errors.length).toBe(1)
    expect(errors[0].message).toContain("姓名")

    // 测试非空值校验
    const errors2: Error[] = []
    rule.validator({}, "有值", (err?: Error) => {
      if (err) errors2.push(err)
    })
    expect(errors2.length).toBe(0)
  })

  it("必填验证器校验空字符串", async () => {
    const { normalizeItems } = await import("../core/filters")
    const model: Record<string, unknown> = {}
    const helpers = createMockHelpers(model)
    const options: FormOptions = {
      key: 0,
      mode: "add",
      model: {},
      items: [{ ...baseItemDefaults, prop: "code", label: "编码", required: true, component: { is: "el-input" } }],
      group: {},
      form: {},
    }

    normalizeItems({ options, model, helpers: helpers as any })
    const item = options.items[0]
    const rule = (item.rules as any[])[0]

    const errors: Error[] = []
    rule.validator({}, "", (err?: Error) => {
      if (err) errors.push(err)
    })
    expect(errors.length).toBe(1)
  })

  it("必填验证器校验 null 值", async () => {
    const { normalizeItems } = await import("../core/filters")
    const model: Record<string, unknown> = {}
    const helpers = createMockHelpers(model)
    const options: FormOptions = {
      key: 0,
      mode: "add",
      model: {},
      items: [{ ...baseItemDefaults, prop: "value", required: true, component: { is: "el-input" } }],
      group: {},
      form: {},
    }

    normalizeItems({ options, model, helpers: helpers as any })
    const item = options.items[0]
    const rule = (item.rules as any[])[0]

    const errors: Error[] = []
    rule.validator({}, null, (err?: Error) => {
      if (err) errors.push(err)
    })
    expect(errors.length).toBe(1)
    // 无 label 时使用 propName
    expect(errors[0].message).toContain("value")
  })
})
