import type { Ref } from "vue"
import type { FormInstance } from "element-plus"
import type { FormItem, FormField, FormModel, FormConfig } from "../../../types"
import { assign } from "lodash-es"
import { dataset } from "../../../utils/dataset"

interface ActionOptions<T extends FormModel = FormModel> {
  config: FormConfig<T>
  form: T
  Form: Ref<FormInstance | undefined>
}

type SetKey = "options" | "props" | "hidden" | "hidden-toggle"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function useAction<T extends FormModel = FormModel>({ config, form, Form }: ActionOptions<T>) {
  function findItem(field?: FormField<T>) {
    if (field === undefined || field === null || field === "") {
      return undefined
    }

    let target: FormItem<T> | undefined

    function deep(list: FormItem<T>[]) {
      list.forEach((item) => {
        if (item.field === field) {
          target = item
        }
        else if (item.children) {
          deep(item.children)
        }
      })
    }

    deep(config.items)
    return target
  }

  function set({ field, key, path }: { field?: FormField<T>, key?: SetKey, path?: string }, data?: unknown) {
    if (typeof path === "string") {
      dataset(config, path, data)
      return
    }

    const target = findItem(field)

    if (!target) {
      return
    }

    switch (key) {
      case "options":
        if (target.component && Array.isArray(data)) {
          target.component.options = data
        }
        break
      case "props":
        if (target.component && isRecord(data)) {
          target.component.props = assign({}, target.component.props, data)
        }
        break
      case "hidden":
        if (typeof data === "boolean") {
          target.hidden = data
        }
        break
      case "hidden-toggle": {
        const currentHidden = typeof target.hidden === "boolean" ? target.hidden : false
        target.hidden = typeof data === "boolean" ? !data : !currentHidden
        break
      }
      case undefined:
        if (isRecord(data)) {
          assign(target, data)
        }
        break
      default:
        break
    }
  }

  function getForm(field?: FormField<T>) {
    if (field === undefined || field === null || field === "") {
      return form
    }
    const record = form as Record<string, unknown>
    return record[String(field)]
  }

  function setForm(field: FormField<T>, value: unknown) {
    const record = form as Record<string, unknown>
    record[String(field)] = value
  }

  function setConfig(path: string, value: unknown) {
    set({ path }, value)
  }

  function setData(field: FormField<T>, value: unknown) {
    set({ field }, value)
  }

  function setOptions(field: FormField<T>, value: unknown[]) {
    set({ field, key: "options" }, value)
  }

  function setProps(field: FormField<T>, value: Record<string, unknown>) {
    set({ field, key: "props" }, value)
  }

  function toggleItem(field: FormField<T>, value?: boolean) {
    set({ field, key: "hidden-toggle" }, value)
  }

  function hideItem(...fields: FormField<T>[]) {
    fields.forEach(field => set({ field, key: "hidden" }, true))
  }

  function showItem(...fields: FormField<T>[]) {
    fields.forEach(field => set({ field, key: "hidden" }, false))
  }

  function setTitle(value: string) {
    config.title = value
  }

  function collapseItem(item: FormItem) {
    if (typeof item.field === "string" && item.field.length > 0) {
      Form.value?.clearValidate(item.field)
    }
    item.collapse = !item.collapse
  }

  return {
    getForm,
    setForm,
    setData,
    setConfig,
    setOptions,
    setProps,
    toggleItem,
    hideItem,
    showItem,
    setTitle,
    collapseItem,
  }
}
