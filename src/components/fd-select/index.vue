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
import { merge, isEqual, debounce, cloneDeep } from "lodash-es"
import { ref, watch, computed, useAttrs, useSlots } from "vue"

type OptionRecord = Record<string, any>
type ApiHandler = (params: Record<string, any>) => Promise<OptionRecord[]>

// 扩展出来的增强属性，承担远程获取与交互控制职责
interface CustomProps {
  api?: ApiHandler
  params?: Record<string, any> | ((payload: Record<string, any>) => Record<string, any>)
  searchField?: string
  refreshOnBlur?: boolean
  refreshOnFocus?: boolean
  labelKey?: string
  valueKey?: string
  immediate?: boolean
  debounce?: number
}

defineOptions({
  name: "fd-select",
  inheritAttrs: false,
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

watch(
  () => props.api,
  () => {
    remoteOptionList.value = []
    if (props.immediate && typeof props.api === "function")
      refresh()
  },
  { immediate: true },
)

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
  return merge({}, cloneDeep(base), extra)
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

function handleFocus() {
  if (currentSearchTerm.value && props.refreshOnFocus)
    refresh({ [props.searchField]: currentSearchTerm.value })
}

function handleBlur() {
  if (currentSearchTerm.value && props.refreshOnBlur)
    refresh({ [props.searchField]: currentSearchTerm.value })
}

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

function handleClear() {
  currentSearchTerm.value = ""
  refresh()
  emit("clear")
}

function handleFilterInput(value: string) {
  currentSearchTerm.value = value
  debouncedRefresh(value)
  if (value)
    emit("search", value)
}

const debouncedRefresh = debounce((value: string) => {
  if (value && typeof props.api === "function")
    refresh({ [props.searchField]: value })
}, props.debounce)

function resolveOptionField(option: OptionRecord, key: string | undefined) {
  if (!option || !key)
    return undefined
  return option[key]
}

function resolveOptionKey(option: OptionRecord, index: number) {
  const value = resolveOptionField(option, valueKey.value)
  return value ?? index
}

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
  if (props.api) {
    if (payload.remote === true && payload.remoteMethod === undefined)
      payload.remoteMethod = handleFilterInput
    if (payload.remote !== true && payload.filterMethod === undefined)
      payload.filterMethod = handleFilterInput
    if (payload.filterable === undefined)
      payload.filterable = true
  }
  if (payload.loading === undefined)
    payload.loading = optionLoading.value
  return payload
})

defineExpose({ refresh, reload: refresh, options: availableOptions, loading: optionLoading })
</script>
