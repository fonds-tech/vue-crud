import type { Ref } from "vue"
import type { FormModel, FormOptions, FormSubmitResult } from "../../../types"
import type { FormInstance, FormItemProp, FormValidateCallback } from "element-plus"
import formHook from "../../../utils/formHook"
import { isArray, cloneDeep } from "lodash-es"

interface MethodsContext {
  options: FormOptions
  model: Record<string, unknown>
  form: Ref<FormInstance | undefined>
}

export interface FormMethods {
  submit: (callback?: (model: Record<string, any>, errors?: Record<string, any>) => void) => Promise<FormSubmitResult>
  validate: (callback?: FormValidateCallback) => ReturnType<FormInstance["validate"]>
  validateField: (field?: FormItemProp | FormItemProp[], callback?: FormValidateCallback) => ReturnType<FormInstance["validateField"]>
  resetFields: (field?: FormItemProp | FormItemProp[]) => void
  clearFields: (field?: FormItemProp | FormItemProp[]) => void
  clearValidate: (field?: FormItemProp | FormItemProp[]) => void
  scrollToField: (field: FormItemProp) => void
}

export function useFormMethods({ options, model, form }: MethodsContext): FormMethods {
  function runSubmitHooks(target: Record<string, unknown>) {
    options.items.forEach((item) => {
      if (item.hook !== undefined && item.field !== undefined) {
        const fieldKey = String(item.field)
        const fieldValue: unknown = target[fieldKey]
        formHook.submit({
          hook: item.hook,
          model: target as FormModel,
          field: item.field,
          value: fieldValue,
        })
      }
      item.children?.forEach((child) => {
        if (child.hook !== undefined && child.field !== undefined) {
          const fieldKey = String(child.field)
          const fieldValue: unknown = target[fieldKey]
          formHook.submit({
            hook: child.hook,
            model: target as FormModel,
            field: child.field,
            value: fieldValue,
          })
        }
      })
    })
  }

  async function submit(callback?: (model: Record<string, any>, errors?: Record<string, any>) => void): Promise<FormSubmitResult> {
    return new Promise((resolve) => {
      if (!form.value) {
        const snapshot = cloneDeep<Record<string, unknown>>(model)
        runSubmitHooks(snapshot)
        const normalizedModel = snapshot as Record<string, any>
        callback?.(normalizedModel, undefined)
        options.onSubmit?.(normalizedModel, undefined)
        resolve({ model: normalizedModel, errors: undefined })
        return
      }
      void form.value.validate((valid, fields) => {
        const nextModel = cloneDeep<Record<string, unknown>>(model)
        runSubmitHooks(nextModel)
        const normalizedModel = nextModel as Record<string, any>
        const typedErrors = valid ? undefined : (fields as Record<string, any> | undefined)
        callback?.(normalizedModel, typedErrors)
        options.onSubmit?.(normalizedModel, typedErrors)
        resolve({ model: normalizedModel, errors: typedErrors })
      })
    })
  }

  const validate = async (callback?: FormValidateCallback) => form.value?.validate(callback) ?? Promise.resolve(true)

  const validateField = async (field?: FormItemProp | FormItemProp[], callback?: FormValidateCallback) => form.value?.validateField(field, callback) ?? Promise.resolve(true)

  const resetFields = (field?: FormItemProp | FormItemProp[]) => form.value?.resetFields(field)

  function clearFields(field?: FormItemProp | FormItemProp[]) {
    const list = field !== undefined ? (isArray(field) ? field : [field]) : Object.keys(model)
    list.forEach((name) => {
      delete model[String(name)]
    })
    form.value?.clearValidate(field)
  }

  function clearValidate(field?: FormItemProp | FormItemProp[]) {
    form.value?.clearValidate(field)
  }

  const scrollToField = (field: FormItemProp) => form.value?.scrollToField(field)

  return {
    submit,
    validate,
    validateField,
    resetFields,
    clearFields,
    clearValidate,
    scrollToField,
  }
}
