import type { FormInstance, FormItemProp } from "element-plus"
import type { Ref, VNode, ComputedRef, CSSProperties, Component as VueComponent } from "vue"
import type {
  FormItem,
  FormRecord,
  DeepPartial,
  FormOptions,
  InternalRule,
  MaybePromise,
  FormComponent,
  FormUseOptions,
  FormComponentSlot,
  FormItemRuleWithMeta,
  FormAsyncOptionsState,
} from "./type"
import formHook from "./helper/hooks"
import { merge } from "lodash-es"
import { useAction } from "./helper/action"
import { useMethods } from "./helper/methods"
import { clone, isDef, isNoEmpty, isFunction } from "@fonds/utils"
import { ref, useId, watch, isVNode, markRaw, computed, reactive, defineComponent } from "vue"

// 默认栅格占比（单列）
const defaultItemSpan = 1

// 引擎输出接口：暴露给渲染层与对外 API
export interface FormEngine {
  id: string
  formRef: Ref<FormInstance | undefined>
  options: FormOptions
  model: FormRecord
  step: Ref<number>
  activeGroupName: Ref<string | number | undefined>
  resolvedActiveGroup: ComputedRef<string | number | undefined>
  activeStepName: ComputedRef<string | number | undefined>
  action: ReturnType<typeof useAction>
  methods: ReturnType<typeof useMethods>
  use: (opts?: FormUseOptions) => void
  next: () => void
  prev: () => void
  helpers: FormHelpers
}

export type FormHelpers = ReturnType<typeof createHelpers>

/**
 * 表单核心引擎
 * @description 管理配置 (options)、数据模型 (model)、动作 (action) 与辅助方法 (helpers)
 * 它是 UI 无关的逻辑层，驱动 index.tsx 和 form-render.tsx
 * @returns 表单引擎实例
 */
