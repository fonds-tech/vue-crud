import type { Ref } from "vue"
import type { Arrayable } from "element-plus/es/utils"
import type { FormRecord, FormMethods, FormOptions } from "./types"
import type { FormInstance, FormItemProp, FormValidateCallback, FormValidationResult } from "element-plus"
import formHook from "./hooks"
import { clone, isDef, isFunction } from "@fonds/utils"

const propToString = (prop?: FormItemProp) => (Array.isArray(prop) ? prop.join(".") : String(prop ?? ""))

interface MethodsContext<T extends FormRecord = FormRecord> {
  options: FormOptions<T>
  form: Ref<FormInstance | undefined>
  model: T
}

/**
 * 构建表单方法集合，封装并增强 Element Plus Form 原生方法（含 submit 钩子处理）。
 * @param options 表单配置选项
 * @param form Element Plus Form 实例引用
 * @param model 表单数据模型
 * @returns 表单方法集合
 */
export function useMethods<T extends FormRecord = FormRecord>({ options, form, model }: MethodsContext<T>): FormMethods<T> {
  /**
   * 确保字段参数为字符串数组
   * @param field 单个或多个字段名
   * @returns 字段名数组
   */
  const ensureFieldsArray = (field?: Arrayable<FormItemProp>): string[] | undefined => {
    if (!field)
      return undefined
    const flatten = Array.isArray(field) ? field : [field]
    return flatten.flatMap(item => (Array.isArray(item) ? item : [item]))
  }

  const methods: FormMethods<T> = {
    /**
     * 验证整个表单
     * @param callback 验证完成的回调
     * @returns Promise<boolean>
     */
    validate(callback?: FormValidateCallback) {
      if (!form.value) {
        callback?.(true)
        return Promise.resolve(true)
      }
      return form.value.validate((isValid, invalidFields) => {
        callback?.(isValid, invalidFields)
      })
    },

    /**
     * 验证指定字段
     * @param props 单个或多个字段 prop
     * @param callback 验证回调
     * @returns Promise
     */
    validateField(props?: Arrayable<FormItemProp>, callback?: FormValidateCallback) {
      if (!form.value) {
        callback?.(true)
        return Promise.resolve(true) as FormValidationResult
      }
      return form.value.validateField(props, callback)
    },

    /**
     * 重置表单项
     * @description 将其值重置为初始值，并移除校验结果
     * @param field 单个或多个字段 prop
     */
    resetFields(field?: Arrayable<FormItemProp>) {
      form.value?.resetFields(field)
    },

    /**
     * 清空字段值 (手动删除 model 中的属性)
     * @description 与 resetFields 不同，此方法直接从 model 中移除属性，且不依赖初始值
     * @param field 单个或多个字段 prop
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

    /**
     * 移除表单项的校验结果
     * @param field 单个或多个字段 prop
     */
    clearValidate(field?: Arrayable<FormItemProp>) {
      form.value?.clearValidate(field)
    },

    /**
     * 批量设置字段值
     * @description 直接赋值到 model，不触发特殊逻辑
     * @param data 键值对数据
     */
    setFields(data: Record<string, any>) {
      Object.keys(data).forEach((key) => {
        model[key as keyof T] = data[key]
      })
    },

    /**
     * 滚动到指定表单项
     * @param field 字段 prop
     */
    scrollToField(field: FormItemProp) {
      form.value?.scrollToField(field)
    },

    /**
     * 提交表单
     * @description
     * 1. 执行表单校验
     * 2. 校验通过后，克隆当前 model 数据
     * 3. 过滤掉“假阳性”的必填错误 (值存在但被误判的情况)
     * 4. 执行配置在表单项上的 submit hook (数据转换)
     * 5. 触发 callback 和 options.onSubmit
     * @param callback 可选的回调
     * @returns Promise 返回处理后的数据和可能的错误
     */
    submit(callback?: (model: T, errors: Record<string, any> | undefined) => void) {
      return new Promise<{ values: T, errors: Record<string, any> | undefined }>((resolve) => {
        methods.validate((_, invalidFields) => {
          // 克隆数据，避免 hook 修改影响原始 model
          const values = clone(model) as T

          // 过滤无效错误
          const normalizedErrors = normalizeErrors(invalidFields as Record<string, any> | undefined, values)
          const hasErrors = Boolean(normalizedErrors && Object.keys(normalizedErrors).length > 0)

          if (!hasErrors) {
            // 遍历所有表单项，执行 submit 阶段的 hook
            options.items.forEach((item) => {
              const propName = propToString(item.prop)
              // 只有当 model 中存在该值时才执行 hook
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

          // 调用一次性回调
          if (isFunction(callback)) {
            callback(values, normalizedErrors)
          }

          // 触发全局 onSubmit 回调（仅在校验通过后触发）
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

/**
 * 过滤已填写字段的必填错误
 * @description
 * 某些情况下（如自定义组件值更新滞后），validator 可能报告必填错误，但 model 实际已有值。
 * 此函数用于再次确认 model 值是否真的为空，如果非空则忽略必填错误。
 * @param errors 原始错误对象
 * @param values 当前表单数据
 * @returns 过滤后的错误对象或 undefined
 */
function normalizeErrors<T extends FormRecord = FormRecord>(errors: Record<string, any> | undefined, values: T) {
  if (!errors)
    return errors

  const result: Record<string, any> = {}
  Object.keys(errors).forEach((field) => {
    const fieldErrors = errors[field]
    const value = (values as Record<string, any>)[field]

    // 判空规则：仅 undefined/null/"" 视为未填；0/false/[] 等都视为有值
    const isEmpty = value === undefined || value === null || value === ""

    // 判断是否为必填相关错误
    const isRequiredError = (err: any) =>
      err?.required === true
      || err?.type === "required"
      || err?._inner === true
      || (typeof err?.message === "string" && err.message.includes("必填"))

    // 过滤掉：是必填错误 且 值不为空 的项
    const filtered = Array.isArray(fieldErrors)
      ? fieldErrors.filter(err => !(isRequiredError(err) && !isEmpty))
      : fieldErrors

    if (Array.isArray(filtered) && filtered.length > 0)
      result[field] = filtered
  })

  return Object.keys(result).length ? result : undefined
}
