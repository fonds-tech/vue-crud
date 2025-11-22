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
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<ElOptionProps & {
    option?: OptionRecord
    labelKey?: string
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

const optionProps = computed(() => {
  const merged: Record<string, unknown> = { ...(attrs as Record<string, unknown>) }
  Object.entries(props).forEach(([key, value]) => {
    if (key === "option" || key === "labelKey" || key === "valueKey")
      return
    merged[key] = value
  })

  const option = props.option
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
