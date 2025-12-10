import type { PropType } from "vue"

/**
 * 导出按钮组件 Props 定义
 */
export const exportProps = {
  /**
   * 额外的导出参数
   * @description 会与搜索表单参数合并
   */
  params: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
}
