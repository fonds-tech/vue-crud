import type { FormRecord } from "../../form/types"
import type { Component, VNodeChild } from "vue"
import type { SearchAction, SearchMaybeFn } from "../types"
import { h, resolveDynamicComponent } from "vue"

/**
 * 将事件对象的 key 转换为 onXxx 格式
 * @param events 事件对象 { click: handler }
 * @returns 转换后的事件对象 { onClick: handler }
 */
export function transformEvents(events: Record<string, (...args: any[]) => void> = {}) {
  const mapped: Record<string, (...args: any[]) => void> = {}
  Object.keys(events).forEach((key) => {
    const handler = events[key]
    if (handler) {
      const camel = `on${key[0].toUpperCase()}${key.slice(1)}`
      mapped[camel] = handler
    }
  })
  return mapped
}

/**
 * 解析可能为函数的值
 * @param value 静态值或函数
 * @param model 表单模型
 * @returns 解析后的值
 */
export function resolveMaybe<T>(
  value: SearchMaybeFn<T, FormRecord> | undefined,
  model: FormRecord,
): T | undefined {
  if (typeof value === "function") {
    return (value as (model: FormRecord) => T)(model)
  }
  return value as T | undefined
}

/**
 * 解析 SearchAction 的组件属性
 * @param action 动作配置
 * @param key 属性 key
 * @param model 表单模型
 */
export function resolveComponent(
  action: SearchAction,
  key: keyof NonNullable<SearchAction["component"]>,
  model: FormRecord,
) {
  const component = action.component
  if (!component) return undefined
  const value = component[key]
  return resolveMaybe(value as any, model)
}

/**
 * 渲染动态组件
 * @param componentIs 组件名称或组件实例
 * @param props 组件属性
 * @param events 组件事件
 * @param style 组件样式
 * @param slots 组件插槽
 */
export function renderDynamicComponent(
  componentIs: string | Component,
  props: Record<string, any>,
  events: Record<string, (...args: any[]) => void>,
  style?: any,
  slots?: Record<string, () => VNodeChild>,
) {
  const Dynamic = resolveDynamicComponent(componentIs)
  const transformedEvents = transformEvents(events)
  return h(
    Dynamic as Component,
    {
      style,
      ...props,
      ...transformedEvents,
    },
    slots,
  )
}
