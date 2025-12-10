import type { ResponsiveValue } from "../grid/interface"

/**
 * fd-grid-item Props 类型
 * @description grid-item 组件的 Props 类型定义
 */
export interface FdGridItemProps {
  /** 跨度列数，支持响应式对象 */
  span?: number | ResponsiveValue
  /** 偏移列数，支持响应式对象 */
  offset?: number | ResponsiveValue
  /** 是否为后缀项（占位用） */
  suffix?: boolean
}
