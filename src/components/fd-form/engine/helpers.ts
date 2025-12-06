import type { FormItemProp } from "element-plus"
import type { Ref, VNode, ComputedRef, CSSProperties, Component as VueComponent } from "vue"
import type { FormItem, FormRecord, DeepPartial, FormOptions, MaybePromise, FormComponentSlot, FilterRuntimeContext, FormItemRuleWithMeta, FormAsyncOptionsState } from "../types"
import { isFunction } from "@fonds/utils"
import { isVNode, markRaw, computed, defineComponent } from "vue"
import { applyFilters, filterStepItems, filterGroupItems } from "../filters"

const defaultItemSpan = 1

export type FormHelpers = ReturnType<typeof createHelpers>

/**
 * 创建表单辅助函数集合，负责模型读写、组件解析、分组/步骤控制与属性计算等。
 * @param options 表单配置
 * @param model 表单数据模型
 * @param resolvedActiveGroup 当前激活分组
 * @param step 步骤 Ref
 * @param loadedGroups 已加载分组集合
 * @param optionState 选项加载状态记录
 * @returns 辅助方法集合
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
    let cursor: unknown = model
    for (const segment of path) {
      if (cursor == null || typeof cursor !== "object")
        return undefined
      cursor = (cursor as Record<string, unknown>)[segment]
    }
    return cursor
  }

  function setModelValue(prop: FormItemProp, value: unknown) {
    const path = toPathArray(prop)
    if (!path?.length)
      return
    let cursor: Record<string, unknown> = model
    for (let i = 0; i < path.length; i++) {
      const key = path[i]!
      if (i === path.length - 1) {
        cursor[key] = value as never
        return
      }
      cursor[key] = cursor[key] ?? {}
      cursor = cursor[key] as Record<string, unknown>
    }
  }

  const isPromiseLike = <T>(value: unknown): value is Promise<T> => Boolean(value && typeof (value as { then?: unknown }).then === "function")

  let optionRequestId = 0

  function ensureOptionState(key: string) {
    if (!optionState[key])
      optionState[key] = { loading: false }
    return optionState[key]!
  }

  function updateOptionState(propKey: string, value: MaybePromise<any[] | undefined>) {
    const state = ensureOptionState(propKey)
    if (isPromiseLike(value)) {
      const requestId = ++optionRequestId
      state.loading = true
      state.error = undefined
      state.requestId = requestId
      value
        .then((data: any[] | undefined) => {
          if (state.requestId === requestId) {
            state.value = data
            state.loading = false
          }
        })
        .catch((error: unknown) => {
          if (state.requestId === requestId) {
            state.error = error
            state.loading = false
          }
        })
      return state
    }
    state.value = value as any[] | undefined
    state.loading = false
    state.error = undefined
    return state
  }

  function isComponentConfig(component?: FormComponentSlot): component is FormComponentSlot & Record<string, unknown> {
    if (!component || typeof component !== "object")
      return false
    return "is" in component || "slot" in component || "props" in component || "options" in component || "on" in component || "style" in component
  }

  function wrapVNode(node: VNode) {
    return markRaw(defineComponent({ name: "fd-form-vnode-wrapper", setup: () => () => node }))
  }

  function resolveProp<TValue>(target: unknown, prop: string): TValue | undefined {
    if (!target || typeof target !== "object")
      return undefined
    const value = (target as Record<string, unknown>)[prop]
    if (isFunction(value)) {
      return value(model) as TValue | undefined
    }
    return value as TValue | undefined
  }

  function is(com?: FormComponentSlot) {
    if (!com)
      return undefined

    const resolved = isComponentConfig(com) ? resolveProp<string | VueComponent | (() => unknown)>(com, "is") : com
    if (!resolved)
      return undefined

    if (isVNode(resolved))
      return wrapVNode(resolved)

    if (typeof resolved === "function" || (typeof resolved === "object" && resolved))
      return markRaw(resolved as VueComponent)

    return resolved as string | VueComponent
  }

  const onListeners = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<Record<string, (...args: unknown[]) => void>>(com, "on") ?? {} : {})

  const slotNameOf = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<string | undefined>(com, "slot") : undefined)

  const componentBaseProps = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<Record<string, unknown>>(com, "props") ?? {} : {})

  const styleOf = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<CSSProperties | undefined>(com, "style") : undefined)

  const componentOptions = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<MaybePromise<any[]>>(com, "options") : undefined)

  function hasSlotsProp(target: unknown): target is Record<string, unknown> {
    return Boolean(target && typeof target === "object" && "slots" in target)
  }

  function slotsOf(target?: FormItem | FormComponentSlot) {
    if (!target)
      return {}
    if (!hasSlotsProp(target))
      return {}
    return resolveProp<Record<string, FormComponentSlot>>(target, "slots") ?? {}
  }

  function markGroupLoaded(name?: string | number) {
    if (name === undefined)
      return
    loadedGroups.value.add(name)
  }

  function isGroupLoaded(name?: string | number) {
    if (name === undefined)
      return true
    return loadedGroups.value.has(name)
  }

  const activeStepName = computed<string | number | undefined>(() => {
    if (options.group?.type !== "steps" || !options.group.children?.length)
      return undefined
    const idx = Math.max(0, step.value - 1)
    return options.group.children[idx]?.name ?? idx + 1
  })

  const filterContext = computed<FilterRuntimeContext>(() => ({
    options,
    resolvedActiveGroup: resolvedActiveGroup.value,
    activeStepName: activeStepName.value,
    resolveProp,
  }))

  function show(item: FormItem) {
    return applyFilters(item, filterContext.value) !== null
  }

  function itemsOfGroup(groupName: string | number) {
    if (options.group?.type !== "tabs" || !options.group.children?.length)
      return []
    return filterGroupItems(options.items, filterContext.value, groupName)
      .map(item => applyFilters(item, filterContext.value, { groupName }))
      .filter((item): item is FormItem => item !== null)
  }

  function itemsOfStep(groupName?: string | number) {
    if (options.group?.type !== "steps" || !options.group.children?.length)
      return options.items
    const filtered = filterStepItems(options.items, filterContext.value, groupName)
    const target = groupName ?? filterContext.value.activeStepName
    return filtered
      .map(item => applyFilters(item, filterContext.value, { groupName: target }))
      .filter((item): item is FormItem => item !== null)
  }

  function showInGroup(item: FormItem, groupName: string | number) {
    return applyFilters(item, filterContext.value, { groupName }) !== null
  }

  const extra = (item: FormItem) => (resolveProp<boolean>(item, "hidden") ? "" : resolveProp<string>(item, "extra"))

  function required(item: FormItem) {
    if (resolveProp<boolean>(item, "hidden"))
      return false
    const flag = resolveProp<boolean | undefined>(item, "required")
    return typeof flag === "boolean" ? flag : undefined
  }

  const disabled = (item: FormItem) => Boolean(resolveProp(item, "disabled"))

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
        if (optionValues)
          baseProps.options = optionValues
        break
      }
    }

    return baseProps
  })

  function componentProps(component?: FormComponentSlot) {
    return {
      ...componentBaseProps(component),
    }
  }

  function resolveSpan(item: FormItem) {
    return item.span ?? defaultItemSpan
  }

  function resolveOffset(item: FormItem) {
    return item.offset ?? 0
  }

  function useRef(el: unknown, com?: FormComponentSlot) {
    if (!isComponentConfig(com))
      return
    const refHandler = com.ref
    if (isFunction(refHandler)) {
      refHandler(el)
    }
  }

  function bindComponentRef(com?: FormComponentSlot) {
    return (el: unknown) => {
      useRef(el, com)
    }
  }

  function ensureComponentDefaults(item: FormItem) {
    if (!item.component) {
      item.component = {}
    }
    item.component.props = item.component.props ?? {}
    item.component.on = item.component.on ?? {}
    item.component.style = item.component.style ?? {}
  }

  function isFormItemConfig(value: DeepPartial<FormItem> | FormItem | undefined): value is FormItem {
    return Boolean(value && value.prop && value.component)
  }

  function normalizeListeners(listeners?: Record<string, (...args: unknown[]) => void>) {
    const normalized: Record<string, (...args: unknown[]) => void> = {}
    if (!listeners)
      return normalized
    Object.entries(listeners).forEach(([eventName, handler]) => {
      if (!handler)
        return
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
    optionsOf,
  }
}
