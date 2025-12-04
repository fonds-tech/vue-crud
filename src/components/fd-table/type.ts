import type { TableProps, TableInstance, TableColumnCtx, PaginationProps } from "element-plus"
import type { VNode, VNodeChild, CSSProperties, Component as VueComponent } from "vue"

/**
 * 表格数据记录类型
 */
export type TableRecord = Record<string, unknown>

/**
 * 表格配置项
 * @template T
 */
type TableConfig<T extends TableRecord> = Partial<Omit<TableProps<T>, "context" | "data">> & { data?: T[], tools?: boolean, fullscreen?: boolean }

/**
 * 表格整体配置接口
 * @template T
 */
export interface TableOptions<T extends TableRecord = TableRecord> {
  /**
   * 表格实例名，用于列缓存 key
   */
  name?: string
  /**
   * 表格属性
   * @description 继承 Element Plus Table 的全部 props；额外提供 tools（工具条开关）/fullscreen（全屏开关）控制
   */
  table: TableConfig<T>
  /**
   * 列配置
   */
  columns: TableColumn<T>[]
  /**
   * 分页配置（透传 el-pagination 的属性，如 layout、pageSizes、background 等）
   * @description
   * - 组件内部维护：total / currentPage / pageSize，会随 CRUD 刷新事件同步；无需手动回填
   * - 可覆盖：layout、background、pageSizes、pagerCount、disabled 等 el-pagination 属性
   * - pageSize/pageSizes/currentPage 支持作为初始值传入，后续由组件状态接管
   */
  pagination?: Partial<PaginationProps>
}

/**
 * 基础表格列配置
 * @template T
 */
type BaseColumn<T extends TableRecord> = Partial<Omit<TableColumnCtx<T>, "formatter" | "slots" | "type">>

/**
 * 表格列详细配置接口
 * @template T
 */
export interface TableColumn<T extends TableRecord = TableRecord> extends BaseColumn<T> {
  /**
   * 内部唯一标识
   */
  __id?: string
  /**
   * 行为类型
   * @description 支持 Element Plus 内置 selection/index/expand 与自定义 action
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
  value?: unknown
  /**
   * 帮助说明
   * @description 配置后表头会显示提示图标，悬停展示内容
   */
  help?: string
  /**
   * 隐藏列
   * @description 布尔或函数控制显示，函数入参为 TableScope（{ row, column, $index }）
   */
  hidden?: boolean | ((scope: TableScope<T>) => boolean)
  /**
   * 字典数据（自动渲染 tag）
   * @description 可传数组或函数，函数入参为 TableScope（{ row, column, $index }），匹配 value 渲染标签
   */
  dict?: TableDict[] | ((scope: TableScope<T>) => TableDict[])
  /**
   * 列格式化函数
   * @description 入参 TableScope（{ row, column, $index }），返回展示内容
   */
  formatter?: (scope: TableScope<T>) => unknown
  /**
   * 列内部插槽
   * @description 支持配置 header/custom 单元格渲染；可为对象或函数，函数入参为 TableScope（表头时 row 为空，$index 为 -1），返回插槽对象
   */
  slots?: TableSlots<T> | (() => TableSlots<T>)
  /**
   * 列自定义渲染
   * @description 优先级高于 formatter，支持传组件/函数
   */
  component?: TableComponent<T>
  /**
   * 行操作集合
   * @description 仅 action 列生效，可为静态数组或函数（入参 TableScope）
   */
  actions?: TableAction<T>[] | ((scope: TableScope<T>) => TableAction<T>[])
}

/**
 * 字典配置项接口
 */
export interface TableDict {
  /**
   * 字典标签文案
   */
  label: string
  /**
   * 字典值，匹配行数据字段
   */
  value: string | number
  /**
   * 标签类型，对应 el-tag type
   */
  type?: "success" | "warning" | "danger" | "info" | "default" | "primary"
  /**
   * 自定义颜色（覆盖 type 默认色）
   */
  color?: string
  /**
   * 自定义图标
   */
  icon?: string | VueComponent
}

/**
 * 操作列按钮配置接口
 * @template T
 */
export interface TableAction<T extends TableRecord = TableRecord> {
  /**
   * 按钮文案
   */
  text?: string
  /**
   * 内置行为类型：详情/更新/删除
   */
  type?: "detail" | "update" | "delete"
  /**
   * 按钮隐藏控制，支持函数判断（入参 TableScope）
   */
  hidden?: boolean | ((scope: TableScope<T>) => boolean)
  /**
   * 自定义渲染组件，覆盖内置按钮
   */
  component?: TableComponent<T>
}

/**
 * 插槽集合类型
 * @description key 为插槽名称，值为 TableComponent；支持 header 自定义渲染：配置 slots.header 即可替换默认表头内容
 * @template T
 */
