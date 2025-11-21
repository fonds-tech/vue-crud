import type { FormInstance } from "element-plus"
import type { Ref, CSSProperties } from "vue"
import type { FormMode, FormField, FormOptions } from "../../../types"
import { isArray, cloneDeep, set as setPath } from "lodash-es"
import { findItem, normalizeItems, ensureComponent } from "./schema"

export interface FormActionContext {
  options: FormOptions
  model: Record<string, unknown>
  form: Ref<FormInstance | undefined>
}

export interface FormActions {
  setMode: (mode: FormMode) => void
  getField: (field?: FormField) => unknown
  setField: (field: FormField, value: unknown) => void
  bindFields: (data?: Record<string, unknown>) => void
  setData: (path: string, value: unknown) => void
  setItem: (field: FormField, data: Record<string, unknown>) => void
  setOptions: (field: FormField, list: any[]) => void
  getOptions: (field: FormField) => any[]
  setProps: (field: FormField, props: Record<string, any>) => void
  setStyle: (field: FormField, style: CSSProperties) => void
  hideItem: (field: FormField | FormField[]) => void
  showItem: (field: FormField | FormField[]) => void
  collapse: (flag?: boolean) => void
  setRequired: (field: FormField, required: boolean) => void
  clearModel: () => void
}

export function useFormActions({ options, model, form }: FormActionContext): FormActions {
  function clearModel() {
    Object.keys(model).forEach(key => delete model[key])
  }

  function setMode(mode: FormMode) {
    options.mode = mode
  }

  function getField(field?: FormField) {
    if (field === undefined || field === null) {
      return model
    }
    const key = String(field)
    return model[key]
  }

  function setField(field: FormField, value: any) {
    model[String(field)] = value
  }

  function bindFields(data: Record<string, unknown> = {}) {
    const values = cloneDeep(data)
    form.value?.resetFields()
    form.value?.clearValidate()
    clearModel()
    Object.assign(model, values)
    normalizeItems(options.items, model)
  }

  function setData(path: string, value: unknown) {
    setPath(options as Record<string, any>, path, value)
  }

  function setItem(field: FormField, data: Record<string, unknown>) {
    const target = findItem(options.items, field)
    if (target) {
      Object.assign(target, data)
    }
  }

  function setList(field: FormField, list: any[]) {
    const target = findItem(options.items, field)
    if (target) {
      ensureComponent(target)
      target.component!.options = list
    }
  }

  function getList(field: FormField): any[] {
    const target = findItem(options.items, field)
    if (!target) {
      return []
    }
    ensureComponent(target)
    const optionsValue = target.component?.options
    return Array.isArray(optionsValue) ? optionsValue : []
  }

  function setProps(field: FormField, props: Record<string, any>) {
    const target = findItem(options.items, field)
    if (target) {
      ensureComponent(target)
      if (target.component?.props) {
        Object.assign(target.component.props, props)
      }
    }
  }

  function setStyle(field: FormField, style: CSSProperties) {
    const target = findItem(options.items, field)
    if (target) {
      ensureComponent(target)
      if (target.component?.style) {
        Object.assign(target.component.style, style)
      }
    }
  }

  function toggleHidden(fields: FormField | FormField[], hidden: boolean) {
    const list = isArray(fields) ? fields : [fields]
    list.forEach((field) => {
      const target = findItem(options.items, field)
      if (target) {
        target.hidden = () => hidden
      }
    })
  }

  function collapse(flag?: boolean) {
    if (typeof flag === "boolean") {
      options.layout.grid.collapsed = flag
    }
    else {
      options.layout.grid.collapsed = !options.layout.grid.collapsed
    }
  }

  function setRequired(field: FormField, required: boolean) {
    const target = findItem(options.items, field)
    if (target) {
      target.required = () => required
    }
  }

  return {
    setMode,
    getField,
    setField,
    bindFields,
    setData,
    setItem,
    setOptions: setList,
    getOptions: getList,
    setProps,
    setStyle,
    hideItem: (field: FormField | FormField[]) => toggleHidden(field, true),
    showItem: (field: FormField | FormField[]) => toggleHidden(field, false),
    collapse,
    setRequired,
    clearModel,
  }
}
