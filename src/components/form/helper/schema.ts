import type { FormItem, FormField } from "../../../types"
import formHook from "../../../utils/formHook"
import { isArray, cloneDeep, isFunction } from "lodash-es"

export type LooseModel = Record<string, any>

export function ensureComponent(item?: FormItem): void {
  if (!item) {
    return
  }
  if (!item.component) {
    item.component = {}
  }
  if (!item.component.on) {
    item.component.on = {}
  }
  if (!item.component.props) {
    item.component.props = {}
  }
  if (!item.component.style) {
    item.component.style = {}
  }
}

export function normalizeItems(items: FormItem[], model: LooseModel): void {
  items.forEach((item) => {
    ensureComponent(item)

    const key = item.field !== undefined && item.field !== null ? String(item.field) : undefined
    if (key !== undefined && item.value !== undefined && model[key] === undefined) {
      const clonedValue: unknown = cloneDeep(item.value)
      model[key] = clonedValue
    }

    if (item.hook !== undefined && key !== undefined) {
      const fieldValue: unknown = model[key]
      formHook.bind({
        hook: item.hook,
        model,
        field: key,
        value: fieldValue,
      })
    }

    if (isArray(item.children) && item.children.length > 0) {
      normalizeItems(item.children, model)
    }
  })
}

export function findItem(items: FormItem[], field?: FormField): FormItem | undefined {
  if (field === undefined || field === null) {
    return undefined
  }
  const key = String(field)
  for (const item of items) {
    if (item.field !== undefined && item.field !== null && String(item.field) === key) {
      return item
    }
    if (isArray(item.children) && item.children.length > 0) {
      const target = findItem(item.children, field)
      if (target) {
        return target
      }
    }
  }
  return undefined
}

export function resolveMaybeFn<T, R>(value: R | ((ctx: T) => R), ctx: T): R {
  if (isFunction(value)) {
    return value(ctx)
  }
  return value
}
