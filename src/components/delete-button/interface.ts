import type { ExtractPropTypes } from "vue"
import type { deleteButtonProps } from "./delete-button"

// 提取并导出 DeleteButton 组件的 Props 类型定义，
// 方便在使用该组件的地方进行类型推导和检查。
export type DeleteButtonProps = ExtractPropTypes<typeof deleteButtonProps>
