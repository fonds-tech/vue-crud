import type { Ref } from "vue"
import type { Arrayable } from "element-plus/es/utils"
import type { FormRecord, FormMethods, FormOptions } from "../type"
import type { FormInstance, FormItemProp, FormValidateCallback, FormValidationResult } from "element-plus"
import formHook from "../../../utils/formHook"
import { cloneDeep } from "lodash-es"
import { isDef, isFunction } from "@fonds/utils"

interface MethodsContext<T extends FormRecord = FormRecord> {
  options: FormOptions<T>
  form: Ref<FormInstance | undefined>
  model: T
}

export function useMethods<T extends FormRecord = FormRecord>({ options, form, model }: MethodsContext<T>): FormMethods<T> {
  const ensureFieldsArray = (field?: Arrayable<FormItemProp>): string[] | undefined => {
    if (!field)
      return undefined
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
          const values = cloneDeep(model) as T
          options.items.forEach((item) => {
            const fieldName = String(item.field)
            if (item.hook && item.field && isDef(values[fieldName as keyof T])) {
              formHook.submit({
                hook: item.hook,
                model: values,
                field: fieldName,
                value: values[fieldName as keyof T],
              })
            }
          })
          const normalizedErrors = invalidFields as Record<string, any> | undefined
          if (isFunction(callback)) {
            callback(values, normalizedErrors)
          }
          if (isFunction(options.onSubmit)) {
            options.onSubmit(values, normalizedErrors)
          }
          resolve({ values, errors: normalizedErrors })
        })
      })
    },
  }

  return methods
}
