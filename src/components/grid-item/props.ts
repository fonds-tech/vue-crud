import type { PropType } from "vue"
import type { ResponsiveValue } from "../grid/interface"

/**
 * fd-grid-item Props 定义
 */
export const fdGridItemProps = {
  /**
   * 跨度列数，支持响应式对象
   * @description 可以是数字（固定列数）或对象（响应式配置）
   * @example { xs: 1, sm: 2, md: 3, lg: 4 }
   */
  span: {
    type: [Number, Object] as PropType<number | ResponsiveValue>,
    default: 1,
  },
  /**
   * 偏移列数，支持响应式对象
   * @description 在左侧添加指定列数的间隔
   * @example { xs: 0, sm: 1, md: 2 }
   */
  offset: {
    type: [Number, Object] as PropType<number | ResponsiveValue>,
    default: 0,
  },
  /**
   * 是否为后缀项（占位用）
   * @description 后缀项用于在最后一行填充空白位置
   */
  suffix: {
    type: Boolean,
    default: false,
  },
}
