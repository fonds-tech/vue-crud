import type { PropType } from "vue"
import type { ImportProps } from "./interface"

/**
 * fd-import 组件 Props 定义
 */
export const fdImportProps = {
  /**
   * 允许的文件类型
   * @default '.xlsx,.xls,.csv'
   */
  accept: {
    type: String,
    default: ".xlsx,.xls,.csv",
  },
  /**
   * 额外的上传参数
   * @description 会附加到 FormData 中
   */
  params: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  /**
   * 模板下载地址
   * @description 如果提供，会显示下载模板按钮
   */
  templateUrl: {
    type: String,
    default: "",
  },
  /**
   * 最大文件大小 (MB)
   * @default 10
   */
  maxSize: {
    type: Number,
    default: 10,
  },
} as const

export type { ImportProps }
