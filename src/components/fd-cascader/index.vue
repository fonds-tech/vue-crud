<template>
  <el-cascader
    v-model="modelValue"
    class="fd-cascader"
    :options="availableOptions"
    :loading="loading"
    v-bind="attrs"
    @clear="onClear"
  >
    <template v-for="(_, name) in slots" :key="name" #[name]="scope">
      <slot :name="name" v-bind="scope" />
    </template>
  </el-cascader>
</template>

<script setup lang="ts">
import type { CascaderValue } from "element-plus"
import { merge, isEqual } from "lodash-es"
import { clone, isFunction } from "@fonds/utils"
import { ref, watch, computed, useAttrs, useSlots } from "vue"

type CascaderOption = Record<string, any>
type ApiHandler = (params: Record<string, any>) => Promise<CascaderOption[]>

defineOptions({
  name: "fd-cascader",
  inheritAttrs: false, // 禁用自动继承，手动控制属性透传
})

const props = withDefaults(
  defineProps<CustomProps & { options?: CascaderOption[] }>(),
  {
    params: () => ({}),
    immediate: true,
    options: () => [],
  },
)

const emit = defineEmits<{
  (e: "clear"): void
}>()

interface CustomProps {
  /**
   * 远程数据获取函数
   * @description 返回 Promise<CascaderOption[]>
   */
  api?: ApiHandler
  /**
   * 额外的请求参数
   * @description 可以是静态对象或动态生成函数
   */
  params?: Record<string, any> | ((payload: Record<string, any>) => Record<string, any>)
  /**
   * 是否立即获取数据
   * @default true
   */
  immediate?: boolean
}

// 双向绑定 modelValue
const modelValue = defineModel<CascaderValue>({
  default: undefined,
})

const attrs = useAttrs()
const slots = useSlots()

// 远程选项数据与加载状态
const remoteOptionList = ref<CascaderOption[]>([])
const loading = ref(false)

// 计算最终可用选项
// 优先级：远程获取的数据 > props.options 传入的静态数据
const availableOptions = computed<CascaderOption[]>(() => {
  if (remoteOptionList.value.length > 0)
    return remoteOptionList.value
  return props.options || []
})

// 监听 api 变化，重置并刷新
watch(
  () => props.api,
  () => {
    remoteOptionList.value = []
    if (props.immediate && isFunction(props.api))
      refresh()
  },
  { immediate: true },
)

// 监听 params 变化，触发自动刷新
watch(
  () => props.params,
  (next, prev) => {
    if (!isEqual(next, prev))
      refresh()
  },
  { deep: true },
)

// 合并请求参数
function resolveParams(extra: Record<string, any> = {}) {
  const base = isFunction(props.params) ? props.params(extra) : props.params ?? {}
  return merge({}, clone(base), extra)
}

// 处理清空事件
function onClear() {
  refresh()
  emit("clear")
}

// 刷新数据
async function refresh(extra: Record<string, any> = {}) {
  if (!isFunction(props.api)) {
    remoteOptionList.value = []
    return
  }
  loading.value = true
  try {
    const payload = resolveParams(extra)
    const result = await props.api(payload)
    remoteOptionList.value = Array.isArray(result) ? result : []
  }
  finally {
    loading.value = false
  }
}

defineExpose({ refresh, options: availableOptions, loading })
</script>
