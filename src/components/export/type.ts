import type FdExport from "./export"

/**
 * 导出组件实例类型
 * @description 用于通过 ref 获取组件实例时的类型定义
 */
export type ExportInstance = InstanceType<typeof FdExport>
