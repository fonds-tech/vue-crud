import type { Component as VueComponent } from "vue"
import type { FormComponentSlot, FormRenderContext } from "../interface"
import { h, resolveDynamicComponent } from "vue"

function resolveComponent(type: string | VueComponent | undefined) {
  if (!type) return undefined
  if (typeof type === "string") {
    const dyn = resolveDynamicComponent(type)
    return dyn as VueComponent | undefined
  }
  return type
}

/**
 * 渲染插槽或组件：优先消费具名插槽，其次解析动态组件配置。
 * @param ctx 渲染上下文
 * @param com 插槽或组件配置
 * @param slotProps 透传给插槽/组件的属性
 * @returns 渲染结果 VNode 或 null
 */
export function renderSlotOrComponent(ctx: FormRenderContext, com?: FormComponentSlot, slotProps: Record<string, unknown> = {}) {
  const { helpers, slots, model } = ctx

  const name = helpers.slotNameOf(com)
  if (name && slots[name]) {
    return slots[name]!({ model, ...slotProps })
  }

  const componentType = helpers.is(com)
  if (!componentType) return null

  const resolved = resolveComponent(componentType)
  if (!resolved) return null

  const listeners = helpers.normalizeListeners(helpers.onListeners(com))
  const childSlots = renderComponentSlotMap(ctx, helpers.slotsOf(com), slotProps)

  return h(
    resolved,
    {
      ...helpers.componentProps(com),
      ref: helpers.bindComponentRef(com),
      style: helpers.styleOf(com),
      ...listeners,
    },
    childSlots,
  )
}

/**
 * 将插槽配置映射为 Vue 可消费的 slots 对象。
 * @param ctx 渲染上下文
 * @param slotMap 插槽配置映射
 * @param slotProps 透传给子插槽的上下文属性
 * @returns 标准化的 slots 对象
 */
export function renderComponentSlotMap(ctx: FormRenderContext, slotMap: Record<string, FormComponentSlot>, slotProps: Record<string, unknown> = {}) {
  const entries = Object.entries(slotMap).map(([name, value]) => [name, () => renderSlotOrComponent(ctx, value, slotProps)] as const)
  return Object.fromEntries(entries)
}
