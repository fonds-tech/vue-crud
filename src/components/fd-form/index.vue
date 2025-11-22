<template>
  <el-form
    ref="formRef"
    :key="options.key"
    class="fd-form"
    :model="model"
    v-bind="options.form"
  >
    <el-space direction="vertical" fill :size="24">
      <el-steps
        v-if="options.group?.type === 'steps' && options.group.children?.length"
        :active="step"
        v-bind="props(options.group.component)"
        :style="style(options.group.component)"
        v-on="on(options.group.component)"
      >
        <el-step
          v-for="(child, index) in options.group.children"
          :key="child.name ?? index"
          :title="child.title"
          v-bind="props(child.component)"
        >
          <template v-for="(com, slotName) in slots(child.component)" :key="slotName" #[slotName]="scope">
            <slot
              v-if="slot(com)"
              :name="slot(com)"
              :step="scope.$index"
              :status="scope.lineStatus"
              :model="model"
            />
            <component
              :is="is(com)"
              v-else-if="is(com)"
              v-bind="componentProps(com)"
              :ref="bindComponentRef(com)"
              :style="style(com)"
              v-on="on(com)"
            />
          </template>
        </el-step>
      </el-steps>

      <el-tabs
        v-else-if="options.group?.type === 'tabs' && options.group.children?.length"
        v-bind="props(options.group.component)"
        :style="style(options.group.component)"
        v-on="on(options.group.component)"
      >
        <template v-for="slotName in Object.keys(slots(options.group.component) ?? {})" :key="slotName" #[slotName]>
          <slot :name="slotName" :model="model" />
        </template>
        <el-tab-pane
          v-for="(child, index) in options.group.children"
          :key="child.name ?? index"
          :label="child.title"
          v-bind="props(child.component)"
        >
          <template v-for="(com, slotName) in slots(child.component)" :key="slotName" #[slotName]="scope">
            <slot
              v-if="slot(com)"
              :name="slot(com)"
              :model="model"
              :scope="scope"
            />
            <component
              :is="is(com)"
              v-else-if="is(com)"
              v-bind="componentProps(com)"
              :ref="bindComponentRef(com)"
              :style="style(com)"
              v-on="on(com)"
            />
          </template>
        </el-tab-pane>
      </el-tabs>

      <el-row v-bind="options.layout.row">
        <template v-for="(item, _index) in options.items" :key="`${item.field ?? _index}`">
          <el-col
            v-show="show(item)"
            v-bind="options.layout.column"
            :span="item.span ?? options.layout.column.span"
            :offset="item.offset"
          >
            <el-form-item
              v-bind="item"
              :prop="String(item.field)"
              :rules="rules(item)"
              :required="required(item)"
            >
              <template v-if="extra(item)" #extra>
                {{ extra(item) }}
              </template>

              <template v-for="(com, name) in slots(item)" :key="name" #[name]>
                <slot v-if="slot(com)" :name="slot(com)" :model="model" />
                <component
                  :is="is(com)"
                  v-else-if="is(com)"
                  v-bind="componentProps(com)"
                  :ref="bindComponentRef(com)"
                  :style="style(com)"
                  v-on="on(com)"
                >
                  <template v-for="(value, childSlot) in slots(com)" :key="childSlot" #[childSlot]>
                    <component :is="value" />
                  </template>
                </component>
              </template>

              <slot
                v-if="slot(item.component)"
                :name="slot(item.component)"
                :model="model"
                :item="item"
              />
              <component
                :is="is(item.component)"
                v-else-if="is(item.component)"
                v-bind="formatProps(item)"
                :ref="bindComponentRef(item.component)"
                v-model="model[item.field as string]"
                :style="style(item.component)"
                v-on="on(item.component)"
              >
                <template v-for="(value, childSlot) in slots(item.component)" :key="childSlot" #[childSlot]>
                  <component :is="value" />
                </template>
              </component>
            </el-form-item>
          </el-col>
        </template>
      </el-row>
    </el-space>
  </el-form>
</template>

<script setup lang="ts">
import type { FormInstance } from "element-plus"
import type { CSSProperties, Component as VueComponent } from "vue"
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
import formHook from "../../utils/formHook"
import { useAction } from "./helper/action"
import { useMethods } from "./helper/methods"
import { merge, cloneDeep } from "lodash-es"
import { ref, useId, computed, reactive } from "vue"
import { isDef, isEmpty, isNoEmpty, isFunction } from "@fonds/utils"

defineOptions({
  name: "fd-form",
  inheritAttrs: false,
})

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
  },
  layout: {
    row: { gutter: 16, collapsed: false, collapsedRows: 3 },
    column: { span: 8 },
  },
})

const step = ref(1)
const model = reactive(options.model) as FormRecord
const action = useAction({ options, model, form: formRef })
const methods = useMethods({ options, model, form: formRef })

function isComponentConfig(component?: FormComponentSlot): component is FormComponent {
  return Boolean(component && typeof component === "object" && "is" in component)
}

function is(com?: FormComponentSlot) {
  if (!com)
    return undefined
  if (isComponentConfig(com))
    return resolveProp<string | VueComponent>(com, "is")
  if (typeof com === "string" || typeof com === "function")
    return com as string | VueComponent
  return com as VueComponent
}
const on = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<Record<string, (...args: any[]) => void>>(com, "on") ?? {} : {})
const slot = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<string | undefined>(com, "slot") : undefined)
const props = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<Record<string, any>>(com, "props") ?? {} : {})
const style = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<CSSProperties | undefined>(com, "style") : undefined)
function hasSlotsProp(target: unknown): target is Record<string, any> {
  return Boolean(target && typeof target === "object" && "slots" in target)
}

function slots(target?: FormItem | FormComponentSlot) {
  if (!target)
    return {}
  if (!hasSlotsProp(target))
    return {}
  return resolveProp<Record<string, FormComponentSlot>>(target, "slots") ?? {}
}
const componentOptions = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<any[]>(com, "options") : undefined)

const show = (item: FormItem) => !resolveProp<boolean>(item, "hidden")
const extra = (item: FormItem) => (resolveProp<boolean>(item, "hidden") ? "" : resolveProp<string>(item, "extra"))
const required = (item: FormItem) => (resolveProp<boolean>(item, "hidden") ? false : Boolean(resolveProp(item, "required")))
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
    ...props(item.component),
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
    ...props(component),
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
  return Boolean(value && value.field && value.component)
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

    const fieldKey = String(item.field)
    if (isDef(item.value) && !isDef(model[fieldKey])) {
      model[fieldKey] = cloneDeep(item.value)
    }

    if (item.hook && item.field) {
      formHook.bind({
        hook: item.hook,
        model,
        field: fieldKey,
        value: model[fieldKey],
      })
    }

    if (required(item)) {
      const rule: InternalRule = { required: true, message: `${item.label ?? fieldKey}为必填项`, _inner: true }
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
  if (useOptions.layout) {
    options.layout = {
      row: merge({}, options.layout.row, useOptions.layout.row),
      column: merge({}, options.layout.column, useOptions.layout.column),
    }
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
}

function next() {
  methods.validate((errors) => {
    if (isEmpty(errors)) {
      const values = cloneDeep(model)
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
    }
  })
}

function prev() {
  if (step.value > 1) {
    step.value -= 1
  }
}

defineExpose({
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
</script>

<style scoped>
.fd-form {
  width: 100%;
}
</style>
