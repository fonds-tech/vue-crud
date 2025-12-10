import type { PropType } from "vue"
import type { CascaderOption } from "./interface"
import { cascaderEmits as elCascaderEmits, cascaderProps as elCascaderProps } from "element-plus"

export const cascaderProps = {
  ...elCascaderProps,
  api: { type: Function as PropType<(params: Record<string, unknown>) => Promise<CascaderOption[]>> },
  params: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  immediate: { type: Boolean, default: true },
  options: { ...elCascaderProps.options, default: () => [] },
} as const

export const cascaderEmits = {
  ...elCascaderEmits,
}
