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
})
