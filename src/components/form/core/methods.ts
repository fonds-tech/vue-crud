import type { Arrayable } from "element-plus/es/utils"
import type { FormItemProp, FormValidateCallback, FormValidationResult } from "element-plus"
import type { FormItem, FormRecord, FormMethods, FormOptions, FormActionContext } from "../types"
import formHook from "./hooks"
import { useAction } from "./actions"
import { propToString } from "./model"
import { clone, isDef, isFunction } from "@fonds/utils"

/**
 * 构建表单方法集合，封装并增强 Element Plus Form 原生方法（含 submit 钩子处理）。
 */
export function useMethods<T extends FormRecord = FormRecord>({ options, form, model }: { options: FormOptions<T>, form: FormActionContext<T>["form"], model: T }): FormMethods<T> {
  const ensureFieldsArray = (field?: Arrayable<FormItemProp>): string[] | undefined => {
    if (!field) return undefined
    const flatten = Array.isArray(field) ? field : [field]
    return flatten.flatMap(item => (Array.isArray(item) ? item : [item]))
  }

  const methods: FormMethods<T> = {
    validate(callback?: FormValidateCallback) {
      if (!form.value) {
        callback?.(true)
        return Promise.resolve(true)
      }
      return form.value.validate((isValid, invalidFields) => {
        callback?.(isValid, invalidFields)
      })
    },

    validateField(props?: Arrayable<FormItemProp>, callback?: FormValidateCallback) {
      if (!form.value) {
        callback?.(true)
        return Promise.resolve(true) as FormValidationResult
      }
      return form.value.validateField(props, callback)
    },

    resetFields(field?: Arrayable<FormItemProp>) {
      form.value?.resetFields(field)
    },

    clearFields(field?: Arrayable<FormItemProp>) {
      const targets = ensureFieldsArray(field)
      if (!targets) {
        Object.keys(model).forEach((key) => {
          delete model[key]
        })
      }
      else {
        targets.forEach((key) => {
          delete model[key]
        })
      }
      form.value?.clearValidate(field)
    },

    clearValidate(field?: Arrayable<FormItemProp>) {
      form.value?.clearValidate(field)
    },

    setFields(data: Record<string, any>) {
      Object.keys(data).forEach((key) => {
        model[key as keyof T] = data[key]
      })
    },

    scrollToField(field: FormItemProp) {
      form.value?.scrollToField(field)
    },

    submit(callback?: (model: T, errors: Record<string, any> | undefined) => void) {
      return new Promise<{ values: T, errors: Record<string, any> | undefined }>((resolve) => {
        methods.validate((_, invalidFields) => {
          const values = clone(model) as T
          const normalizedErrors = normalizeErrors(invalidFields as Record<string, any> | undefined, values)
          const hasErrors = Boolean(normalizedErrors && Object.keys(normalizedErrors).length > 0)

          if (!hasErrors) {
            options.items.forEach((item: FormItem<T>) => {
              const propName = propToString(item.prop)
              if (item.hook && item.prop && isDef(values[propName as keyof T])) {
                formHook.submit({
                  hook: item.hook,
                  model: values,
                  field: propName,
                  value: values[propName as keyof T],
                })
              }
            })
          }

          if (isFunction(callback)) {
            callback(values, normalizedErrors)
          }

          if (!hasErrors && isFunction(options.onSubmit)) {
            options.onSubmit(values, undefined)
          }

          resolve({ values, errors: normalizedErrors })
        })
      })
    },
  }

  return methods
}

function normalizeErrors<T extends FormRecord = FormRecord>(errors: Record<string, any> | undefined, values: T) {
  if (!errors) return errors

  const result: Record<string, any> = {}
  Object.keys(errors).forEach((field) => {
    const fieldErrors = errors[field]
    const value = (values as Record<string, any>)[field]

    const isEmpty = value === undefined || value === null || value === ""

    const isRequiredError = (err: any) =>
      err?.required === true || err?.type === "required" || err?._inner === true || (typeof err?.message === "string" && err.message.includes("必填"))

    const filtered = Array.isArray(fieldErrors) ? fieldErrors.filter(err => !(isRequiredError(err) && !isEmpty)) : fieldErrors

    if (Array.isArray(filtered) && filtered.length > 0) result[field] = filtered
  })

  return Object.keys(result).length ? result : undefined
}

/**
 * 组合 actions 与 methods，提供统一入口。
 * 返回平铺对象方便直接解构，也同时暴露分组字段便于区分。
 */
export function useFormApi<T extends FormRecord = FormRecord>(ctx: FormActionContext<T>) {
  const actions = useAction(ctx)
  const methods = useMethods(ctx as any)
  return {
    actions,
    methods,
    ...actions,
    ...methods,
  }
}
