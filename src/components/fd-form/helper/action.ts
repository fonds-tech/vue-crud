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

/**
 * 表单操作 Hook
 * @description 提供一系列操作表单配置、数据和状态的方法
 */
export function useAction<T extends FormRecord = FormRecord>({ options, model, form }: ActionContext<T>): FormActions<T> {
  /**
   * 查找表单项配置
   * @param field 字段名
   */
  function findItem(field?: keyof T | string): FormItem<T> | undefined {
    if (field === undefined || field === null)
      return undefined
    const fieldKey = String(field)
    return options.items.find(item => String(item.field) === fieldKey)
  }

  /**
   * 通用设置函数
   * @description 修改表单项的属性、选项、样式等
   */
  function set({
    field,
    key,
    path,
  }: {
    field?: keyof T | string
    key?: "options" | "props" | "hidden" | "style"
    path?: string
  }, value?: any) {
    // 如果指定了深层路径，直接修改 dataset
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
        // 设置组件选项 (如 Select 的 options)
        target.component = target.component || {}
        target.component.options = value
        break
      case "props":
        // 合并组件 props
        target.component = target.component || {}
        target.component.props = {
          ...(target.component.props || {}),
          ...value,
        }
        break
      case "hidden":
        // 设置显隐状态
        target.hidden = value
        break
      case "style":
        // 合并组件样式
        target.component = target.component || {}
        target.component.style = {
          ...(target.component.style || {}),
          ...value,
        }
        break
      default:
        // 默认合并到表单项配置顶层
        Object.assign(target, value)
        break
    }
  }

  // 设置表单模式 (add/update)
  function setMode(mode: FormMode) {
    options.mode = mode
  }

  // 获取字段值
  function getField(field?: keyof T | string) {
    if (!field) {
      return model
    }
    return model[field as keyof T]
  }

  // 设置字段值
  function setField(field: keyof T | string, value: any) {
    model[field as keyof T] = value
  }

  // 更新表单项配置
  function setItem(field: keyof T | string, data: Partial<FormItem<T>>) {
    set({ field }, data)
  }

  /**
   * 批量绑定数据到表单
   * @description
   * 1. 重置表单验证状态
   * 2. 清空当前模型数据
   * 3. 应用表单项默认值
   * 4. 将传入数据覆盖到模型
   */
  function bindFields(data: Partial<T> = {}) {
    const values = cloneDeep(data)
    const normalizedValues = values as Record<string, any>
    form.value?.resetFields()
    form.value?.clearValidate()

    // 清空现有模型
    Object.keys(model).forEach((key) => {
      delete model[key]
    })

    // 恢复默认值
    options.items.forEach((item) => {
      if (item.field && isDef(item.value)) {
        const key = String(item.field)
        normalizedValues[key] = isDef(normalizedValues[key]) ? normalizedValues[key] : cloneDeep(item.value)
      }
    })

    // 赋值新数据
    Object.entries(normalizedValues).forEach(([field, fieldValue]) => {
      setField(field as keyof T | string, fieldValue)
    })
  }

  // 通过路径设置数据
  function setData(path: string, value: any) {
    set({ path }, value)
  }

  // 设置组件选项 (options)
  function setOptions(field: keyof T | string, value: any[]) {
    set({ field, key: "options" }, value)
  }

  // 获取组件选项
  function getOptions(field: keyof T | string) {
    const optionValue = findItem(field)?.component?.options as FormMaybeFn<any[], T> | undefined
    if (!optionValue)
      return undefined
    return isFunction(optionValue) ? optionValue(model) : optionValue
  }

  // 设置组件 Props
  function setProps(field: keyof T | string, value: Record<string, any>) {
    set({ field, key: "props" }, value)
  }

  // 设置组件样式
  function setStyle(field: keyof T | string, value: Record<string, any>) {
    set({ field, key: "style" }, value)
  }

  // 隐藏表单项
  function hideItem(fields: keyof T | string | Array<keyof T | string>) {
    toArray(fields).forEach(field => set({ field, key: "hidden" }, true))
  }

  // 显示表单项
  function showItem(fields: keyof T | string | Array<keyof T | string>) {
    toArray(fields).forEach(field => set({ field, key: "hidden" }, false))
  }

  // 切换折叠状态
  function collapse(state?: boolean) {
    if (!options.grid) {
      options.grid = {}
    }
    const nextState = typeof state === "boolean" ? state : !options.grid.collapsed
    options.grid = {
      ...options.grid,
      collapsed: nextState,
    }
  }

  /**
   * 动态设置必填状态
   * @description 自动添加或更新 required 规则，并保留其他校验规则
   */
  function setRequired(field: keyof T | string, required: boolean) {
    const item = findItem(field)
    if (!item)
      return

    const label = item.label || String(field)
    const rule: FormItemRuleWithMeta = { required, message: `${label}为必填项`, _inner: true }

    if (isNoEmpty(item.rules)) {
      const ruleList: FormItemRuleWithMeta[] = (Array.isArray(item.rules) ? item.rules : [item.rules]).filter(Boolean) as FormItemRuleWithMeta[]
      // 查找并替换内部自动生成的 required 规则
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