export function useFormEngine(): FormEngine {
  // 生成唯一 ID，用于无障碍属性等
  const id = typeof useId === "function" ? useId() : `fd-form-${Math.random().toString(36).slice(2)}`
  const formRef = ref<FormInstance>()

  // 响应式配置对象，初始化默认值
  const options = reactive<FormOptions>({
    key: 0,
    mode: "add",
    model: {},
    items: [],
    group: {},
    form: {
      labelWidth: "auto",
      scrollToError: true,
      validateOnRuleChange: true,
    },
    grid: {
      cols: 1,
      colGap: 0,
      rowGap: 0,
      collapsed: false,
      collapsedRows: 1,
    },
  })

  // 响应式数据模型，直接引用 options.model
  const model = reactive(options.model) as FormRecord

  // Steps 模式的当前步骤
  const step = ref(1)
  // Tabs 模式的当前激活面板名称
  const activeGroupName = ref<string | number | undefined>(undefined)

  // 计算最终激活的分组名称 (处理默认值)
  const resolvedActiveGroup = computed<string | number | undefined>(() => {
    if (options.group?.type !== "tabs" || !options.group.children?.length) {
      return undefined
    }
    return activeGroupName.value ?? options.group.children[0]?.name
  })

  // 监听分组变化，自动修正激活的 Tab
  watch(
    () => ({
      type: options.group?.type,
      names: options.group?.children?.map(child => child?.name).filter(name => name !== undefined),
    }),
    (current) => {
      if (current.type !== "tabs") {
        activeGroupName.value = undefined
        return
      }
      const candidates = current.names ?? []
      if (!candidates.length) {
        activeGroupName.value = undefined
        return
      }
      const currentActive = activeGroupName.value
      if (currentActive === undefined || !candidates.includes(currentActive)) {
        activeGroupName.value = candidates[0]
      }
    },
    { deep: true, immediate: true },
  )

  // 创建辅助函数集合
  const loadedGroups = ref<Set<string | number>>(new Set())
  const optionState = reactive<Record<string, FormAsyncOptionsState>>({})
  const helpers = createHelpers({ options, model, resolvedActiveGroup, step, loadedGroups, optionState })
  // 创建操作动作集合
  const action = useAction({ options, model, form: formRef, optionState })
  // 创建表单方法集合
  const methods = useMethods({ options, model, form: formRef })

  // Tabs 激活面板标记为已加载
  watch(
    activeGroupName,
    (name) => {
      if (options.group?.type === "tabs")
        helpers.markGroupLoaded(name)
    },
    { immediate: true },
  )

  // Steps 当前步骤标记为已加载
  watch(
    step,
    () => {
      if (options.group?.type === "steps")
        helpers.markGroupLoaded(helpers.activeStepName.value)
    },
    { immediate: true },
  )

  /**
   * 合并用户传入的 options 到内部响应式 options
   * @param useOptions 用户配置
   */
  function mergeFormOptions(useOptions: FormUseOptions = {}) {
    if (useOptions.key !== undefined) {
      options.key = Number(useOptions.key)
    }
    if (useOptions.mode) {
      options.mode = useOptions.mode
    }
    if (useOptions.form) {
      options.form = merge({}, options.form, useOptions.form)
    }
    if (useOptions.grid) {
      options.grid = merge({}, options.grid, useOptions.grid)
    }
    if (useOptions.group) {
      options.group = merge({}, options.group, useOptions.group)
    }
    // items 数组全量替换，而非深度合并，避免顺序混乱或残留
    if (useOptions.items) {
      const nextItems = useOptions.items.filter(helpers.isFormItemConfig)
      options.items.splice(0, options.items.length, ...nextItems)
    }
    if (useOptions.onNext) {
      options.onNext = useOptions.onNext
    }
    if (useOptions.onSubmit) {
      options.onSubmit = useOptions.onSubmit
    }
    // model 数据全量替换
    if (useOptions.model) {
      Object.keys(model).forEach((key) => {
        delete model[key]
      })
      Object.assign(model, useOptions.model)
    }
    // 重置步骤
    step.value = 1
  }

  /**
   * 规范化表单项配置
   * 1. 补全组件默认结构
   * 2. 应用默认值
   * 3. 执行 bind hook
   * 4. 注入必填校验规则
   */
  function normalizeItems() {
    options.items.forEach((item) => {
      helpers.ensureComponentDefaults(item)

      const propName = helpers.propKey(item.prop)
      // 如果配置了默认值且 model 中无值，则应用默认值
      if (isDef(item.value) && !isDef(helpers.getModelValue(item.prop))) {
        helpers.setModelValue(item.prop, clone(item.value))
      }

      // 执行 bind hook
      if (item.hook && item.prop) {
        formHook.bind({
          hook: item.hook,
          model,
          field: propName,
          value: helpers.getModelValue(item.prop),
        })
      }

      // 处理 required 配置，生成内部校验规则
      if (helpers.required(item)) {
        const rule: InternalRule = {
          required: true,
          _inner: true, // 标记为内部规则
          trigger: ["change", "blur"],
          validator: (_rule, value, callback) => {
            const isEmpty = value === undefined || value === null || value === ""
            if (isEmpty)
              callback(new Error(`${item.label ?? propName}为必填项`))
            else
              callback()
          },
        }
        if (isNoEmpty(item.rules)) {
          const ruleList: InternalRule[] = (Array.isArray(item.rules) ? item.rules : [item.rules]).filter(Boolean) as InternalRule[]
          const index = ruleList.findIndex(r => r._inner === true)
          if (index > -1)
            ruleList[index] = rule
          else
            ruleList.unshift(rule)
          item.rules = ruleList
        }
        else {
          item.rules = [rule]
        }
      }
    })
  }

  /**
   * 初始化/更新表单
   * @param useOptions 初始化配置选项
   */
  function use(useOptions: FormUseOptions = {}) {
    mergeFormOptions(useOptions)
    normalizeItems()
    if (options.group?.type === "tabs") {
      activeGroupName.value = options.group.children?.[0]?.name
      helpers.markGroupLoaded(activeGroupName.value)
    }
    else {
      activeGroupName.value = undefined
    }
    if (options.group?.type === "steps") {
      step.value = 1
      helpers.markGroupLoaded(helpers.activeStepName.value)
    }
  }

  /**
   * Steps 模式：下一步
   */
  function next() {
    methods.validate((isValid) => {
      if (!isValid)
        return
      const values = clone(model)
      const proceed = () => {
        const total = options.group?.children?.length || 0
        if (options.group?.type === "steps" && total > 0) {
          if (step.value >= total) {
            methods.submit()
          }
          else {
            step.value += 1
          }
        }
        else {
          methods.submit()
        }
      }

      if (isFunction(options.onNext)) {
        options.onNext(values, { next: proceed })
      }
      else {
        proceed()
      }
    })
  }

  /**
   * Steps 模式：上一步
   */
  function prev() {
    if (step.value > 1) {
      step.value -= 1
    }
  }

  return {
    id,
    formRef,
    options,
    model,
    step,
    activeGroupName,
    resolvedActiveGroup,
    activeStepName: helpers.activeStepName,
    action,
    methods,
    use,
    next,
    prev,
    helpers,
  }
}

