import type { FormHelpers } from "./helpers"
import type { FilterFn, FormItem, FormRecord, FormOptions, InternalRule, FilterOptions, FilterRuntimeContext } from "../types"
import formHook from "./hooks"
import { clone, isDef, isNoEmpty } from "@fonds/utils"

// ==================== 过滤规则部分 ====================

const registry = new Map<string, FilterFn>()

/**
 * 注册过滤规则
 * @param name 规则名称
 * @param fn 过滤函数（纯函数，返回 null 表示过滤掉）
 */
export function registerFilter(name: string, fn: FilterFn) {
  registry.set(name, fn)
}

/**
 * 应用全部已注册过滤规则
 * @param item 表单项配置
 * @param ctx 过滤上下文
 * @param options 过滤可选参数（如分组名）
 * @returns 过滤后的表单项或 null（被过滤掉）
 */
export function applyFilters(item: FormItem, ctx: FilterRuntimeContext, options: FilterOptions = {}) {
  let current: FormItem | null = item
  for (const [name, filter] of registry) {
    try {
      const next = filter(current, ctx, options)
      if (next === null) return null
      current = next ?? current
    }
    catch (error) {
      console.warn(`[fd-form] filter \"${name}\" 执行异常`, error)
      return null
    }
  }
  return current
}

// ==================== 分组解析辅助函数 ====================

/**
 * 获取默认分组名（第一个子分组）
 */
function getDefaultGroupName(ctx: FilterRuntimeContext): string | number | undefined {
  return ctx.options.group?.children?.[0]?.name
}

/**
 * 解析表单项所属分组
 * 如果未指定则使用默认分组
 */
function resolveItemGroup(item: FormItem, ctx: FilterRuntimeContext): string | number | undefined {
  const defaultGroup = getDefaultGroupName(ctx)
  return ctx.resolveProp<string | number | undefined>(item, "group") ?? defaultGroup
}

// ==================== 可见性判断函数 ====================

/**
 * 判断表单项是否显示（Tabs 背景下结合分组）
 * @param item 表单项配置
 * @param ctx 过滤上下文（含 options、分组状态、动态属性解析器）
 * @returns 是否可见
 */
export function shouldShowItem(item: FormItem, ctx: FilterRuntimeContext) {
  // 1. 明确隐藏的项不显示
  if (ctx.resolveProp<boolean>(item, "hidden")) {
    return false
  }

  // 2. Tabs 模式下，只显示当前激活分组的项
  if (ctx.options.group?.type === "tabs" && ctx.options.group.children?.length) {
    const itemGroup = resolveItemGroup(item, ctx)
    const activeGroup = ctx.resolvedActiveGroup
    if (itemGroup && activeGroup && itemGroup !== activeGroup) {
      return false
    }
  }

  return true
}

/**
 * Tabs 内部渲染时的显隐判断（第二重校验）
 */
export function shouldShowInGroup(item: FormItem, ctx: FilterRuntimeContext, groupName: string | number) {
  if (ctx.resolveProp<boolean>(item, "hidden")) {
    return false
  }
  const itemGroup = resolveItemGroup(item, ctx)
  return !itemGroup || itemGroup === groupName
}

// ==================== 分组筛选函数 ====================

/**
 * 获取指定 Tabs 分组的表单项
 */
export function filterGroupItems(items: FormItem[], ctx: FilterRuntimeContext, groupName: string | number) {
  return items.filter(item => resolveItemGroup(item, ctx) === groupName)
}

/**
 * 获取 Steps 场景下的表单项
 */
export function filterStepItems(items: FormItem[], ctx: FilterRuntimeContext, groupName?: string | number) {
  if (ctx.options.group?.type !== "steps" || !ctx.options.group.children?.length) {
    return items
  }
  // 确定目标步骤：优先使用传入的 groupName，其次当前步骤，最后默认分组
  const targetGroup = groupName ?? ctx.activeStepName ?? getDefaultGroupName(ctx)
  return items.filter(item => resolveItemGroup(item, ctx) === targetGroup)
}

// 默认规则：可见性（含 Tabs/Steps 分组）
registerFilter("visibility", (item, ctx, options) => {
  if (options?.groupName !== undefined) return shouldShowInGroup(item, ctx, options.groupName) ? item : null
  return shouldShowItem(item, ctx) ? item : null
})

// ==================== 规范化部分（原 normalize.ts） ====================

interface NormalizeContext {
  options: FormOptions
  model: FormRecord
  helpers: FormHelpers
}

/**
 * 规范化表单项配置：补默认组件结构、应用默认值、执行 hook、注入必填规则。
 * @param options 参数对象
 * @param options.options 表单配置
 * @param options.model 表单模型
 * @param options.helpers 辅助方法集合
 */
export function normalizeItems({ options, model, helpers }: NormalizeContext) {
  options.items.forEach((item) => {
    helpers.ensureComponentDefaults(item)

    const propName = helpers.propKey(item.prop)
    if (isDef(item.value) && !isDef(helpers.getModelValue(item.prop))) {
      helpers.setModelValue(item.prop, clone(item.value))
    }

    if (item.hook && item.prop) {
      formHook.bind({
        hook: item.hook,
        model,
        field: propName,
        value: helpers.getModelValue(item.prop),
      })
    }

    if (helpers.required(item)) {
      const rule: InternalRule = {
        required: true,
        _inner: true,
        trigger: ["change", "blur"],
        validator: (_rule, value, callback) => {
          const isEmpty = value === undefined || value === null || value === ""
          if (isEmpty) callback(new Error(`${item.label ?? propName}为必填项`))
          else callback()
        },
      }
      if (isNoEmpty(item.rules)) {
        const ruleList: InternalRule[] = (Array.isArray(item.rules) ? item.rules : [item.rules]).filter(Boolean) as InternalRule[]
        const index = ruleList.findIndex(r => r._inner === true)
        if (index > -1) ruleList[index] = rule
        else ruleList.unshift(rule)
        item.rules = ruleList
      }
      else {
        item.rules = [rule]
      }
    }
  })
}
