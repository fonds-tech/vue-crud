<template>
  <el-form
    ref="formRef"
    :key="options.key"
    class="fd-form"
    :model="model"
    v-bind="{ ...options.form, ...$attrs }"
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
          <slot
            v-if="slot(child.component)"
            :name="slot(child.component)"
            :model="model"
            :step="index"
          />
          <component
            :is="is(child.component)"
            v-else-if="is(child.component)"
            v-bind="componentProps(child.component)"
            :ref="bindComponentRef(child.component)"
            :style="style(child.component)"
            v-on="on(child.component)"
          >
            <template v-for="(value, childSlot) in slots(child.component)" :key="childSlot" #[childSlot]>
              <component :is="value" />
            </template>
          </component>
        </el-step>
      </el-steps>

      <el-tabs
        v-else-if="options.group?.type === 'tabs' && options.group.children?.length"
        v-model="activeGroupName"
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
          :name="child.name ?? index"
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
          <slot
            v-if="slot(child.component)"
            :name="slot(child.component)"
            :model="model"
            :scope="{ name: child.name }"
          />
          <component
            :is="is(child.component)"
            v-else-if="is(child.component)"
            v-bind="componentProps(child.component)"
            :ref="bindComponentRef(child.component)"
            :style="style(child.component)"
            v-on="on(child.component)"
          >
            <template v-for="(value, childSlot) in slots(child.component)" :key="childSlot" #[childSlot]>
              <component :is="value" />
            </template>
          </component>

          <fd-grid v-bind="options.grid">
            <template v-for="(item, _index) in itemsOfGroup(child.name ?? index)" :key="propKey(item.prop, _index)">
              <fd-grid-item
                v-show="showInGroup(item, child.name ?? index)"
                :span="resolveSpan(item)"
                :offset="resolveOffset(item)"
              >
                <el-form-item
                  v-bind="item"
                  :prop="item.prop"
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
                    :model-value="getModelValue(item.prop)"
                    :style="style(item.component)"
                    @update:model-value="(val: any) => setModelValue(item.prop, val)"
                    v-on="on(item.component)"
                  >
                    <template v-for="(value, childSlot) in slots(item.component)" :key="childSlot" #[childSlot]>
                      <component :is="value" />
                    </template>
                  </component>
                </el-form-item>
              </fd-grid-item>
            </template>
          </fd-grid>
        </el-tab-pane>
      </el-tabs>

      <fd-grid v-if="options.group?.type !== 'tabs'" v-bind="options.grid">
        <template v-for="(item, _index) in options.items" :key="propKey(item.prop, _index)">
          <fd-grid-item
            v-show="show(item)"
            :span="resolveSpan(item)"
            :offset="resolveOffset(item)"
          >
            <el-form-item
              v-bind="item"
              :prop="item.prop"
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
                :model-value="getModelValue(item.prop)"
                :style="style(item.component)"
                @update:model-value="(val: any) => setModelValue(item.prop, val)"
                v-on="on(item.component)"
              >
                <template v-for="(value, childSlot) in slots(item.component)" :key="childSlot" #[childSlot]>
                  <component :is="value" />
                </template>
              </component>
            </el-form-item>
          </fd-grid-item>
        </template>
      </fd-grid>
    </el-space>
  </el-form>
</template>

<script setup lang="ts">
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
import { ref, useId, watch, isVNode, markRaw, computed, reactive, defineComponent } from "vue"

defineOptions({
  name: "fd-form",
  inheritAttrs: false,
})

// 生成唯一 ID，用于辅助标识
const id = typeof useId === "function" ? useId() : `fd-form-${Math.random().toString(36).slice(2)}`

// Element Plus Form 实例引用
const formRef = ref<FormInstance>()

