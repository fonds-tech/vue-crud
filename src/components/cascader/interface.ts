import type { ExtractPropTypes } from "vue"
import type { cascaderEmits, cascaderProps } from "./cascader"

/**
 * 级联选项类型
 */
export type CascaderOption = Record<string, unknown>

/**
 * Cascader 组件 Props 类型
 */
export type CascaderProps = ExtractPropTypes<typeof cascaderProps>

/**
 * Cascader 组件 Emits 类型
 */
export type CascaderEmits = typeof cascaderEmits
