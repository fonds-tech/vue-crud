import type { Ref } from "vue"
import type { FormInstance, FormItemProp } from "element-plus"
import type {
  FormItem,
  FormMode,
  FormRecord,
  FormActions,
  FormMaybeFn,
  FormOptions,
  MaybePromise,
  FormItemRuleWithMeta,
  FormAsyncOptionsState,
} from "./types"
import formHook from "./hooks"
import { dataset } from "../../utils/dataset"
import { clone, isDef, isNoEmpty, isFunction } from "@fonds/utils"

const isPromiseLike = <T>(value: unknown): value is Promise<T> => Boolean(value && typeof (value as any).then === "function")

interface ActionContext<T extends FormRecord = FormRecord> {
  options: FormOptions<T>
  model: T
  form: Ref<FormInstance | undefined>
  optionState: Record<string, FormAsyncOptionsState>
}

function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

/**
 * 将 FormItemProp 规范化为路径数组
 * @param prop 字段 prop (字符串或数组)
 * @returns 路径字符串数组或 undefined
 */
function toPathArray(prop?: FormItemProp): string[] | undefined {
  if (prop === undefined || prop === null)
    return undefined
  if (Array.isArray(prop))
    return prop.map(String)
  const path = String(prop).split(".").filter(Boolean)
  return path.length ? path : undefined
}

/**
 * 将路径转为展示用字符串 (e.g., 'user.name')
 * @param prop 字段 prop
 * @returns 路径字符串
 */
function propToString(prop?: FormItemProp): string {
  const path = toPathArray(prop)
  return path?.join(".") ?? ""
}

/**
 * 读取模型中的值，支持嵌套路径
 * @param model 表单模型对象
 * @param prop 字段 prop
 * @returns 对应的值
 */
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

/**
 * 写入模型中的值，支持嵌套路径，自动创建中间对象
 * @param model 表单模型对象
 * @param prop 字段 prop
 * @param value 要设置的值
 */
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
 * @description 提供一系列编程式操作表单配置、数据和状态的方法
 * @param params 上下文参数对象
 * @param params.options 表单配置选项
 * @param params.model 表单数据模型
 * @param params.form Element Plus Form 实例引用
 * @param params.optionState 选项状态记录 (Ref Object)
 * @returns 表单操作方法集合
 */
