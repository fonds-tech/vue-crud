import type { UpsertMode } from "../type"
import type { Ref, ComputedRef } from "vue"
import type { FormRecord, FormComponentSlot } from "../../fd-form/type"
import { isFunction } from "@fonds/utils"

interface ComponentHelperContext<T extends FormRecord = FormRecord> {
  mode: Ref<UpsertMode>
  formModel: ComputedRef<T>
  loading: Ref<boolean>
}

function isComponentConfig(component?: FormComponentSlot): component is Record<string, any> {
  return Boolean(component && typeof component === "object" && "is" in (component as Record<string, any>))
}

function resolveComponentProp<T>(component: FormComponentSlot | undefined, prop: string, formModel: ComputedRef<FormRecord>): T | undefined {
  if (!component || typeof component !== "object")
    return undefined
  const value = (component as Record<string, any>)[prop]
  if (isFunction(value))
    return value(formModel.value)
  return value
}

export function useComponentHelper<T extends FormRecord = FormRecord>(context: ComponentHelperContext<T>) {
  const { mode, formModel, loading } = context

  function createSlotProps(slotScope: Record<string, any>) {
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
    return resolveComponentProp<Record<string, any>>(component, "props", formModel) ?? {}
  }

  function componentStyle(component?: FormComponentSlot) {
    if (!component || !isComponentConfig(component))
      return undefined
    return resolveComponentProp(component, "style", formModel)
  }

  function componentEvents(component?: FormComponentSlot) {
    if (!component || !isComponentConfig(component))
      return {}
    return resolveComponentProp<Record<string, any>>(component, "on", formModel) ?? {}
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