/**
 * 渲染与逻辑辅助工厂
 * @description 提供一套纯函数工具，用于处理属性解析、模型读写、动态渲染逻辑等
 * @param params 配置参数对象
 * @param params.options 表单配置选项
 * @param params.model 表单数据模型
 * @param params.resolvedActiveGroup 当前激活的分组名称 (Computed)
 * @param params.step 当前步骤 (Ref)
 * @param params.loadedGroups 已加载的分组集合 (Ref Set)
 * @param params.optionState 选项状态记录 (Ref Object)
 * @returns 辅助函数集合
 */
export function createHelpers({
  options,
  model,
  resolvedActiveGroup,
  step,
  loadedGroups,
  optionState,
}: {
  options: FormOptions
  model: FormRecord
  resolvedActiveGroup: ComputedRef<string | number | undefined>
  step: Ref<number>
  loadedGroups: Ref<Set<string | number>>
  optionState: Record<string, FormAsyncOptionsState>
}) {
  // --- 路径与模型工具 ---

  /**
   * 将 prop 转换为路径数组
   * @param prop 字符串或数组形式的 prop
   * @returns 路径数组
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
   * 获取 prop 的字符串键
   * @param prop 表单项 prop
   * @param fallback 回退值
   * @returns 字符串形式的键
   */
  function propKey(prop?: FormItemProp, fallback?: string | number) {
    const path = toPathArray(prop)
    if (path?.length)
      return path.join(".")
    return String(fallback ?? "")
  }

  /**
   * 读取模型值 (支持嵌套)
   * @param prop 表单项 prop
   * @returns 对应的值
   */
  function getModelValue(prop?: FormItemProp) {
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
   * 设置模型值 (支持嵌套，自动创建路径)
   * @param prop 表单项 prop
   * @param value 要设置的值
   */
  function setModelValue(prop: FormItemProp, value: any) {
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

  // --- 选项数据加载与缓存 ---

  const isPromiseLike = <T>(value: unknown): value is Promise<T> => Boolean(value && typeof (value as any).then === "function")

  let optionRequestId = 0

  /**
   * 确保选项状态存在
   * @param key 字段键
   * @returns 状态对象
   */
  function ensureOptionState(key: string) {
    if (!optionState[key])
      optionState[key] = { loading: false }
    return optionState[key]!
  }

  /**
   * 根据同步/异步来源更新选项状态
   * @param propKey 字段键
   * @param value 选项数据或 Promise
   */
  function updateOptionState(propKey: string, value: MaybePromise<any[]>) {
    const state = ensureOptionState(propKey)
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
   * 获取字段的选项状态（触发异步加载）
   * @param item 表单项
   * @returns 选项数据与加载状态
   */
  function optionsOf(item: FormItem) {
    const key = propKey(item.prop)
    const source = componentOptions(item.component)
    if (source !== undefined) {
      updateOptionState(key, source)
    }
    else {
      ensureOptionState(key)
    }
    const state = optionState[key]
    return {
      options: state?.value,
      loading: state?.loading ?? false,
      error: state?.error,
    }
  }

  // --- 组件解析工具 ---

  /**
   * 判断是否为组件配置对象
   * @param component 组件插槽内容或配置
   * @returns 是否为 FormComponent 配置对象
   */
  function isComponentConfig(component?: FormComponentSlot): component is FormComponent {
    if (!component || typeof component !== "object")
      return false
    // 只要包含任意组件配置属性，即视为组件配置
    return "is" in component || "slot" in component || "props" in component || "options" in component || "on" in component || "style" in component
  }

  /**
   * 包装 VNode 为组件 (防止被 Vue 视为响应式数据)
   * @param node VNode
   * @returns 包装后的组件
   */
  function wrapVNode(node: VNode) {
    return markRaw(defineComponent({ name: "fd-form-vnode-wrapper", setup: () => () => node }))
  }

  /**
   * 解析 component.is
   * @param com 组件配置或插槽内容
   * @returns 解析出的组件类型或组件对象
   */
  function is(com?: FormComponentSlot) {
    if (!com)
      return undefined

    const resolved = isComponentConfig(com) ? resolveProp<string | VueComponent | (() => any)>(com, "is") : com
    if (!resolved)
      return undefined

    if (isVNode(resolved))
      return wrapVNode(resolved)

    if (typeof resolved === "function" || (typeof resolved === "object" && resolved))
      return markRaw(resolved as VueComponent)

    return resolved as string | VueComponent
  }

  // --- 动态属性解析工具 ---

  /**
   * 解析动态属性 (支持函数求值)
   * @param target 目标对象
   * @param prop 属性名
   * @returns 解析后的值
   */
  function resolveProp<TValue>(target: unknown, prop: string): TValue | undefined {
    if (!target || typeof target !== "object")
      return undefined
    const value = (target as Record<string, any>)[prop]
    if (isFunction(value)) {
      return value(model) as TValue | undefined
    }
    return value as TValue | undefined
  }

  /**
   * 获取组件事件监听器配置
   * @param com 组件配置
   * @returns 监听器对象
   */
  const onListeners = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<Record<string, (...args: any[]) => void>>(com, "on") ?? {} : {})

  /**
   * 获取组件插槽名称 (如果作为插槽使用)
   * @param com 组件配置
   * @returns 插槽名称
   */
  const slotNameOf = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<string | undefined>(com, "slot") : undefined)

  /**
   * 获取组件基础 props 配置
   * @param com 组件配置
   * @returns props 对象
   */
  const componentBaseProps = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<Record<string, any>>(com, "props") ?? {} : {})

  /**
   * 获取组件样式配置
   * @param com 组件配置
   * @returns 样式对象
   */
  const styleOf = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<CSSProperties | undefined>(com, "style") : undefined)

  /**
   * 获取组件选项数据 (options)
   * @param com 组件配置
   * @returns 选项数组
   */
  const componentOptions = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<MaybePromise<any[]>>(com, "options") : undefined)

  // --- 插槽工具 ---

  function hasSlotsProp(target: unknown): target is Record<string, any> {
    return Boolean(target && typeof target === "object" && "slots" in target)
  }

  /**
   * 获取组件的子插槽配置
   * @param target 表单项或组件配置
   * @returns 插槽配置对象
   */
  function slotsOf(target?: FormItem | FormComponentSlot) {
    if (!target)
      return {}
    if (!hasSlotsProp(target))
      return {}
    return resolveProp<Record<string, FormComponentSlot>>(target, "slots") ?? {}
  }

  // --- 显示与分组逻辑 ---

  /**
   * 判断表单项是否显示
   * @param item 表单项配置
   * @returns 是否显示
   */
  function show(item: FormItem) {
    // 1. 检查 hidden 属性
    if (resolveProp<boolean>(item, "hidden"))
      return false
    // 2. 检查 Tabs 分组归属
    if (options.group?.type === "tabs" && options.group.children?.length) {
      const currentName = resolvedActiveGroup.value
      const itemGroupName = item.group ?? options.group.children[0]?.name
      if (itemGroupName && currentName && itemGroupName !== currentName)
        return false
    }
    return true
  }

  /**
   * 获取指定分组的所有项
   * @param groupName 分组名称
   * @returns 表单项列表
   */
  function itemsOfGroup(groupName: string | number) {
    if (options.group?.type !== "tabs" || !options.group.children?.length)
      return []
    const fallback = options.group.children[0]?.name
    return options.items.filter(item => (item.group ?? fallback) === groupName)
  }

  /**
   * 标记分组已加载（Tabs/Steps 懒渲染可用）
   * @param name 分组名称或 ID
   */
  function markGroupLoaded(name?: string | number) {
    if (name === undefined)
      return
    loadedGroups.value.add(name)
  }

  /**
   * 判断分组是否已加载
   * @param name 分组名称或 ID
   * @returns 是否已加载
   */
  function isGroupLoaded(name?: string | number) {
    if (name === undefined)
      return true
    return loadedGroups.value.has(name)
  }

  /**
   * Steps 当前分组名称 (Computed)
   */
  const activeStepName = computed<string | number | undefined>(() => {
    if (options.group?.type !== "steps" || !options.group.children?.length)
      return undefined
    const idx = Math.max(0, step.value - 1)
    return options.group.children[idx]?.name ?? idx + 1
  })

  /**
   * Steps 下获取当前或指定分组的表单项
   * @param groupName 分组名称，默认为当前步骤名
   * @returns 表单项列表
   */
  function itemsOfStep(groupName?: string | number) {
    if (options.group?.type !== "steps" || !options.group.children?.length)
      return options.items
    const target = groupName ?? activeStepName.value ?? options.group.children[0]?.name
    const fallback = options.group.children[0]?.name
    return options.items.filter(item => (item.group ?? fallback) === target)
  }

  /**
   * Tabs 内部渲染时的显隐判断 (双重检查)
   * @param item 表单项
   * @param groupName 当前渲染的分组
   * @returns 是否显示
   */
  function showInGroup(item: FormItem, groupName: string | number) {
    if (resolveProp<boolean>(item, "hidden"))
      return false
    const itemGroup = item.group ?? options.group?.children?.[0]?.name
    if (itemGroup && itemGroup !== groupName)
      return false
    return true
  }

  // --- 表单项属性解析 ---

  const extra = (item: FormItem) => (resolveProp<boolean>(item, "hidden") ? "" : resolveProp<string>(item, "extra"))

  /**
   * 解析 required 状态
   * @param item 表单项
   * @returns 是否必填
   */
  function required(item: FormItem) {
    if (resolveProp<boolean>(item, "hidden"))
      return false
    const flag = resolveProp<boolean | undefined>(item, "required")
    return typeof flag === "boolean" ? flag : undefined
  }

  const disabled = (item: FormItem) => Boolean(resolveProp(item, "disabled"))

  /**
   * 解析校验规则
   * @description 自动处理显隐状态对规则的影响
   * @param item 表单项
   * @returns 校验规则数组
   */
  function rules(item: FormItem) {
    if (resolveProp<boolean>(item, "hidden"))
      return []
    const fieldRules = resolveProp<FormItemRuleWithMeta | FormItemRuleWithMeta[]>(item, "rules")
    if (!fieldRules)
      return []
    // 如果非必填，移除内部生成的 required 规则
    if (!required(item)) {
      if (Array.isArray(fieldRules))
        return fieldRules.filter(rule => !rule._inner)
      return fieldRules._inner ? [] : fieldRules
    }
    return fieldRules
  }

  // --- 属性增强与自动补全 ---

  /**
   * 计算最终传递给控件的 props (自动注入默认值)
   * @returns (item: FormItem) => Record<string, any>
   */
  const formatProps = computed(() => (item: FormItem) => {
    const componentName = is(item.component)
    const baseProps = {
      ...componentBaseProps(item.component),
    }
    const optionInfo = optionsOf(item)
    const optionValues = optionInfo.options ?? componentOptions(item.component)

    if (disabled(item)) {
      baseProps.disabled = true
    }

    if (optionInfo.loading) {
      baseProps.loading = true
    }

    // 根据组件类型自动注入 placeholder 或 options
    switch (componentName) {
      case "el-input":
      case "el-input-number":
      case "el-input-password":
        baseProps.placeholder = baseProps.placeholder ?? `请输入${item.label ?? ""}`
        break
      case "el-select":
      case "el-cascader":
        baseProps.placeholder = baseProps.placeholder ?? `请选择${item.label ?? ""}`
        if (optionValues)
          baseProps.options = optionValues
        break
      case "el-tree-select": {
        baseProps.placeholder = baseProps.placeholder ?? `请选择${item.label ?? ""}`
        if (optionValues)
          baseProps.data = optionValues
        break
      }
      case "el-radio-group":
      case "el-checkbox-group": {
        if (optionValues)
          baseProps.options = optionValues
        break
      }
      case "el-date-picker":
        baseProps.placeholder = baseProps.placeholder ?? "请选择日期"
        break
      case "el-time-picker":
        baseProps.placeholder = baseProps.placeholder ?? `请选择${item.label ?? ""}`
        break
      default: {
        // 其他组件尝试注入 options
        if (optionValues)
          baseProps.options = optionValues
        break
      }
    }

    return baseProps
  })

  /**
   * 提取组件基础 props
   * @param component 组件配置
   * @returns props 对象
   */
  function componentProps(component?: FormComponentSlot) {
    return {
      ...componentBaseProps(component),
    }
  }

  /**
   * 解析栅格跨度
   * @param item 表单项
   * @returns span 数值
   */
  function resolveSpan(item: FormItem) {
    return item.span ?? defaultItemSpan
  }

  /**
   * 解析栅格偏移
   * @param item 表单项
   * @returns offset 数值
   */
  function resolveOffset(item: FormItem) {
    return item.offset ?? 0
  }

  /**
   * 处理组件 Ref 回调
   * @param el 组件实例
   * @param com 组件配置
   */
  function useRef(el: unknown, com?: FormComponentSlot) {
    if (!isComponentConfig(com))
      return
    const refHandler = com.ref
    if (isFunction(refHandler)) {
      refHandler(el)
    }
  }

  /**
   * 生成组件 ref 绑定函数
   * @param com 组件配置
   * @returns ref 回调函数
   */
  function bindComponentRef(com?: FormComponentSlot) {
    return (el: unknown) => {
      useRef(el, com)
    }
  }

  /**
   * 确保组件配置有默认结构
   * @param item 表单项
   */
  function ensureComponentDefaults(item: FormItem) {
    if (!item.component) {
      item.component = {}
    }
    item.component.props = item.component.props ?? {}
    item.component.on = item.component.on ?? {}
    item.component.style = item.component.style ?? {}
  }

  /**
   * 校验表单项配置是否合法
   * @param value 配置对象
   * @returns 是否合法
   */
  function isFormItemConfig(value: DeepPartial<FormItem> | FormItem | undefined): value is FormItem {
    return Boolean(value && value.prop && value.component)
  }

  /**
   * 事件名称规范化
   * @description change -> onChange
   * @param listeners 事件监听器对象
   * @returns 规范化后的监听器
   */
  function normalizeListeners(listeners?: Record<string, (...args: any[]) => void>) {
    const normalized: Record<string, (...args: any[]) => void> = {}
    if (!listeners)
      return normalized
    Object.entries(listeners).forEach(([eventName, handler]) => {
      if (!handler)
        return
      // 已经是 onXxx 格式则不处理
      if (eventName.startsWith("on") && /[A-Z]/.test(eventName.charAt(2))) {
        normalized[eventName] = handler
      }
      else {
        const capitalized = eventName.charAt(0).toUpperCase() + eventName.slice(1)
        normalized[`on${capitalized}`] = handler
      }
    })
    return normalized
  }

  return {
    toPathArray,
    propKey,
    getModelValue,
    setModelValue,
    isComponentConfig,
    is,
    onListeners,
    slotNameOf,
    componentBaseProps,
    styleOf,
    componentOptions,
    slotsOf,
    show,
    itemsOfGroup,
    itemsOfStep,
    activeStepName,
    markGroupLoaded,
    isGroupLoaded,
    showInGroup,
    extra,
    required,
    disabled,
    rules,
    formatProps,
    componentProps,
    resolveSpan,
    resolveOffset,
    bindComponentRef,
    resolveProp,
    ensureComponentDefaults,
    isFormItemConfig,
    normalizeListeners,
  }
}
