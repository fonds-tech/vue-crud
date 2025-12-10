import type { FormRecord } from "../../form/types"
import type { SearchAction } from "../interface"
import type { Component, VNodeChild } from "vue"
import { resolve } from "@/utils"
import { h, resolveDynamicComponent } from "vue"

/**
 * 解析 SearchAction 的组件属性
 * @param action 动作配置
 * @param key 属性 key
 * @param model 表单模型
 */
export function resolveComponent(action: SearchAction, key: keyof NonNullable<SearchAction["component"]>, model: FormRecord) {
  const component = action.component
  if (!component) return undefined
  const value = component[key]
  return resolve(value as any, model)
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
