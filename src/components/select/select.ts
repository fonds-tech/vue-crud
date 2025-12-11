import type { PropType } from "vue"
import type { SelectOption } from "./interface"
import { selectEmits as elSelectEmits, selectProps as elSelectProps } from "element-plus"

export const selectProps = {
  ...elSelectProps,
  api: { type: Function as PropType<(params: Record<string, unknown>) => Promise<SelectOption[]>> },
  params: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  immediate: { type: Boolean, default: true },
  labelKey: { type: String, default: "label" },
  valueKey: { type: String, default: "value" },
  options: { ...elSelectProps.options, default: () => [] },
} as const

export const selectEmits = {
  ...elSelectEmits,
}
