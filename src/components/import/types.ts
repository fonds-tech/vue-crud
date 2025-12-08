import type FdImport from "./import.tsx"

/**
 * 导入结果接口
 * @description 后端返回的导入结果结构
 */
export interface ImportResult {
  /** 是否成功 */
  success?: boolean
  /** 成功导入的数量 */
  count?: number
  /** 错误信息列表 */
  errors?: Array<{
    /** 行号 */
    row?: number
    /** 错误原因 */
    message: string
  }>
  /** 其他字段 */
  [key: string]: any
}

/**
 * 导入组件实例类型
 * @description 用于通过 ref 获取组件实例时的类型定义
 */
export type ImportInstance = InstanceType<typeof FdImport>
