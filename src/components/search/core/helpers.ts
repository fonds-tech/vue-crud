import type { FormRecord } from "../../form/interface"
import type { Component, VNodeChild } from "vue"
import type { SearchAction, SearchMaybeFn } from "../interface"
import { resolve } from "@/utils"
import { h, resolveDynamicComponent } from "vue"

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
  return resolve(value, model)
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
  return h(
    Dynamic as Component,
    {
      style,
      ...props,
      ...events,
    },
    slots,
  )
}
