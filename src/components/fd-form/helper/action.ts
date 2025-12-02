import type { Ref } from "vue"
import type { FormInstance, FormItemProp } from "element-plus"
import type {
  FormItem,
  FormMode,
  FormRecord,
  FormActions,
  FormMaybeFn,
  FormOptions,
  FormItemRuleWithMeta,
} from "../type"
import formHook from "./hooks"
import { dataset } from "../../../utils/dataset"
import { clone, isDef, isNoEmpty, isFunction } from "@fonds/utils"

interface ActionContext<T extends FormRecord = FormRecord> {
  options: FormOptions<T>
  model: T
  form: Ref<FormInstance | undefined>
}

function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

// 将 FormItemProp 规范化为路径数组
function toPathArray(prop?: FormItemProp): string[] | undefined {
  if (prop === undefined || prop === null)
    return undefined
  if (Array.isArray(prop))
    return prop.map(String)
  const path = String(prop).split(".").filter(Boolean)
  return path.length ? path : undefined
}

// 将路径转为展示用字符串
function propToString(prop?: FormItemProp): string {
  const path = toPathArray(prop)
  return path?.join(".") ?? ""
}

// 读取模型中的值，支持嵌套路径
function getModelValue<T extends FormRecord = FormRecord>(model: T, prop?: FormItemProp) {
  const path = toPathArray(prop)
  if (!path?.length)
    return model
  let cursor: any = model
  for (const segment of path) {
    if (cursor == null || typeof cursor !== "object")
      return undefined
    cursor = cursor[segment]
  }
  return cursor
}

// 写入模型中的值，支持嵌套路径，自动创建中间对象
function setModelValue<T extends FormRecord = FormRecord>(model: T, prop: FormItemProp, value: any) {
  const path = toPathArray(prop)
  if (!path?.length)
    return
  let cursor: any = model
  for (let i = 0; i < path.length; i++) {
    const key = path[i]!
    if (i === path.length - 1) {
      cursor[key] = value
      return
    }
    cursor[key] = cursor[key] ?? {}
    cursor = cursor[key]
  }
}

/**
 * 表单操作 Hook
 * @description 提供一系列操作表单配置、数据和状态的方法
 */
export function useAction<T extends FormRecord = FormRecord>({ options, model, form }: ActionContext<T>): FormActions<T> {
  /**
   * 查找表单项配置
   * @param prop 表单项 prop
   */
  function findItem(prop?: FormItemProp): FormItem<T> | undefined {
    if (prop === undefined || prop === null)
      return undefined
    const propKey = propToString(prop)
    return options.items.find(item => propToString(item.prop) === propKey)
  }

  /**
   * 通用设置函数
   * @description 修改表单项的属性、选项、样式等
   */
  function set({
    prop,
    key,
    path,
  }: {
    prop?: FormItemProp
    key?: "options" | "props" | "hidden" | "style"
    path?: string
  }, value?: any) {
    // 如果指定了深层路径，直接修改 dataset
    if (path) {
      dataset(options as unknown as Record<string, unknown>, path, value)
      return
    }

    const target = findItem(prop)
    if (!target) {
      console.error(`[fd-form] prop "${propToString(prop)}" was not found`)
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
  function getField(prop?: FormItemProp) {
    if (!prop) {
      return model
    }
    return getModelValue(model, prop)
  }

  // 设置字段值
  function setField(prop: FormItemProp, value: any) {
    setModelValue(model, prop, value)
  }

  // 更新表单项配置
  function setItem(prop: FormItemProp, data: Partial<FormItem<T>>) {
    set({ prop }, data)
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
    const values = clone(data)
    const normalizedValues = values as Record<string, any>
    form.value?.resetFields()
    form.value?.clearValidate()

    // 清空现有模型
    Object.keys(model).forEach((key) => {
      delete model[key]
    })

    // 恢复默认值
    options.items.forEach((item) => {
      if (item.prop && isDef(item.value)) {
        const key = propToString(item.prop)
        normalizedValues[key] = isDef(normalizedValues[key]) ? normalizedValues[key] : clone(item.value)
      }
    })

    // 赋值新数据
    Object.entries(normalizedValues).forEach(([prop, fieldValue]) => {
      setField(prop as FormItemProp, fieldValue)
    })

    // 执行 bind 阶段钩子，确保重新绑定时类型/结构与组件期望一致
    options.items.forEach((item) => {
      if (!item.hook || !item.prop)
        return
      const propKey = propToString(item.prop)
      const currentValue = getModelValue(model, item.prop)
      if (!isDef(currentValue))
        return
      formHook.bind({
        hook: item.hook,
        model,
        field: propKey,
        value: currentValue,
      })
    })

    // 对已绑定的数据，重置校验提示，避免必填规则变更后立即报错
    const fields = Object.keys(normalizedValues)
    if (fields.length && form.value?.clearValidate) {
      form.value.clearValidate(fields)
    }
  }

  // 通过路径设置数据
  function setData(path: string, value: any) {
    set({ path }, value)
  }

  // 设置组件选项 (options)
  function setOptions(prop: FormItemProp, value: any[]) {
    set({ prop, key: "options" }, value)
  }

  // 获取组件选项
  function getOptions(prop: FormItemProp) {
    const optionValue = findItem(prop)?.component?.options as FormMaybeFn<any[], T> | undefined
    if (!optionValue)
      return undefined
    return isFunction(optionValue) ? optionValue(model) : optionValue
  }

  // 设置组件 Props
  function setProps(prop: FormItemProp, value: Record<string, any>) {
    set({ prop, key: "props" }, value)
  }

  // 设置组件样式
  function setStyle(prop: FormItemProp, value: Record<string, any>) {
    set({ prop, key: "style" }, value)
  }

  // 隐藏表单项
  function hideItem(fields: FormItemProp | FormItemProp[]) {
    toArray(fields).forEach(field => set({ prop: field, key: "hidden" }, true))
  }

  // 显示表单项
  function showItem(fields: FormItemProp | FormItemProp[]) {
    toArray(fields).forEach(field => set({ prop: field, key: "hidden" }, false))
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
  function setRequired(prop: FormItemProp, required: boolean) {
    const item = findItem(prop)
    if (!item)
      return

    item.required = required
    const label = item.label || propToString(prop)
    const rule: FormItemRuleWithMeta = { required, message: `${label}为必填项`, _inner: true }

    const ruleList: FormItemRuleWithMeta[] = isNoEmpty(item.rules)
      ? (Array.isArray(item.rules) ? item.rules : [item.rules]).filter(Boolean) as FormItemRuleWithMeta[]
      : []

    const innerIndex = ruleList.findIndex(r => r._inner === true)

    if (required) {
      if (innerIndex > -1)
        ruleList[innerIndex] = rule
      else
        ruleList.unshift(rule)
    }
    else if (innerIndex > -1) {
      ruleList.splice(innerIndex, 1)
    }

    item.rules = ruleList
    // 重新应用校验规则后清理当前字段的校验状态，避免旧错误残留
    form.value?.clearValidate?.([propToString(prop)])
    // 若启用了 validate-on-rule-change，仍可能在下一轮触发；显式标记避免同步校验
    if (form.value) {
      form.value.clearValidate([propToString(prop)])
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