// 表单核心配置状态，响应式对象
const options = reactive<FormOptions>({
  key: 0, // 强制刷新 key
  mode: "add", // 默认为新增模式
  model: {}, // 表单数据模型
  items: [], // 表单项配置列表
  group: {}, // 分组配置 (Tabs/Steps)
  form: {
    labelWidth: "auto", // 默认标签宽度自动
    scrollToError: true, // 校验失败自动滚动到错误项
    validateOnRuleChange: true, // 动态规则更新不触发即时校验，避免联动场景误报
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

// 步骤条当前步骤索引 (用于 group.type === 'steps')
const step = ref(1)
// Tabs 当前激活分组
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

// 引用 options.model 作为响应式数据源
const model = reactive(options.model) as FormRecord

// 初始化 Action Hook (提供 setField, bindFields 等操作方法)
const action = useAction({ options, model, form: formRef })

// 初始化 Methods Hook (提供 validate, submit 等表单原生方法)
const methods = useMethods({ options, model, form: formRef })

// Tabs 模式下按分组筛选表单项
function itemsOfGroup(groupName: string | number) {
  if (options.group?.type !== "tabs" || !options.group.children?.length)
    return []
  const fallback = options.group.children[0]?.name
  return options.items.filter(item => (item.group ?? fallback) === groupName)
}

// Tabs 模式下的显隐判断（不依赖全局 activeGroupName）
function showInGroup(item: FormItem, groupName: string | number) {
  if (resolveProp<boolean>(item, "hidden"))
    return false
  const itemGroup = item.group ?? options.group?.children?.[0]?.name
  if (itemGroup && itemGroup !== groupName)
    return false
  return true
}

/**
 * 类型守卫：判断配置项是否为 FormComponent 对象
 * 支持仅声明 slot/props/options/on/style 等场景（即使未显式提供 is）
 */
function isComponentConfig(component?: FormComponentSlot): component is FormComponent {
  if (!component || typeof component !== "object")
    return false
  return "is" in component || "slot" in component || "props" in component || "options" in component || "on" in component || "style" in component
}

function wrapVNode(node: VNode) {
  return markRaw(defineComponent({ name: "fd-form-vnode-wrapper", setup: () => () => node }))
}

/**
 * 解析组件类型 (is 属性)
 * 支持字符串组件名、Vue组件对象或动态函数返回
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

// 解析组件事件监听器 (on 属性)
const on = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<Record<string, (...args: any[]) => void>>(com, "on") ?? {} : {})

// 解析组件默认插槽名 (slot 属性)
const slot = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<string | undefined>(com, "slot") : undefined)

// 解析组件 Props (props 属性)
const props = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<Record<string, any>>(com, "props") ?? {} : {})

// 解析组件样式 (style 属性)
const style = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<CSSProperties | undefined>(com, "style") : undefined)

// prop 工具：格式化 / 读写模型，支持 a.b 或 ['a','b'] 路径
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

/**
 * 检查是否有 slots 属性
 */
function hasSlotsProp(target: unknown): target is Record<string, any> {
  return Boolean(target && typeof target === "object" && "slots" in target)
}

/**
 * 解析组件的具名插槽配置
 */
function slots(target?: FormItem | FormComponentSlot) {
  if (!target)
    return {}
  if (!hasSlotsProp(target))
    return {}
  return resolveProp<Record<string, FormComponentSlot>>(target, "slots") ?? {}
}

// 解析组件特有的 options 属性 (如 Select 的下拉选项)
const componentOptions = (com?: FormComponentSlot) => (isComponentConfig(com) ? resolveProp<any[]>(com, "options") : undefined)

// 计算表单项显隐状态
function show(item: FormItem) {
  // 1. 基础 hidden 属性检查
  if (resolveProp<boolean>(item, "hidden"))
    return false
  // 2. Tabs 分组时，仅展示当前面板下的字段
  if (options.group?.type === "tabs" && options.group.children?.length) {
    const currentName = resolvedActiveGroup.value
    const itemGroupName = item.group ?? options.group.children[0]?.name
    if (itemGroupName && currentName && itemGroupName !== currentName)
      return false
  }
  return true
}

// 计算额外提示信息 (extra 属性)
const extra = (item: FormItem) => (resolveProp<boolean>(item, "hidden") ? "" : resolveProp<string>(item, "extra"))

// 计算是否必填 (required 属性)，隐藏项自动设为非必填
function required(item: FormItem) {
  if (resolveProp<boolean>(item, "hidden"))
    return false
  const flag = resolveProp<boolean | undefined>(item, "required")
  return typeof flag === "boolean" ? flag : undefined
}

// 计算是否禁用 (disabled 属性)
const disabled = (item: FormItem) => Boolean(resolveProp(item, "disabled"))

/**
 * 计算最终校验规则
 * 1. 隐藏项无校验规则
 * 2. 非必填项自动过滤掉内部生成的 required 规则 (_inner=true)
 */
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

/**
 * 格式化并增强组件 Props
 * 为常见 Element Plus 组件自动注入 placeholder 和 options
 */
const formatProps = computed(() => (item: FormItem) => {
  const componentName = is(item.component)
  const baseProps = {
    ...props(item.component),
  }

  // 全局禁用覆盖
  if (disabled(item)) {
    baseProps.disabled = true
  }

  // 针对特定组件的默认值增强
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
      // 其他组件尝试注入 options
      const optionValues = componentOptions(item.component)
      if (optionValues)
        baseProps.options = optionValues
      break
    }
  }

  return baseProps
})

// 提取纯组件 Props (不包含特殊处理)
function componentProps(component?: FormComponentSlot) {
  return {
    ...props(component),
  }
}

// 处理组件 Ref 回调
function useRef(el: unknown, com?: FormComponentSlot) {
  if (!isComponentConfig(com))
    return
  const refHandler = com.ref
  if (isFunction(refHandler)) {
    refHandler(el)
  }
}

// 生成 Ref 绑定函数
function bindComponentRef(com?: FormComponentSlot) {
  return (el: unknown) => {
    useRef(el, com)
  }
}

/**
 * 核心属性解析函数
 * 处理动态属性：如果是函数则执行并传入 model，否则直接返回
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

// 类型守卫：判断是否为有效表单项配置
function isFormItemConfig(value: DeepPartial<FormItem> | FormItem | undefined): value is FormItem {
  return Boolean(value && value.prop && value.component)
}

// 确保组件配置对象存在默认结构
function ensureComponentDefaults(item: FormItem) {
  if (!item.component) {
    item.component = {}
  }
  item.component.props = item.component.props ?? {}
  item.component.on = item.component.on ?? {}
  item.component.style = item.component.style ?? {}
}

/**
 * 初始化表单项
 * 1. 设置默认值
 * 2. 执行 bind hook
 * 3. 生成 required 校验规则
 */
function normalizeItems() {
  options.items.forEach((item) => {
    ensureComponentDefaults(item)

    const propName = propKey(item.prop)
    // 应用默认值 (仅当 model 中无值时)
    if (isDef(item.value) && !isDef(getModelValue(item.prop))) {
      setModelValue(item.prop, clone(item.value))
    }

    // 执行 bind 阶段的数据转换 hook
    if (item.hook && item.prop) {
      formHook.bind({
        hook: item.hook,
        model,
        field: propName,
        value: getModelValue(item.prop),
      })
    }

    // 如果标记为 required，自动注入 Element Plus 校验规则（自定义非空校验，支持数字/布尔）
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
        // 替换或添加内部规则
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
 * 合并用户配置到内部状态
 * 使用 lodash merge 深度合并配置
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
  if (useOptions.items) {
    // 替换整个 items 数组
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
    // 重置并覆盖 model
    Object.keys(model).forEach((key) => {
      delete model[key]
    })
    Object.assign(model, useOptions.model)
  }
  step.value = 1
}

/**
 * 初始化表单 (核心公开方法)
 * @param useOptions 用户配置
 */
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

/**
 * 下一步 (仅 Steps 模式有效)
 * 触发校验，通过后执行 onNext 或自动跳转
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
          // 最后一步，提交表单
          methods.submit()
        }
        else {
          step.value += 1
        }
      }
      else {
        // 非步骤条模式，直接提交
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
 * 上一步 (仅 Steps 模式有效)
 */
function prev() {
  if (step.value > 1) {
    step.value -= 1
  }
}

// 导出组件实例 API
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

<style lang="scss">
.fd-form {
  flex: 1;
  .el-space {
    width: 100%;
  }
}
</style>
