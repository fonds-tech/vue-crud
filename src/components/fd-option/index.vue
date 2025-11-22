<template>
  <el-option class="fd-option" v-bind="optionProps">
    <template v-for="(_, name) in slots" :key="name" #[name]="scope">
      <slot :name="name" v-bind="scope" />
    </template>
    <slot />
  </el-option>
</template>

<script setup lang="ts">
import type { OptionProps as ElOptionProps } from "element-plus/es/components/select/src/type"
import { computed, useAttrs, useSlots } from "vue"

defineOptions({
  name: "fd-option",
  inheritAttrs: false, // 禁用自动继承，手动处理属性合并
})

const props = withDefaults(
  defineProps<ElOptionProps & {
    /**
     * 选项对象
     * @description 如果提供，自动从对象中提取 label/value
     */
    option?: OptionRecord
    /**
     * 标签字段名
     * @default 'label'
     */
    labelKey?: string
    /**
     * 值字段名
     * @default 'value'
     */
    valueKey?: string
  }>(),
  {
    labelKey: "label",
    valueKey: "value",
  },
)

type OptionRecord = Record<string, unknown>

const slots = useSlots()
const attrs = useAttrs()

// 计算最终传递给 el-option 的属性
// 优先级：直接传入的属性 > option 对象中的属性
const optionProps = computed(() => {
  // 复制透传属性
  const merged: Record<string, unknown> = { ...(attrs as Record<string, unknown>) }

  // 复制非特殊 Props
  Object.entries(props).forEach(([key, value]) => {
    if (key === "option" || key === "labelKey" || key === "valueKey")
      return
    merged[key] = value
  })

  const option = props.option
  // 如果提供了 option 对象，尝试自动提取 label 和 value
  if (option) {
    if (merged.label === undefined && props.labelKey)
      merged.label = option[props.labelKey]
    if (merged.value === undefined && props.valueKey)
      merged.value = option[props.valueKey]
  }

  return merged
})
</script>

<style lang="scss" scoped></style>
