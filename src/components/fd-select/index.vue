<template>
  <el-select
    v-model="modelValue"
    class="fd-select"
    v-bind="selectBindingProps"
    @focus="handleFocus"
    @blur="handleBlur"
    @change="handleChange"
    @clear="handleClear"
  >
    <template #default="scope">
      <slot v-bind="{ ...scope, options: availableOptions, refresh, loading: optionLoading }">
        <el-option
          v-for="(item, index) in availableOptions"
          :key="resolveOptionKey(item, index)"
          :label="resolveOptionField(item, labelKey)"
          :value="resolveOptionField(item, valueKey)"
        />
      </slot>
    </template>
    <template v-for="name in namedSlotKeys" :key="name" #[name]="scope">
      <slot :name="name" v-bind="{ ...scope, options: availableOptions, refresh, loading: optionLoading }" />
    </template>
  </el-select>
</template>

<script setup lang="ts">
import type { SelectProps as ElSelectProps } from "element-plus/es/components/select/src/select"
import { clone } from "@fonds/utils"
import { merge, isEqual } from "lodash-es"
import { ref, watch, computed, useAttrs, useSlots } from "vue"

type OptionRecord = Record<string, any>
type ApiHandler = (params: Record<string, any>) => Promise<OptionRecord[]>

// 扩展出来的增强属性，承担远程获取与交互控制职责
interface CustomProps {
  /**
   * 远程数据获取函数
   * @description 返回 Promise<OptionRecord[]>
   */
  api?: ApiHandler
  /**
   * 额外的请求参数
   * @description 可以是静态对象或动态生成函数
   */
  params?: Record<string, any> | ((payload: Record<string, any>) => Record<string, any>)
  /**
   * 搜索字段名
   * @default 'keyword'
   */
  searchField?: string
  /**
   * 失去焦点时是否刷新
   * @default true
   */
  refreshOnBlur?: boolean
  /**
   * 获得焦点时是否刷新
   * @default true
   */
  refreshOnFocus?: boolean
  /**
   * 选项标签字段名
   * @default 'label'
   */
  labelKey?: string
  /**
   * 选项值字段名
   * @default 'value'
   */
  valueKey?: string
  /**
   * 是否立即获取数据
   * @default true
   */
  immediate?: boolean
  /**
   * 搜索防抖时间 (ms)
   * @default 300
   */
  debounce?: number
}

defineOptions({
  name: "fd-select",
  inheritAttrs: false, // 禁用属性自动继承，手动控制透传
})

const props = withDefaults(
  defineProps<Omit<ElSelectProps, "modelValue"> & CustomProps>(),
  {
    params: () => ({}),
    searchField: "keyword",
    refreshOnBlur: true,
    refreshOnFocus: true,
    labelKey: "label",
    valueKey: "value",
    immediate: true,
    debounce: 300,
  },
)

const emit = defineEmits<{
  (e: "change", value: ElSelectProps["modelValue"], payload: OptionRecord | OptionRecord[] | undefined): void
  (e: "search", keyword: string): void
  (e: "clear"): void
}>()

// 双向绑定 modelValue
const modelValue = defineModel<ElSelectProps["modelValue"]>({
  default: undefined,
})

const attrs = useAttrs()
const slots = useSlots()
// 命名插槽列表，便于批量注入增强上下文
const namedSlotKeys = computed(() => Object.keys(slots).filter(name => name !== "default"))

// 远程数据、加载状态与搜索关键字
const remoteOptionList = ref<OptionRecord[]>([])
const optionLoading = ref(false)
const currentSearchTerm = ref("")

// 统一对外的可用选项：远程 > props.options > attrs.options
// 优先级逻辑：如果是远程搜索，优先使用远程返回的数据；否则回退到 props 或 attrs 传入的静态选项
const availableOptions = computed<OptionRecord[]>(() => {
  if (remoteOptionList.value.length > 0)
    return remoteOptionList.value
  const fallback = props.options
  if (Array.isArray(fallback))
    return fallback as OptionRecord[]
  const external = (attrs as Record<string, unknown>).options
  return Array.isArray(external) ? (external as OptionRecord[]) : []
})

const labelKey = computed(() => props.labelKey)
const valueKey = computed(() => props.valueKey)

