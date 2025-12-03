import type { FormInstance, FormItemProp } from "element-plus"
import type { Ref, VNode, ComputedRef, CSSProperties, Component as VueComponent } from "vue"
import type {
  FormItem,
  FormRecord,
  DeepPartial,
  FormOptions,
  InternalRule,
  FormComponent,
  FormUseOptions,
  FormComponentSlot,
  FormItemRuleWithMeta,
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
  action: ReturnType<typeof useAction>
  methods: ReturnType<typeof useMethods>
  use: (opts?: FormUseOptions) => void
  next: () => void
  prev: () => void
  helpers: FormHelpers
}

export type FormHelpers = ReturnType<typeof createHelpers>

// 表单核心引擎：管理配置、模型、动作与辅助方法
export function useFormEngine(): FormEngine {
  const id = typeof useId === "function" ? useId() : `fd-form-${Math.random().toString(36).slice(2)}`
  const formRef = ref<FormInstance>()

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

  const model = reactive(options.model) as FormRecord

  const step = ref(1)
  const activeGroupName = ref<string | number | undefined>(undefined)
  const resolvedActiveGroup = computed<string | number | undefined>(() => {
    if (options.group?.type !== "tabs" || !options.group.children?.length) {
      return undefined
    }
    return activeGroupName.value ?? options.group.children[0]?.name
  })

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

  const helpers = createHelpers({ options, model, resolvedActiveGroup })
  const action = useAction({ options, model, form: formRef })
  const methods = useMethods({ options, model, form: formRef })

  // 合并用户入参到内部 options，并重置必要状态
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
    if (useOptions.model) {
      Object.keys(model).forEach((key) => {
        delete model[key]
      })
      Object.assign(model, useOptions.model)
    }
    step.value = 1
  }

  // 规范化表单项：应用默认值、执行 bind hook、注入 required 校验
  function normalizeItems() {
    options.items.forEach((item) => {
      helpers.ensureComponentDefaults(item)

      const propName = helpers.propKey(item.prop)
      if (isDef(item.value) && !isDef(helpers.getModelValue(item.prop))) {
        helpers.setModelValue(item.prop, clone(item.value))
      }

      if (item.hook && item.prop) {
        formHook.bind({
          hook: item.hook,
          model,
          field: propName,
          value: helpers.getModelValue(item.prop),
        })
      }

      if (helpers.required(item)) {
        const rule: InternalRule = {
          _inner: true,
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

  // 对外公开入口：合并配置并初始化表单
  function use(useOptions: FormUseOptions = {}) {
    mergeFormOptions(useOptions)
    normalizeItems()
    if (options.group?.type === "tabs") {
      activeGroupName.value = options.group.children?.[0]?.name
    }
    else {
      activeGroupName.value = undefined
    }
  }

  // 下一步（Steps 模式）：校验通过后调用 onNext 或提交
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

  // 上一步（Steps 模式）
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
    action,
    methods,
    use,
    next,
    prev,
    helpers,
  }
}

// 渲染与逻辑辅助：统一属性解析、模型读写、显隐校验、组件解析等
export function createHelpers({
  options,
  model,
  resolvedActiveGroup,
}: {
  options: FormOptions
  model: FormRecord
  resolvedActiveGroup: ComputedRef<string | number | undefined>
}) {
  function toPathArray(prop?: FormItemProp): string[] | undefined {
    if (prop === undefined || prop === null)
      return undefined
    if (Array.isArray(prop))
      return prop.map(String)
    const path = String(prop).split(".").filter(Boolean)
    return path.length ? path : undefined
  }

  function propKey(prop?: FormItemProp, fallback?: string | number) {
    const path = toPathArray(prop)
    if (path?.length)
      return path.join(".")
    return String(fallback ?? "")
  }

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

  // 判断组件配置是否具备组件属性
  function isComponentConfig(component?: FormComponentSlot): component is FormComponent {
    if (!component || typeof component !== "object")
      return false
    return "is" in component || "slot" in component || "props" in component || "options" in component || "on" in component || "style" in component
  }

  // 将 VNode 包装为可渲染组件，避免响应式污染
  function wrapVNode(node: VNode) {
    return markRaw(defineComponent({ name: "fd-form-vnode-wrapper", setup: () => () => node }))
  }

  // 解析组件 is：支持字符串、组件对象、VNode、函数
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

  // 解析组件属性相关工具
  const onListeners = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<Record<string, (...args: any[]) => void>>(com, "on") ?? {} : {})
  const slotNameOf = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<string | undefined>(com, "slot") : undefined)
  const componentBaseProps = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<Record<string, any>>(com, "props") ?? {} : {})
  const styleOf = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<CSSProperties | undefined>(com, "style") : undefined)
  const componentOptions = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<any[]>(com, "options") : undefined)

  // 判断对象是否包含 slots 配置
  function hasSlotsProp(target: unknown): target is Record<string, any> {
    return Boolean(target && typeof target === "object" && "slots" in target)
  }

  // 解析 slots 配置
  function slotsOf(target?: FormItem | FormComponentSlot) {
    if (!target)
      return {}
    if (!hasSlotsProp(target))
      return {}
    return resolveProp<Record<string, FormComponentSlot>>(target, "slots") ?? {}
  }

  // 显示逻辑：隐藏属性或 Tabs 非当前分组时不显示
  function show(item: FormItem) {
    if (resolveProp<boolean>(item, "hidden"))
      return false
    if (options.group?.type === "tabs" && options.group.children?.length) {
      const currentName = resolvedActiveGroup.value
      const itemGroupName = item.group ?? options.group.children[0]?.name
      if (itemGroupName && currentName && itemGroupName !== currentName)
        return false
    }
    return true
  }

  // Tabs 下获取指定分组的表单项
  function itemsOfGroup(groupName: string | number) {
    if (options.group?.type !== "tabs" || !options.group.children?.length)
      return []
    const fallback = options.group.children[0]?.name
    return options.items.filter(item => (item.group ?? fallback) === groupName)
  }

  // 针对 Tabs 内部使用的显隐判断
  function showInGroup(item: FormItem, groupName: string | number) {
    if (resolveProp<boolean>(item, "hidden"))
      return false
    const itemGroup = item.group ?? options.group?.children?.[0]?.name
    if (itemGroup && itemGroup !== groupName)
      return false
    return true
  }

  // 额外信息（隐藏时置空）
  const extra = (item: FormItem) => (resolveProp<boolean>(item, "hidden") ? "" : resolveProp<string>(item, "extra"))

  // 必填解析：隐藏时自动取消必填
  function required(item: FormItem) {
    if (resolveProp<boolean>(item, "hidden"))
      return false
    const flag = resolveProp<boolean | undefined>(item, "required")
    return typeof flag === "boolean" ? flag : undefined
  }

  // 禁用解析
  const disabled = (item: FormItem) => Boolean(resolveProp(item, "disabled"))

  // 规则解析：隐藏项无规则，非必填过滤内部 required 规则
  function rules(item: FormItem) {
    if (resolveProp<boolean>(item, "hidden"))
      return []
    const fieldRules = resolveProp<FormItemRuleWithMeta | FormItemRuleWithMeta[]>(item, "rules")
    if (!fieldRules)
      return []
    if (!required(item)) {
      if (Array.isArray(fieldRules))
        return fieldRules.filter(rule => !rule._inner)
      return fieldRules._inner ? [] : fieldRules
    }
    return fieldRules
  }

  // 组件 props 补全：自动注入 placeholder/options
  const formatProps = computed(() => (item: FormItem) => {
    const componentName = is(item.component)
    const baseProps = {
      ...componentBaseProps(item.component),
    }

    if (disabled(item)) {
      baseProps.disabled = true
    }

    switch (componentName) {
      case "el-input":
      case "el-input-number":
      case "el-input-password":
        baseProps.placeholder = baseProps.placeholder ?? `请输入${item.label ?? ""}`
        break
      case "el-select":
      case "el-cascader":
        baseProps.placeholder = baseProps.placeholder ?? `请选择${item.label ?? ""}`
        {
          const optionValues = componentOptions(item.component)
          if (optionValues)
            baseProps.options = optionValues
        }
        break
      case "el-tree-select": {
        baseProps.placeholder = baseProps.placeholder ?? `请选择${item.label ?? ""}`
        const optionValues = componentOptions(item.component)
        if (optionValues)
          baseProps.data = optionValues
        break
      }
      case "el-radio-group":
      case "el-checkbox-group": {
        const optionValues = componentOptions(item.component)
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
        const optionValues = componentOptions(item.component)
        if (optionValues)
          baseProps.options = optionValues
        break
      }
    }

    return baseProps
  })

  // 提取组件基础 props（不包含注入逻辑）
  function componentProps(component?: FormComponentSlot) {
    return {
      ...componentBaseProps(component),
    }
  }

  // 栅格列数
  function resolveSpan(item: FormItem) {
    return item.span ?? defaultItemSpan
  }

  // 栅格偏移
  function resolveOffset(item: FormItem) {
    return item.offset ?? 0
  }

  // 处理 ref 回调
  function useRef(el: unknown, com?: FormComponentSlot) {
    if (!isComponentConfig(com))
      return
    const refHandler = com.ref
    if (isFunction(refHandler)) {
      refHandler(el)
    }
  }

  // 生成 ref 绑定函数
  function bindComponentRef(com?: FormComponentSlot) {
    return (el: unknown) => {
      useRef(el, com)
    }
  }

  // 动态属性解析：函数则传入 model 执行
  function resolveProp<TValue>(target: unknown, prop: string): TValue | undefined {
    if (!target || typeof target !== "object")
      return undefined
    const value = (target as Record<string, any>)[prop]
    if (isFunction(value)) {
      return value(model) as TValue | undefined
    }
    return value as TValue | undefined
  }

  // 组件配置补默认结构
  function ensureComponentDefaults(item: FormItem) {
    if (!item.component) {
      item.component = {}
    }
    item.component.props = item.component.props ?? {}
    item.component.on = item.component.on ?? {}
    item.component.style = item.component.style ?? {}
  }

  // 校验表单项配置完整性
  function isFormItemConfig(value: DeepPartial<FormItem> | FormItem | undefined): value is FormItem {
    return Boolean(value && value.prop && value.component)
  }

  // 事件名归一化：change -> onChange
  function normalizeListeners(listeners?: Record<string, (...args: any[]) => void>) {
    const normalized: Record<string, (...args: any[]) => void> = {}
    if (!listeners)
      return normalized
    Object.entries(listeners).forEach(([eventName, handler]) => {
      if (!handler)
        return
      const capitalized = eventName.charAt(0).toUpperCase() + eventName.slice(1)
      normalized[`on${capitalized}`] = handler
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
