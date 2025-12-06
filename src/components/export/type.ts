import type FdExport from "./index.vue"
import type { DeepPartial } from "../form/types"

export interface Export {
  /**
   * 导出数据
   * @description: 当前的导出数据
   */
  model: Record<string, any>

  /**
   * 导出数据
   * @param params - 导出参数
   * @returns Promise<any>
   */
  export: (params: Record<string, any>) => Promise<any>

  [key: string]: any
}

export interface Options {
  /**
   * 表单数据
   * @description 表单默认数据
   */
  model: Record<string, any>

  /**
   * 导出钩子处理函数
   * @param params - 导出参数
   * @param event - 事件对象
   * @param event.next - 执行导出查询
   * @description 当点击导出按钮时触发的回调函数
   */
  onExport?: (params: Record<string, any>, event: { done: () => void, next: (params: Record<string, any>) => Promise<any> }) => void
}

export interface UseOptions extends DeepPartial<Options> {
  [key: string]: any
}

export type ExportInstance = InstanceType<typeof FdExport>