export type TableSlots<T extends TableRecord = TableRecord> = Record<string, TableComponent<T>>

/**
 * 组件/插槽渲染配置接口
 * @template T
 */
export interface TableComponent<T extends TableRecord = TableRecord> {
  /**
   * 组件类型，可为字符串/组件/VNode/返回 VNode 的函数；函数入参为 TableScope（表头时 row 为空，$index 为 -1）
   */
  is?: string | VueComponent | VNode | ((scope?: TableScope<T>) => string | VueComponent | VNode)
  /**
   * 事件绑定，支持函数返回事件对象；函数入参为 TableScope
   */
  on?: Record<string, (...args: unknown[]) => unknown> | ((scope?: TableScope<T>) => Record<string, (...args: unknown[]) => unknown>)
  /**
   * ref 标识或函数生成 ref 名称；函数入参为 TableScope
   */
  ref?: string | ((scope?: TableScope<T>) => string)
  /**
   * 使用具名插槽时的插槽名，支持函数；函数入参为 TableScope
   */
  slot?: string | ((scope?: TableScope<T>) => string)
  /**
   * 内联样式或函数生成样式；函数入参为 TableScope
   */
  style?: CSSProperties | ((scope?: TableScope<T>) => CSSProperties)
  /**
   * 组件 props，支持函数生成；函数入参为 TableScope
   */
  props?: Record<string, unknown> | ((scope?: TableScope<T>) => Record<string, unknown>)
  /**
   * 子插槽集合，支持函数生成；函数入参为 TableScope
   */
  slots?: Record<string, VNodeChild | (() => VNodeChild)> | ((scope?: TableScope<T>) => Record<string, VNodeChild | (() => VNodeChild)>)
}

/**
 * 表格作用域接口
 * @template T
 */
export interface TableScope<T extends TableRecord = TableRecord> {
  /**
   * 当前行数据
   */
  row: T
  /**
   * 当前列上下文（Element Plus 原始列上下文）
   */
  column: TableColumnCtx<T>
  /**
   * 当前行下标
   */
  $index: number
}

/**
 * use 方法配置类型
 * @description 作为 use(...) 入参，允许仅传增量配置，兼容扩展字段
 * @template T
 */
export type TableUseOptions<T extends TableRecord = TableRecord> = Partial<TableOptions<T>> & Record<string, unknown>

/**
 * 组件暴露的方法接口
 * @template T
 */
export interface TableExpose<T extends TableRecord = TableRecord> {
  /**
   * 当前表格数据
   * @readonly
   */
  readonly data: T[]
  /**
   * 当前选中行列表
   * @readonly
   */
  readonly selection: T[]
  /**
   * 是否全选
   * @readonly
   */
  readonly isSelectAll: boolean
  /**
   * 注入/更新配置
   * @param options - 表格配置项
   */
  use: (options: TableUseOptions<T>) => void
  /**
   * 手动刷新（触发 CRUD refresh）
   * @param params - 额外的查询参数
   */
  refresh: (params?: Record<string, unknown>) => void
  /**
   * 选中指定行（支持单个或数组）
   * @param rowKey - 行主键或主键数组
   * @param checked - 是否选中
   */
  select: (rowKey: string | number | Array<string | number>, checked?: boolean) => void
  /**
   * 全选/全不选
   * @param checked - 是否全选；若为 false 则清空选择
   */
  selectAll: (checked?: boolean) => void
  /**
   * 展开指定行
   * @param rowKey - 行主键或主键数组
   * @param expanded - 是否展开
   */
  expand: (rowKey: string | number | Array<string | number>, expanded?: boolean) => void
  /**
   * 展开/收起所有行
   * @param expanded - 是否展开所有
   */
  expandAll: (expanded?: boolean) => void
  /**
   * 设置表格数据（覆盖）
   * @param rows - 数据数组
   */
  setData: (rows: T[]) => void
  /**
   * 设置表格属性（透传到 el-table）
   * @param props - 属性对象
   */
  setTable: (props: Record<string, unknown>) => void
  /**
   * 清空数据
   */
  clearData: () => void
  /**
   * 重置过滤
   * @param dataIndex - 字段名或字段名数组
   */
  resetFilters: (dataIndex?: string | string[]) => void
  /**
   * 清空过滤
   * @param dataIndex - 字段名或字段名数组
   */
  clearFilters: (dataIndex?: string | string[]) => void
  /**
   * 重置排序
   */
  resetSorters: () => void
  /**
   * 清空排序
   */
  clearSorters: () => void
  /**
   * 清空多选
   */
  clearSelection: () => void
  /**
   * 切换全屏
   * @param full - 强制设置状态，不传则切换
   */
  toggleFullscreen: (full?: boolean) => void
}

/**
 * 表格实例类型
 */
export type FdTableInstance = InstanceType<typeof import("./table")["default"]> & TableInstance
