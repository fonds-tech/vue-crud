import type { TableProps, TableInstance, TableColumnCtx, PaginationProps } from "element-plus"
import type { VNode, VNodeChild, CSSProperties, Component as VueComponent } from "vue"

/**
 * 表格数据记录类型
 */
export type TableRecord = Record<string, any>

/**
 * 表格配置项
 */
export interface TableOptions<T extends TableRecord = TableRecord> {
  /**
   * 表格实例名，用于列缓存 key
   */
  name?: string
  /**
   * 表格属性
   * @description 继承 Element Plus Table 的全部 props，额外提供 tools/fullscreen 开关
   */
  table: Partial<TableProps<T>> & { tools?: boolean, fullscreen?: boolean }

  /**
   * 列配置
   */
  columns: TableColumn<T>[]
  /**
   * 分页配置（透传 el-pagination 的属性，如 layout、pageSizes、background 等）
   */
  pagination?: Partial<PaginationProps>
}

/**
 * 表格列配置
 */
type BaseColumn<T extends TableRecord> = Partial<Omit<TableColumnCtx<T>, "formatter" | "slots" | "type">>

export interface TableColumn<T extends TableRecord = TableRecord> extends BaseColumn<T> {
  /**
   * 内部唯一标识
   */
  __id?: string
  /**
   * 行为类型
   */
  type?: TableColumnCtx<T>["type"] | "action"
  /**
   * 标题
   */
  label?: string
  /**
   * 初始是否展示
   */
  show?: boolean
  /**
   * 是否允许在列设置中排序，默认 true，action 列默认 false
   */
  sort?: boolean
  /**
   * 是否固定（禁止排序），默认 false
   */
  pinned?: boolean
  /**
   * 默认值
   */
  value?: any
  /**
   * 帮助说明
   */
  help?: string
  /**
   * 隐藏列
   */
  hidden?: boolean | ((scope: TableScope<T>) => boolean)
  /**
   * 字典数据（自动渲染 tag）
   */
  dict?: TableDict[] | ((scope: TableScope<T>) => TableDict[])
  /**
   * 列格式化函数
   */
  formatter?: (scope: TableScope<T>) => any
  /**
   * 列内部插槽
   */
  slots?: TableSlots<T> | (() => TableSlots<T>)
  /**
   * 列自定义渲染
   */
  component?: TableComponent<T>
  /**
   * 行操作集合
   */
  actions?: TableAction<T>[] | ((scope: TableScope<T>) => TableAction<T>[])
}

/**
 * 字典配置
 */
export interface TableDict {
  label: string
  value: string | number
  type?: "success" | "warning" | "danger" | "info" | "default" | "primary"
  color?: string
  icon?: string | VueComponent
}

/**
 * 操作列按钮
 */
export interface TableAction<T extends TableRecord = TableRecord> {
  text?: string
  type?: "detail" | "update" | "delete"
  hidden?: boolean | ((scope: TableScope<T>) => boolean)
  component?: TableComponent<T>
}

/**
 * 插槽集合
 */
// 支持 header 自定义渲染：配置 slots.header 即可替换默认表头内容
export type TableSlots<T extends TableRecord = TableRecord> = Record<string, TableComponent<T>>

/**
 * 组件/插槽配置
 */
export interface TableComponent<T extends TableRecord = TableRecord> {
  is?: string | VueComponent | VNode | ((scope?: TableScope<T>) => string | VueComponent | VNode)
  on?: Record<string, (...args: any[]) => any> | ((scope?: TableScope<T>) => Record<string, (...args: any[]) => any>)
  ref?: string | ((scope?: TableScope<T>) => string)
  slot?: string | ((scope?: TableScope<T>) => string)
  style?: CSSProperties | ((scope?: TableScope<T>) => CSSProperties)
  props?: Record<string, any> | ((scope?: TableScope<T>) => Record<string, any>)
  slots?: Record<string, VNodeChild | (() => VNodeChild)> | ((scope?: TableScope<T>) => Record<string, VNodeChild | (() => VNodeChild)>)
}

/**
 * 表格作用域
 */
export interface TableScope<T extends TableRecord = TableRecord> {
  row: T
  column: TableColumnCtx<T>
  $index: number
}

/**
 * use 配置
 */
export type TableUseOptions<T extends TableRecord = TableRecord> = Partial<TableOptions<T>> & Record<string, any>

/**
 * 组件暴露的方法
 */
export interface TableExpose<T extends TableRecord = TableRecord> {
  readonly data: T[]
  readonly selection: T[]
  readonly isSelectAll: boolean
  use: (options: TableUseOptions<T>) => void
  refresh: (params?: Record<string, any>) => void
  select: (rowKey: string | number | Array<string | number>, checked?: boolean) => void
  selectAll: (checked?: boolean) => void
  expand: (rowKey: string | number | Array<string | number>, expanded?: boolean) => void
  expandAll: (expanded?: boolean) => void
  setData: (rows: T[]) => void
  setTable: (props: Record<string, any>) => void
  clearData: () => void
  resetFilters: (dataIndex?: string | string[]) => void
  clearFilters: (dataIndex?: string | string[]) => void
  resetSorters: () => void
  clearSorters: () => void
  clearSelection: () => void
  toggleFullscreen: (full?: boolean) => void
}

/**
 * 表格实例类型
 */
export type FdTableInstance = InstanceType<typeof import("./index.vue")["default"]> & TableInstance
