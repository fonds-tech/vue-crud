import type { FormInstance, FormItemProp } from "element-plus"
import type { VNode, CSSProperties, Component as VueComponent } from "vue"
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
import {
  h,
  ref,
  useId,
  watch,
  isVNode,
  markRaw,
  computed,
  reactive,
  defineComponent,
  resolveDynamicComponent,
} from "vue"
import "./index.scss"

export default defineComponent({
  name: "fd-form",
  inheritAttrs: false,
  setup(_, { attrs, slots: contextSlots, expose }) {
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

    const defaultItemSpan = 1

    const step = ref(1)
    const activeGroupName = ref<string | number | undefined>(undefined)
    const resolvedActiveGroup = computed(() => {
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

    const model = reactive(options.model) as FormRecord

    const action = useAction({ options, model, form: formRef })
    const methods = useMethods({ options, model, form: formRef })

    function itemsOfGroup(groupName: string | number) {
      if (options.group?.type !== "tabs" || !options.group.children?.length)
        return []
      const fallback = options.group.children[0]?.name
      return options.items.filter(item => (item.group ?? fallback) === groupName)
    }

    function showInGroup(item: FormItem, groupName: string | number) {
      if (resolveProp<boolean>(item, "hidden"))
        return false
      const itemGroup = item.group ?? options.group?.children?.[0]?.name
      if (itemGroup && itemGroup !== groupName)
        return false
      return true
    }

    function isComponentConfig(component?: FormComponentSlot): component is FormComponent {
      if (!component || typeof component !== "object")
        return false
      return "is" in component || "slot" in component || "props" in component || "options" in component || "on" in component || "style" in component
    }

    function wrapVNode(node: VNode) {
      return markRaw(defineComponent({ name: "fd-form-vnode-wrapper", setup: () => () => node }))
    }

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

    const onListeners = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<Record<string, (...args: any[]) => void>>(com, "on") ?? {} : {})
    const slotNameOf = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<string | undefined>(com, "slot") : undefined)
    const componentBaseProps = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<Record<string, any>>(com, "props") ?? {} : {})
    const styleOf = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<CSSProperties | undefined>(com, "style") : undefined)

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

    function resolveSpan(item: FormItem) {
      return item.span ?? defaultItemSpan
    }

    function resolveOffset(item: FormItem) {
      return item.offset ?? 0
    }

    function hasSlotsProp(target: unknown): target is Record<string, any> {
      return Boolean(target && typeof target === "object" && "slots" in target)
    }

    function slotsOf(target?: FormItem | FormComponentSlot) {
      if (!target)
        return {}
      if (!hasSlotsProp(target))
        return {}
      return resolveProp<Record<string, FormComponentSlot>>(target, "slots") ?? {}
    }

    const componentOptions = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<any[]>(com, "options") : undefined)

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

    function componentProps(component?: FormComponentSlot) {
      return {
        ...componentBaseProps(component),
      }
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

    function resolveProp<TValue>(target: unknown, prop: string): TValue | undefined {
      if (!target || typeof target !== "object")
        return undefined
      const value = (target as Record<string, any>)[prop]
      if (isFunction(value)) {
        return value(model) as TValue | undefined
      }
      return value as TValue | undefined
    }

    function isFormItemConfig(value: DeepPartial<FormItem> | FormItem | undefined): value is FormItem {
      return Boolean(value && value.prop && value.component)
    }

    function ensureComponentDefaults(item: FormItem) {
      if (!item.component) {
        item.component = {}
      }
      item.component.props = item.component.props ?? {}
      item.component.on = item.component.on ?? {}
      item.component.style = item.component.style ?? {}
    }

    function normalizeItems() {
      options.items.forEach((item) => {
        ensureComponentDefaults(item)

        const propName = propKey(item.prop)
        if (isDef(item.value) && !isDef(getModelValue(item.prop))) {
          setModelValue(item.prop, clone(item.value))
        }

        if (item.hook && item.prop) {
          formHook.bind({
            hook: item.hook,
            model,
            field: propName,
            value: getModelValue(item.prop),
          })
        }

        if (required(item)) {
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
        const nextItems = useOptions.items.filter(isFormItemConfig)
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

    function prev() {
      if (step.value > 1) {
        step.value -= 1
      }
    }

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

    function renderComponentSlotMap(slotMap: Record<string, FormComponentSlot>, slotProps: Record<string, any> = {}) {
      const entries = Object.entries(slotMap).map(([name, value]) => {
        return [
          name,
          () => renderSlotOrComponent(value, slotProps),
        ] as const
      })
      return Object.fromEntries(entries)
    }

    function isVueComponent(target: unknown): target is VueComponent {
      return typeof target === "function" || (typeof target === "object" && target !== null)
    }

    function resolveComponent(type: string | VueComponent) {
      if (typeof type === "string") {
        const dyn = resolveDynamicComponent(type)
        if (isVueComponent(dyn))
          return dyn
        return type
      }
      return type
    }

    function renderSlotOrComponent(com?: FormComponentSlot, slotProps: Record<string, any> = {}) {
      const name = slotNameOf(com)
      if (name && contextSlots[name]) {
        return contextSlots[name]!({ model, ...slotProps })
      }
      const componentType = is(com)
      if (!componentType)
        return null
      const resolved = resolveComponent(componentType)
      const listeners = normalizeListeners(onListeners(com))
      const childSlots = renderComponentSlotMap(slotsOf(com), slotProps)
      return h(resolved, {
        ...componentProps(com),
        ref: bindComponentRef(com),
        style: styleOf(com),
        ...listeners,
      }, childSlots)
    }

    function renderControl(item: FormItem) {
      const componentType = is(item.component)
      if (!componentType)
        return null
      const resolved = resolveComponent(componentType)
      const listeners = normalizeListeners(onListeners(item.component))
      const childSlots = renderComponentSlotMap(slotsOf(item.component), { item, model })

      return h(resolved, {
        ...formatProps.value(item),
        "ref": bindComponentRef(item.component),
        "modelValue": getModelValue(item.prop),
        "style": styleOf(item.component),
        "onUpdate:modelValue": (val: any) => setModelValue(item.prop, val),
        ...listeners,
      }, childSlots)
    }

    function renderItemSlots(item: FormItem) {
      const slotMap = slotsOf(item)
      const entries = Object.entries(slotMap).map(([name, com]) => (
        <span key={name}>
          {renderSlotOrComponent(com, { model, item })}
        </span>
      ))
      return entries
    }

    function renderFormItem(item: FormItem, index: number, groupName?: string | number) {
      const key = propKey(item.prop, index)
      const visible = groupName !== undefined ? showInGroup(item, groupName) : show(item)
      const extraContent = extra(item)
      const mainSlotName = slotNameOf(item.component)
      const mainContent = mainSlotName && contextSlots[mainSlotName]
        ? contextSlots[mainSlotName]!({ model, item })
        : renderControl(item)

      return (
        <fd-grid-item key={key} v-show={visible} span={resolveSpan(item)} offset={resolveOffset(item)}>
          <el-form-item
            {...item}
            prop={item.prop}
            rules={rules(item)}
            required={required(item)}
            v-slots={{
              extra: extraContent ? () => extraContent : undefined,
              default: () => (
                <>
                  {renderItemSlots(item)}
                  {mainContent}
                </>
              ),
            }}
          />
        </fd-grid-item>
      )
    }

    function renderGrid(items: FormItem[], groupName?: string | number) {
      return (
        <fd-grid {...options.grid}>
          {items.map((item, index) => renderFormItem(item, index, groupName))}
        </fd-grid>
      )
    }

    function renderSteps() {
      if (!(options.group?.type === "steps" && options.group.children?.length))
        return null
      const stepSlots = renderComponentSlotMap(slotsOf(options.group.component), {})

      return (
        <el-steps
          active={step.value}
          {...componentProps(options.group.component)}
          style={styleOf(options.group.component)}
          v-slots={stepSlots}
        >
          {options.group.children.map((child, index) => {
            const childSlots = renderComponentSlotMap(slotsOf(child.component), { step: index, model })
            return (
              <el-step
                key={child.name ?? index}
                title={child.title}
                {...componentProps(child.component)}
                v-slots={childSlots}
              >
                {renderSlotOrComponent(child.component, { step: index, model })}
              </el-step>
            )
          })}
        </el-steps>
      )
    }

    function renderTabs() {
      if (!(options.group?.type === "tabs" && options.group.children?.length))
        return null

      const tabSlots = renderComponentSlotMap(slotsOf(options.group.component), { model })

      return (
        <el-tabs
          v-model={activeGroupName.value}
          {...componentProps(options.group.component)}
          style={styleOf(options.group.component)}
          v-slots={tabSlots}
        >
          {options.group.children.map((child, index) => {
            const childSlots = renderComponentSlotMap(slotsOf(child.component), { model, name: child.name })
            return (
              <el-tab-pane
                key={child.name ?? index}
                label={child.title}
                name={child.name ?? index}
                {...componentProps(child.component)}
                v-slots={childSlots}
              >
                {renderSlotOrComponent(child.component, { model, scope: { name: child.name } })}
                {renderGrid(itemsOfGroup(child.name ?? index), child.name ?? index)}
              </el-tab-pane>
            )
          })}
        </el-tabs>
      )
    }

    expose({
      id,
      use,
      next,
      prev,
      mode: options.mode,
      model,
      items: options.items,
      form: formRef,
      ...action,
      ...methods,
    })

    return () => {
      const groupType = options.group?.type
      const showTabs = groupType === "tabs"
      const showSteps = groupType === "steps"

      return (
        <el-form
          ref={formRef}
          key={options.key}
          class="fd-form"
          model={model}
          {...options.form}
          {...attrs}
        >
          <el-space direction="vertical" fill size={24}>
            {showSteps && renderSteps()}
            {showTabs && renderTabs()}
            {!showTabs && renderGrid(options.items)}
          </el-space>
        </el-form>
      )
    }
  },
})
