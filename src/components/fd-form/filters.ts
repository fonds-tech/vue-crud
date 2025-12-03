import type { FilterFn, FormItem, FilterOptions, FilterRuntimeContext } from "./types"

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
      if (next === null)
        return null
      current = next ?? current
    }
    catch (error) {
      console.warn(`[fd-form] filter \"${name}\" 执行异常`, error)
      return null
    }
  }
  return current
}

/**
 * 判断表单项是否显示（Tabs 背景下结合分组）
 * @param item 表单项配置
 * @param ctx 过滤上下文（含 options、分组状态、动态属性解析器）
 * @returns 是否可见
 */
export function shouldShowItem(item: FormItem, ctx: FilterRuntimeContext) {
  if (ctx.resolveProp<boolean>(item, "hidden"))
    return false

  if (ctx.options.group?.type === "tabs" && ctx.options.group.children?.length) {
    const fallback = ctx.options.group.children[0]?.name
    const itemGroup = ctx.resolveProp<string | number | undefined>(item, "group") ?? fallback
    const active = ctx.resolvedActiveGroup
    if (itemGroup && active && itemGroup !== active)
      return false
  }
  return true
}

/**
 * Tabs 内部渲染时的显隐判断（第二重校验）
 */
export function shouldShowInGroup(item: FormItem, ctx: FilterRuntimeContext, groupName: string | number) {
  if (ctx.resolveProp<boolean>(item, "hidden"))
    return false
  const fallback = ctx.options.group?.children?.[0]?.name
  const itemGroup = ctx.resolveProp<string | number | undefined>(item, "group") ?? fallback
  if (itemGroup && itemGroup !== groupName)
    return false
  return true
}

/**
 * 获取指定 Tabs 分组的表单项
 */
export function filterGroupItems(items: FormItem[], ctx: FilterRuntimeContext, groupName: string | number) {
  const fallback = ctx.options.group?.children?.[0]?.name
  return items.filter(item => (ctx.resolveProp<string | number | undefined>(item, "group") ?? fallback) === groupName)
}

/**
 * 获取 Steps 场景下的表单项
 */
export function filterStepItems(items: FormItem[], ctx: FilterRuntimeContext, groupName?: string | number) {
  if (ctx.options.group?.type !== "steps" || !ctx.options.group.children?.length)
    return items
  const target = groupName ?? ctx.activeStepName ?? ctx.options.group.children[0]?.name
  const fallback = ctx.options.group.children[0]?.name
  return items.filter(item => (ctx.resolveProp<string | number | undefined>(item, "group") ?? fallback) === target)
}

// 默认规则：可见性（含 Tabs/Steps 分组）
registerFilter("visibility", (item, ctx, options) => {
  if (options?.groupName !== undefined)
    return shouldShowInGroup(item, ctx, options.groupName) ? item : null
  return shouldShowItem(item, ctx) ? item : null
})
