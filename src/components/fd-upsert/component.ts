import type { UpsertMode } from "./type"
import type { Ref, ComputedRef } from "vue"
import type { FormRecord, FormComponentSlot } from "../fd-form/types"
import { isFunction } from "@fonds/utils"

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
 */
export function useComponentHelper<T extends FormRecord = FormRecord>(context: ComponentHelperContext<T>) {
  const { mode, formModel, loading } = context

  function createSlotProps(slotScope: Record<string, unknown>) {
    return {
      ...slotScope,
      mode: mode.value,
      model: formModel.value,
      loading: loading.value,
    }
  }

  function slotNameOf(component?: FormComponentSlot) {
    if (!isComponentConfig(component))
      return undefined
    return resolveComponentProp<string | undefined>(component, "slot", formModel)
  }

  function componentOf(component?: FormComponentSlot) {
    if (!component)
      return undefined
    if (typeof component === "string" || typeof component === "function")
      return component
    if (isComponentConfig(component))
      return resolveComponentProp(component, "is", formModel)
    return undefined
  }

  function componentProps(component?: FormComponentSlot) {
    if (!component || !isComponentConfig(component))
      return {}
    return resolveComponentProp<Record<string, unknown>>(component, "props", formModel) ?? {}
  }

  function componentStyle(component?: FormComponentSlot) {
    if (!component || !isComponentConfig(component))
      return undefined
    return resolveComponentProp(component, "style", formModel)
  }

  function componentEvents(component?: FormComponentSlot) {
    if (!component || !isComponentConfig(component))
      return {}
    return resolveComponentProp<Record<string, unknown>>(component, "on", formModel) ?? {}
  }

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
