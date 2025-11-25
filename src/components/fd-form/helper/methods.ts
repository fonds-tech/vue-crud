import type { Ref } from "vue"
import type { Arrayable } from "element-plus/es/utils"
import type { FormRecord, FormMethods, FormOptions } from "../type"
import type { FormInstance, FormItemProp, FormValidateCallback, FormValidationResult } from "element-plus"
import formHook from "./hooks"
import { clone, isDef, isFunction } from "@fonds/utils"

interface MethodsContext<T extends FormRecord = FormRecord> {
  options: FormOptions<T>
  form: Ref<FormInstance | undefined>
  model: T
}

/**
 * 表单原生方法 Hook
 * @description 封装 Element Plus Form 的原生方法，并增强 submit 逻辑
 */
export function useMethods<T extends FormRecord = FormRecord>({ options, form, model }: MethodsContext<T>): FormMethods<T> {
  /**
   * 确保字段参数为字符串数组
   * @param field 单个或多个字段名
   */
  const ensureFieldsArray = (field?: Arrayable<FormItemProp>): string[] | undefined => {
    if (!field)
      return undefined
    const flatten = Array.isArray(field) ? field : [field]
    return flatten.flatMap(item => (Array.isArray(item) ? item : [item]))
  }

  const methods: FormMethods<T> = {
    // 验证整个表单
    validate(callback?: FormValidateCallback) {
      if (!form.value) {
        callback?.(true)
        return Promise.resolve(true)
      }
      return form.value.validate((isValid, invalidFields) => {
        callback?.(isValid, invalidFields)
      })
    },

    // 验证指定字段
    validateField(props?: Arrayable<FormItemProp>, callback?: FormValidateCallback) {
      if (!form.value) {
        callback?.(true)
        return Promise.resolve(true) as FormValidationResult
      }
      return form.value.validateField(props, callback)
    },

    // 重置表单项，将其值重置为初始值，并移除校验结果
    resetFields(field?: Arrayable<FormItemProp>) {
      form.value?.resetFields(field)
    },

    /**
     * 清空字段值 (手动删除 model 中的属性)
     * @description 与 resetFields 不同，此方法直接从 model 中移除属性，且不依赖初始值
     */
    clearFields(field?: Arrayable<FormItemProp>) {
      const targets = ensureFieldsArray(field)
      if (!targets) {
        // 如果未指定字段，清空所有
        Object.keys(model).forEach((key) => {
          delete model[key]
        })
      }
      else {
        targets.forEach((key) => {
          delete model[key]
        })
      }
      // 同时清除校验状态
      form.value?.clearValidate(field)
    },

    // 移除表单项的校验结果
    clearValidate(field?: Arrayable<FormItemProp>) {
      form.value?.clearValidate(field)
    },

    // 批量设置字段值 (直接赋值，不触发特殊逻辑)
    setFields(data: Record<string, any>) {
      Object.keys(data).forEach((key) => {
        model[key as keyof T] = data[key]
      })
    },

    // 滚动到指定表单项
    scrollToField(field: FormItemProp) {
      form.value?.scrollToField(field)
    },

    /**
     * 提交表单
     * @description
     * 1. 执行表单校验
     * 2. 校验通过后，克隆当前 model 数据
     * 3. 执行配置在表单项上的 submit hook (数据转换)
     * 4. 触发 callback 和 options.onSubmit
     * @returns Promise 返回处理后的数据和可能的错误
     */
    submit(callback?: (model: T, errors: Record<string, any> | undefined) => void) {
      return new Promise<{ values: T, errors: Record<string, any> | undefined }>((resolve) => {
        methods.validate((_, invalidFields) => {
          // 克隆数据，避免 hook 修改影响原始 model
          const values = clone(model) as T

          const normalizedErrors = invalidFields as Record<string, any> | undefined
          const hasErrors = Boolean(normalizedErrors && Object.keys(normalizedErrors).length > 0)

          if (!hasErrors) {
            // 遍历所有表单项，执行 submit 阶段的 hook
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
          }

          if (isFunction(callback)) {
            callback(values, normalizedErrors)
          }

          // 触发全局 onSubmit 回调（仅在校验通过后）
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