// 监听 api 变化，重置数据并按需刷新
watch(
  () => props.api,
  () => {
    remoteOptionList.value = []
    if (props.immediate && typeof props.api === "function")
      refresh()
  },
  { immediate: true },
)

// 监听 params 变化，深度比较，发生变化时触发刷新
watch(
  () => props.params,
  (next, prev) => {
    if (!isEqual(next, prev))
      refresh()
  },
  { deep: true },
)

// 合并基础参数与额外条件，最终输入远程服务
function resolveParams(extra: Record<string, any> = {}) {
  const base = typeof props.params === "function" ? props.params(extra) : props.params ?? {}
  return merge({}, clone(base), extra)
}

// 远程刷新选项，同时处理加载状态与异常兜底
async function refresh(extra: Record<string, any> = {}) {
  if (typeof props.api !== "function") {
    remoteOptionList.value = []
    return
  }
  optionLoading.value = true
  try {
    const payload = resolveParams(extra)
    const result = await props.api(payload)
    remoteOptionList.value = Array.isArray(result) ? result : []
  }
  finally {
    optionLoading.value = false
  }
}

// 聚焦时刷新 (如果配置了 refreshOnFocus 且有搜索词)
function handleFocus() {
  if (currentSearchTerm.value && props.refreshOnFocus)
    refresh({ [props.searchField]: currentSearchTerm.value })
}

// 失焦时刷新 (如果配置了 refreshOnBlur 且有搜索词)
function handleBlur() {
  if (currentSearchTerm.value && props.refreshOnBlur)
    refresh({ [props.searchField]: currentSearchTerm.value })
}

// 处理值变更，查找并回传完整的 Option 对象
function handleChange(value: ElSelectProps["modelValue"]) {
  const key = valueKey.value
  if (Array.isArray(value)) {
    const matched = availableOptions.value.filter(item => value.includes(resolveOptionField(item, key)))
    emit("change", value, matched)
    return
  }
  const matched = availableOptions.value.find(item => resolveOptionField(item, key) === value)
  emit("change", value, matched)
}

// 清空搜索词并重置列表
function handleClear() {
  currentSearchTerm.value = ""
  refresh()
  emit("clear")
}

// 搜索请求的防抖计时器，使用 trailing 模式避免立刻触发
let searchTimer: ReturnType<typeof setTimeout> | undefined

// 处理搜索输入，触发防抖刷新（仅 trailing）
function handleFilterInput(value: string) {
  currentSearchTerm.value = value
  if (searchTimer)
    clearTimeout(searchTimer)
  if (value && typeof props.api === "function") {
    searchTimer = setTimeout(() => refresh({ [props.searchField]: value }), props.debounce)
  }
  if (value)
    emit("search", value)
}

// 解析选项特定字段值
function resolveOptionField(option: OptionRecord, key: string | undefined) {
  if (!option || !key)
    return undefined
  return option[key]
}

// 解析选项 Key (用于 v-for)
function resolveOptionKey(option: OptionRecord, index: number) {
  const value = resolveOptionField(option, valueKey.value)
  return value ?? index
}

// 过滤掉自定义属性，只保留透传给 el-select 的属性
const forwardedProps = computed(() => {
  const {
    api,
    params,
    searchField,
    refreshOnBlur,
    refreshOnFocus,
    labelKey,
    valueKey,
    immediate,
    ...rest
  } = props
  return rest
})

// 自动整理透传属性，必要时补全 filterable / loading 等行为
const selectBindingProps = computed(() => {
  const payload: Record<string, unknown> = { ...forwardedProps.value, ...(attrs as Record<string, unknown>) }
  // 如果配置了 API，自动开启远程搜索模式
  if (props.api) {
    if (payload.remote === true && payload.remoteMethod === undefined)
      payload.remoteMethod = handleFilterInput
    if (payload.remote !== true && payload.filterMethod === undefined)
      payload.filterMethod = handleFilterInput
    if (payload.filterable === undefined)
      payload.filterable = true
  }
  // 同步 loading 状态
  if (payload.loading === undefined)
    payload.loading = optionLoading.value
  return payload
})

defineExpose({ refresh, reload: refresh, options: availableOptions, loading: optionLoading })
</script>
