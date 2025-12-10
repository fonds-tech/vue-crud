import type { PropType } from "vue"
import type { OptionRecord, FdOptionProps } from "./interface"

/**
 * fd-option 组件 Props 定义
 */
export const fdOptionProps = {
  /** 选项数据对象 */
  option: Object as PropType<OptionRecord>,
  /** 标签字段名 */
  labelKey: { type: String, default: "label" },
  /** 值字段名 */
  valueKey: { type: String, default: "value" },
} as const

export type { FdOptionProps }
