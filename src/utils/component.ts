import type { VNode, Component, CSSProperties } from "vue"
import type { EventMap, ComponentSlot, ComponentConfig, ResolvedComponent } from "../types/shared"
import { resolve } from "./resolver"
import { isVNode, markRaw } from "vue"

/**
 * 判断值是否为组件配置对象
 *
 * 检查值是否包含组件配置的特征属性（is、props、style、on、slots、slot）。
 * 用于区分直接组件和配置对象。
 *
 * @param value 待检查的值
 * @returns 是否为组件配置对象
 *
 * @example
 * ```ts
 * isConfig({ is: "el-button" }) // => true
 * isConfig({ props: { type: "primary" } }) // => true
 * isConfig("el-button") // => false
 * isConfig(MyComponent) // => false
 * ```
 */
export function isConfig(value: unknown): value is ComponentConfig {
  if (!value || typeof value !== "object") return false

  // VNode 不是配置对象
  if (isVNode(value)) return false

  const obj = value as Record<string, unknown>
  // 检查是否包含配置特征属性
  return "is" in obj || "props" in obj || "style" in obj || "on" in obj || "slots" in obj || "slot" in obj
}

/**
 * 判断值是否为组件（非配置对象）
 */
function isComponent(value: unknown): value is Component {
  if (!value) return false
  // 函数组件
  if (typeof value === "function") return true
  // 对象组件（有 setup/render/template）
  if (typeof value === "object" && !isVNode(value) && !isConfig(value)) {
    const obj = value as Record<string, unknown>
    return "setup" in obj || "render" in obj || "template" in obj || "__name" in obj
  }
  return false
}

/**
 * 解析组件配置，返回统一结构
 *
 * 接受多种输入形式（字符串、组件、VNode、配置对象），
 * 统一解析为 ResolvedComponent 结构，下游无需关心输入差异。
 *
 * @template C 上下文类型
 * @param config 组件配置
 * @param context 解析上下文
 * @returns 统一的解析结果
 *
 * @example
 * ```ts
 * // 字符串组件名
 * parse("el-button", {})
 * // => { is: "el-button", props: {}, style: undefined, events: {}, slots: {}, slotName: undefined }
 *
 * // 完整配置
 * parse({
 *   is: "el-button",
 *   props: { type: "primary" },
 *   on: { click: handleClick },
 * }, {})
 * // => { is: "el-button", props: { type: "primary" }, events: { onClick: handleClick }, ... }
 *
 * // 动态配置
 * parse({
 *   is: (ctx) => ctx.disabled ? "span" : "el-button",
 *   props: (ctx) => ({ disabled: ctx.disabled }),
 * }, { disabled: true })
 * // => { is: "span", props: { disabled: true }, ... }
 * ```
 */
export function parse<C = unknown>(config: ComponentSlot<C> | undefined, context: C): ResolvedComponent {
  const empty: ResolvedComponent = {
    is: undefined,
    props: {},
    style: undefined,
    events: {},
    slots: {},
    slotName: undefined,
    ref: undefined,
  }

  if (!config) return empty

  // 纯字符串 => 外部插槽名
  if (typeof config === "string") {
    return { ...empty, slotName: config }
  }

  // VNode => 直接使用
  if (isVNode(config)) {
    return { ...empty, is: config }
  }

  // 组件对象（非配置）
  if (isComponent(config)) {
    return { ...empty, is: markRaw(config) }
  }

  // 配置对象
  if (isConfig(config)) {
    const is = resolve(config.is, context)
    const props = resolve(config.props, context) ?? {}
    const style = resolve(config.style, context) as CSSProperties | undefined
    const on = resolve(config.on, context) ?? {}
    const slots = resolve(config.slots, context) ?? {}
    const slotName = resolve(config.slot, context)
    const ref = config.ref

    // 处理 is 的不同类型
    let resolvedIs: Component | VNode | string | undefined
    if (is) {
      if (typeof is === "string" || isVNode(is)) {
        resolvedIs = is
      }
      else if (typeof is === "object" || typeof is === "function") {
        resolvedIs = markRaw(is as Component)
      }
    }

    return {
      is: resolvedIs,
      props: props as Record<string, unknown>,
      style,
      events: on as EventMap,
      slots: slots as Record<string, unknown>,
      slotName: slotName as string | undefined,
      ref,
    }
  }

  return empty
}

/**
 * 获取组件插槽名
 *
 * 便捷方法，仅解析配置中的 slot 属性。
 *
 * @template C 上下文类型
 * @param config 组件配置
 * @param context 解析上下文
 * @returns 插槽名或 undefined
 */
export function slotName<C = unknown>(config: ComponentSlot<C> | undefined, context: C): string | undefined {
  if (!config) return undefined
  if (typeof config === "string") return config
  if (isConfig(config)) return resolve(config.slot, context) as string | undefined
  return undefined
}

/**
 * 获取组件标识
 *
 * 便捷方法，仅解析配置中的 is 属性。
 *
 * @template C 上下文类型
 * @param config 组件配置
 * @param context 解析上下文
 * @returns 组件标识或 undefined
 */
export function componentIs<C = unknown>(config: ComponentSlot<C> | undefined, context: C): Component | VNode | string | undefined {
  if (!config) return undefined
  if (typeof config === "string") return undefined
  if (isVNode(config)) return config
  if (isComponent(config)) return markRaw(config)
  if (isConfig(config)) {
    const is = resolve(config.is, context)
    if (is && (typeof is === "object" || typeof is === "function") && !isVNode(is)) {
      return markRaw(is as Component)
    }
    return is as Component | VNode | string | undefined
  }
  return undefined
}