export function useAction<T extends FormRecord = FormRecord>({ options, model, form, optionState }: ActionContext<T>): FormActions<T> {
  /**
   * 查找表单项配置对象
   * @param prop 表单项 prop
   * @returns 表单项配置对象或 undefined
   */
  function findItem(prop?: FormItemProp): FormItem<T> | undefined {
    if (prop === undefined || prop === null)
      return undefined
    const propKey = propToString(prop)
    return options.items.find(item => propToString(item.prop) === propKey)
  }

  let optionRequestId = 0

  /**
   * 确保选项状态存在
   * @param prop 字段 prop
   * @returns 状态对象
   */
  function ensureOptionState(prop?: FormItemProp) {
    const key = propToString(prop)
    if (!optionState[key])
      optionState[key] = { loading: false }
    return optionState[key]!
  }

  /**
   * 将同步/异步 options 同步到状态，处理竞态
   * @param prop 字段 prop
   * @param value 选项数据或 Promise
   * @returns 最新状态
   */
  function syncOptionsState(prop: FormItemProp, value: MaybePromise<any[]>) {
    const state = ensureOptionState(prop)
    if (isPromiseLike(value)) {
      const requestId = ++optionRequestId
      state.loading = true
      state.error = undefined
      state.requestId = requestId
      value
        .then((data) => {
          if (state.requestId === requestId) {
            state.value = data
            state.loading = false
          }
        })
        .catch((error) => {
          if (state.requestId === requestId) {
            state.error = error
            state.loading = false
          }
        })
      return state
    }
    state.value = value
    state.loading = false
    state.error = undefined
    return state
  }

  /**
   * 解析表单项配置中的 options
   * @param prop 字段 prop
   * @returns 同步或异步 options
   */
  function resolveOptionSource(prop: FormItemProp): MaybePromise<any[]> | undefined {
    const optionValue = findItem(prop)?.component?.options as FormMaybeFn<MaybePromise<any[]>, T> | undefined
    if (!optionValue)
      return undefined
    return isFunction(optionValue) ? optionValue(model) : optionValue
  }

  /**
   * 通用设置函数
   * @description 修改表单项的属性、选项、样式等，是内部核心修改器
   * @param target 目标定位参数
   * @param target.prop 目标表单项的 prop
   * @param target.key 修改的属性键名 ('options' | 'props' | 'hidden' | 'style')
   * @param target.path 直接修改的深层路径 (dataset 模式)
   * @param value 要设置的新值
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
    // 如果指定了深层路径，直接修改 dataset (通常用于全局配置或非表单项的深层属性)
    if (path) {
      dataset(options as unknown as Record<string, unknown>, path, value)
      return
    }

    const target = findItem(prop)
    if (!target) {
      console.warn(`[fd-form] prop "${propToString(prop)}" was not found in items`)
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
        // 默认合并到表单项配置顶层 (如 label, span 等)
        Object.assign(target, value)
        break
    }
  }

  /**
   * 设置表单模式
   * @param mode 模式 ('add' | 'update')
   */
  function setMode(mode: FormMode) {
    options.mode = mode
  }

  /**
   * 获取字段值
   * @param prop 字段 prop，省略则返回整个 model
   * @returns 字段值或整个 model
   */
  function getField(prop?: FormItemProp) {
    if (!prop) {
      return model
    }
    return getModelValue(model, prop)
  }

  /**
   * 设置字段值
   * @param prop 字段 prop
   * @param value 新值
   */
  function setField(prop: FormItemProp, value: any) {
    setModelValue(model, prop, value)
  }

  /**
   * 更新表单项配置
   * @param prop 字段 prop
   * @param data 配置对象 (Partial)
   */
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
   * 5. 触发 bind hook 进行数据转换
   * @param data 要绑定的数据对象
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

    // 恢复默认值 (仅当传入数据中没有该字段时)
    options.items.forEach((item) => {
      if (item.prop && isDef(item.value)) {
        const key = propToString(item.prop)
        normalizedValues[key] = isDef(normalizedValues[key]) ? normalizedValues[key] : clone(item.value)
      }
    })

    // 赋值新数据到 model
    Object.entries(normalizedValues).forEach(([prop, fieldValue]) => {
      setField(prop as FormItemProp, fieldValue)
    })

    // 执行 bind 阶段钩子，确保重新绑定时类型/结构与组件期望一致
    // 例如：后端返回逗号分隔字符串 "1,2"，bind hook 将其转为数组 ["1", "2"] 供 CheckboxGroup 使用
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

    // 对已绑定的数据，重置校验提示
    // 避免因数据变更立即触发 rule 校验导致红色报错 (用户还没开始交互)
    const fields = Object.keys(normalizedValues)
    if (fields.length && form.value?.clearValidate) {
      form.value.clearValidate(fields)
    }
  }

  /**
   * 通过路径设置配置数据
   * @param path 属性路径 (如 'form.labelWidth')
   * @param value 新值
   */
  function setData(path: string, value: any) {
    set({ path }, value)
  }

  /**
   * 设置组件选项 (options)
   * @description 针对 Select/Radio 等组件
   * @param prop 字段 prop
   * @param value 选项数组或 Promise
   */
  function setOptions(prop: FormItemProp, value: MaybePromise<any[]>) {
    set({ prop, key: "options" }, value)
    syncOptionsState(prop, value)
  }

  /**
   * 获取组件选项
   * @param prop 字段 prop
   * @returns 选项数组或 undefined
   */
  function getOptions(prop: FormItemProp) {
    const optionValue = resolveOptionSource(prop)
    if (optionValue === undefined)
      return ensureOptionState(prop).value
    const state = syncOptionsState(prop, optionValue)
    if (isPromiseLike(optionValue))
      return state.value
    return state.value ?? optionValue
  }

  /**
   * 获取选项加载状态
   * @param prop 字段 prop
   */
  function getOptionsState(prop: FormItemProp) {
    return ensureOptionState(prop)
  }

  /**
   * 主动重新加载组件选项
   * @param prop 字段 prop
   */
  async function reloadOptions(prop: FormItemProp) {
    const optionValue = resolveOptionSource(prop)
    if (optionValue === undefined)
      return ensureOptionState(prop).value
    const state = syncOptionsState(prop, optionValue)
    try {
      const data = await Promise.resolve(optionValue)
      state.value = data
      state.loading = false
      state.error = undefined
      return data
    }
    catch (error) {
      state.error = error
      state.loading = false
      return undefined
    }
  }

  /**
   * 设置组件 Props
   * @param prop 字段 prop
   * @param value props 对象
   */
  function setProps(prop: FormItemProp, value: Record<string, any>) {
    set({ prop, key: "props" }, value)
  }

  /**
   * 设置组件样式
   * @param prop 字段 prop
   * @param value 样式对象
   */
  function setStyle(prop: FormItemProp, value: Record<string, any>) {
    set({ prop, key: "style" }, value)
  }

  /**
   * 隐藏表单项
   * @param fields 单个或多个字段 prop
   */
  function hideItem(fields: FormItemProp | FormItemProp[]) {
    toArray(fields).forEach(field => set({ prop: field, key: "hidden" }, true))
  }

  /**
   * 显示表单项
   * @param fields 单个或多个字段 prop
   */
  function showItem(fields: FormItemProp | FormItemProp[]) {
    toArray(fields).forEach(field => set({ prop: field, key: "hidden" }, false))
  }

  /**
   * 切换栅格折叠状态
   * @param state 指定状态 (true: 折叠, false: 展开)，省略则切换
   */
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
   * @description 自动添加或更新 required 规则，并保留其他手动配置的 rules
   * @param prop 字段 prop
   * @param required 是否必填
   */
  function setRequired(prop: FormItemProp, required: boolean) {
    const item = findItem(prop)
    if (!item)
      return

    item.required = required
    const label = item.label || propToString(prop)
    // 标记 _inner: true 以便后续识别和替换
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
      // 如果取消必填，移除内部规则
      ruleList.splice(innerIndex, 1)
    }

    item.rules = ruleList

    // 重新应用校验规则后清理当前字段的校验状态，避免旧错误残留
    form.value?.clearValidate?.([propToString(prop)])
    // 若启用了 validate-on-rule-change，仍可能在下一轮 tick 触发；
    // 显式再次清除 (根据 Element Plus 行为，rule 变更会立即触发校验)
    if (form.value) {
      setTimeout(() => {
        form.value?.clearValidate?.([propToString(prop)])
      }, 0)
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
    getOptionsState,
    reloadOptions,
    setProps,
    setStyle,
    hideItem,
    showItem,
    collapse,
    setRequired,
  }

  return actions
}
