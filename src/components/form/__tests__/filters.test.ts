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
