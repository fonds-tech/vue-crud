import type { UpsertMode } from "../interface"
import type { Ref, ComputedRef } from "vue"
import type { FormRecord, FormComponentSlot } from "../../form/interface"
import { isFunction } from "@fonds/utils"

/**
 * 组件辅助上下文
 */
interface ComponentHelperContext<T extends FormRecord = FormRecord> {
  mode: Ref<UpsertMode>
  formModel: ComputedRef<T>
  loading: Ref<boolean>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isComponentConfig(component?: FormComponentSlot): component is Record<string, unknown> {
  return Boolean(isRecord(component) && "is" in component)
}

function resolveComponentProp<T>(
  component: FormComponentSlot | undefined,
  prop: string,
  formModel: ComputedRef<FormRecord>,
): T | undefined {
  if (!isRecord(component))
    return undefined
  const value = component[prop]
  if (isFunction(value))
    return value(formModel.value)
  return value as T | undefined
}

/**
 * 组件/插槽解析工具，提供注入上下文。
 *
 * @param context 组件辅助上下文
 * @returns 组件辅助工具对象
 */
export function useComponentHelper<T extends FormRecord = FormRecord>(context: ComponentHelperContext<T>) {
  const { mode, formModel, loading } = context

  /**
   * 创建插槽作用域 props
   *
   * @param slotScope 原始插槽作用域
   * @returns 注入了 mode, model, loading 的新作用域
   */
  function createSlotProps(slotScope: Record<string, unknown>) {
    return {
      ...slotScope,
      mode: mode.value,
      model: formModel.value,
      loading: loading.value,
    }
  }

  /**
   * 获取组件插槽名称
   *
   * @param component 组件配置
   * @returns 插槽名称 或 undefined
   */
  function slotNameOf(component?: FormComponentSlot) {
    if (!isComponentConfig(component))
      return undefined
    return resolveComponentProp<string | undefined>(component, "slot", formModel)
  }

  /**
   * 获取组件实际对象
   *
   * @param component 组件配置
   * @returns 组件对象/字符串 或 undefined
   */
  function componentOf(component?: FormComponentSlot) {
    if (!component)
      return undefined
    if (typeof component === "string" || typeof component === "function")
      return component
    if (isComponentConfig(component))
      return resolveComponentProp(component, "is", formModel)
    return undefined
  }

  /**
   * 获取组件 props
   *
   * @param component 组件配置
   * @returns 组件 props 对象
   */
  function componentProps(component?: FormComponentSlot) {
    if (!component || !isComponentConfig(component))
      return {}
    return resolveComponentProp<Record<string, unknown>>(component, "props", formModel) ?? {}
  }

  /**
   * 获取组件样式
   *
   * @param component 组件配置
   * @returns 样式对象
   */
  function componentStyle(component?: FormComponentSlot) {
    if (!component || !isComponentConfig(component))
      return undefined
    return resolveComponentProp(component, "style", formModel)
  }

  /**
   * 获取组件事件监听器
   *
   * @param component 组件配置
   * @returns 事件对象
   */
  function componentEvents(component?: FormComponentSlot) {
    if (!component || !isComponentConfig(component))
      return {}
    return resolveComponentProp<Record<string, unknown>>(component, "on", formModel) ?? {}
  }

  /**
   * 获取组件内部插槽
   *
   * @param component 组件配置
   * @returns 内部插槽对象
   */
  function componentSlots(component?: FormComponentSlot) {
    if (!component || !isComponentConfig(component))
      return {}
    return resolveComponentProp<Record<string, FormComponentSlot>>(component, "slots", formModel) ?? {}
  }

  return {
    createSlotProps,
    slotNameOf,
    componentOf,
    componentProps,
    componentStyle,
    componentEvents,
    componentSlots,
  }
}
