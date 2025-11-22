import type { Ref } from "vue"
import type { FormInstance } from "element-plus"
import type {
  FormItem,
  FormMode,
  FormRecord,
  FormActions,
  FormMaybeFn,
  FormOptions,
  FormItemRuleWithMeta,
} from "../type"
import { dataset } from "../../../utils/dataset"
import { cloneDeep } from "lodash-es"
import { isDef, isNoEmpty, isFunction } from "@fonds/utils"

interface ActionContext<T extends FormRecord = FormRecord> {
  options: FormOptions<T>
  model: T
  form: Ref<FormInstance | undefined>
}

function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

export function useAction<T extends FormRecord = FormRecord>({ options, model, form }: ActionContext<T>): FormActions<T> {
  function findItem(field?: keyof T | string): FormItem<T> | undefined {
    if (field === undefined || field === null)
      return undefined
    const fieldKey = String(field)
    return options.items.find(item => String(item.field) === fieldKey)
  }

  function set({
    field,
    key,
    path,
  }: {
    field?: keyof T | string
    key?: "options" | "props" | "hidden" | "style"
    path?: string
  }, value?: any) {
    if (path) {
      dataset(options as unknown as Record<string, unknown>, path, value)
      return
    }

    const target = findItem(field)
    if (!target) {
      console.error(`[fd-form] field "${String(field)}" was not found`)
      return
    }

    switch (key) {
      case "options":
        target.component = target.component || {}
        target.component.options = value
        break
      case "props":
        target.component = target.component || {}
        target.component.props = {
          ...(target.component.props || {}),
          ...value,
        }
        break
      case "hidden":
        target.hidden = value
        break
      case "style":
        target.component = target.component || {}
        target.component.style = {
          ...(target.component.style || {}),
          ...value,
        }
        break
      default:
        Object.assign(target, value)
        break
    }
  }

  function setMode(mode: FormMode) {
    options.mode = mode
  }

  function getField(field?: keyof T | string) {
    if (!field) {
      return model
    }
    return model[field as keyof T]
  }

  function setField(field: keyof T | string, value: any) {
    model[field as keyof T] = value
  }

  function setItem(field: keyof T | string, data: Partial<FormItem<T>>) {
    set({ field }, data)
  }

  function bindFields(data: Partial<T> = {}) {
    const values = cloneDeep(data)
    const normalizedValues = values as Record<string, any>
    form.value?.resetFields()
    form.value?.clearValidate()
    Object.keys(model).forEach((key) => {
      delete model[key]
    })

    options.items.forEach((item) => {
      if (item.field && isDef(item.value)) {
        const key = String(item.field)
        normalizedValues[key] = isDef(normalizedValues[key]) ? normalizedValues[key] : cloneDeep(item.value)
      }
    })

    Object.entries(normalizedValues).forEach(([field, fieldValue]) => {
      setField(field as keyof T | string, fieldValue)
    })
  }

  function setData(path: string, value: any) {
    set({ path }, value)
  }

  function setOptions(field: keyof T | string, value: any[]) {
    set({ field, key: "options" }, value)
  }

  function getOptions(field: keyof T | string) {
    const optionValue = findItem(field)?.component?.options as FormMaybeFn<any[], T> | undefined
    if (!optionValue)
      return undefined
    return isFunction(optionValue) ? optionValue(model) : optionValue
  }

  function setProps(field: keyof T | string, value: Record<string, any>) {
    set({ field, key: "props" }, value)
  }

  function setStyle(field: keyof T | string, value: Record<string, any>) {
    set({ field, key: "style" }, value)
  }

  function hideItem(fields: keyof T | string | Array<keyof T | string>) {
    toArray(fields).forEach(field => set({ field, key: "hidden" }, true))
  }

  function showItem(fields: keyof T | string | Array<keyof T | string>) {
    toArray(fields).forEach(field => set({ field, key: "hidden" }, false))
  }

  function collapse(state?: boolean) {
    if (typeof state === "boolean") {
      options.layout.row.collapsed = state
      return
    }
    options.layout.row.collapsed = !options.layout.row.collapsed
  }

  function setRequired(field: keyof T | string, required: boolean) {
    const item = findItem(field)
    if (!item)
      return

    const label = item.label || String(field)
    const rule: FormItemRuleWithMeta = { required, message: `${label}为必填项`, _inner: true }
    if (isNoEmpty(item.rules)) {
      const ruleList: FormItemRuleWithMeta[] = (Array.isArray(item.rules) ? item.rules : [item.rules]).filter(Boolean) as FormItemRuleWithMeta[]
      const index = ruleList.findIndex(r => r._inner === true)
      if (index > -1) {
        ruleList[index] = rule
      }
      else {
        ruleList.unshift(rule)
      }
      item.rules = ruleList
    }
    else {
      item.rules = [rule]
    }
  }

  const actions: FormActions<T> = {
    setMode,
    getField,
    setField,
    setItem,
    bindFields,
    setData,
    setOptions,
    getOptions,
    setProps,
    setStyle,
    hideItem,
    showItem,
    collapse,
    setRequired,
  }

  return actions
}
