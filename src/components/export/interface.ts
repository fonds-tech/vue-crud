import type Export from "./export.tsx"
import type { exportProps } from "./export.ts"
import type { ExtractPropTypes } from "vue"

/**
 * 导出组件 Props 类型
 * @description 从 exportProps 提取的类型定义
 */
export type ExportProps = ExtractPropTypes<typeof exportProps>

/**
 * 导出组件实例类型
 * @description 用于通过 ref 获取组件实例时的类型定义
 */
export type ExportInstance = InstanceType<typeof Export>
