import type { VNode, Component, CSSProperties } from "vue"

/**
 * 可能是函数的值类型
 * 支持静态值或根据上下文动态计算的函数
 * @template T 值类型
 * @template C 上下文类型
 */
export type MaybeFn<T, C = unknown> = T | ((context: C) => T)

/**
 * 组件标识类型
 * 可以是字符串名称、Vue组件对象或VNode
 */
export type ComponentLike = string | Component | VNode

/**
 * 事件处理器类型
 */
export type EventHandler = (...args: unknown[]) => unknown

/**
 * 事件映射对象
 */
export type EventMap = Record<string, EventHandler>

/**
 * 通用组件配置接口
 * @template C 上下文类型，用于动态值解析
 */
export interface ComponentConfig<C = unknown> {
  /** 组件标识：字符串名/组件对象/VNode，支持动态 */
  is?: MaybeFn<ComponentLike | undefined, C>
  /** 组件 props，支持动态 */
  props?: MaybeFn<Record<string, unknown>, C>
  /** 组件样式，支持动态 */
  style?: MaybeFn<CSSProperties | undefined, C>
  /** 事件监听器，支持动态 */
  on?: MaybeFn<EventMap, C>
  /** 组件子插槽，支持动态 */
  slots?: MaybeFn<Record<string, unknown>, C>
  /** 使用外部插槽名（而非渲染组件），支持动态 */
  slot?: MaybeFn<string | undefined, C>
  /** 组件 ref 回调 */
  ref?: (el: unknown) => void
}

/**
 * 组件插槽配置类型
 * 可以是插槽名字符串、直接组件、或完整配置对象
 * @template C 上下文类型
 */
export type ComponentSlot<C = unknown>
  = | string // 外部插槽名
    | ComponentLike // 直接组件/VNode
    | ComponentConfig<C> // 完整配置

/**
 * 解析后的组件配置
 * parse() 函数的返回类型，提供统一的结构
 */
export interface ResolvedComponent {
  /** 解析后的组件标识 */
  is: ComponentLike | undefined
  /** 解析后的 props */
  props: Record<string, unknown>
  /** 解析后的样式 */
  style: CSSProperties | undefined
  /** 规范化后的事件（onXxx 格式） */
  events: EventMap
  /** 解析后的子插槽 */
  slots: Record<string, unknown>
  /** 外部插槽名（如有） */
  slotName: string | undefined
  /** ref 回调（如有） */
  ref: ((el: unknown) => void) | undefined
}

/**
 * 字典项接口
 * 用于数据字典匹配和标签渲染
 */
export interface DictItem {
  /** 字典值 */
  value: unknown
  /** 显示标签 */
  label: string
  /** 标签颜色 */
  color?: string
  /** 标签类型（用于 ElTag） */
  type?: "success" | "warning" | "danger" | "info" | "primary" | "default"
  /** 是否禁用 */
  disabled?: boolean
  /** 扩展属性 */
  [key: string]: unknown
}
