import type { ExtractPropTypes } from "vue"
import type { selectEmits, selectProps } from "./select"

/**
 * Select 选项类型
 */
export type SelectOption = Record<string, unknown>

/**
 * Select 组件 Props 类型
 */
export type SelectProps = ExtractPropTypes<typeof selectProps>

/**
 * Select 组件 Emits 类型
 */
export type SelectEmits = typeof selectEmits
