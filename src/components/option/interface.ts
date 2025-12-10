import type { OptionProps as ElOptionProps } from "element-plus/es/components/select/src/type"

/**
 * 选项数据记录类型
 */
export type OptionRecord = Record<string, unknown>

/**
 * fd-option 组件 Props 类型
 */
export type FdOptionProps = Partial<ElOptionProps> & {
  /** 选项数据对象 */
  option?: OptionRecord
  /** 标签字段名 */
  labelKey?: string
  /** 值字段名 */
  valueKey?: string
}

/**
 * fd-option 组件暴露的方法
 */
export interface FdOptionExpose {
  /** 计算后的选项属性 */
  optionProps: Record<string, unknown>
}
