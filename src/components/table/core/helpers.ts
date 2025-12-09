import type { VNode, VNodeChild, CSSProperties, Component as VueComponent } from "vue"
import type { TableDict, TableScope, TableColumn, TableRecord, TableComponent } from "../interface"
import { isFunction } from "@/utils/check"

/**
 * 解析给定列和作用域的字典
 *
 * @template T
 * @param column - 表格列
 * @param scope - 当前作用域
 * @returns 解析后的字典或 undefined
 */
export function resolveDict<T extends TableRecord>(column: TableColumn<T>, scope: TableScope<T>): TableDict[] | undefined {
  const dictData = column.dict
  if (!dictData) return undefined
  // 字典既可为静态数组也可为函数，函数模式按行作用域动态生成
  return typeof dictData === "function" ? dictData(scope) : dictData
}

/**
 * 获取对应单元格值的字典条目
 *
 * @template T
 * @param column - 表格列
 * @param scope - 当前作用域
 * @returns 匹配的字典条目或 undefined
 */
export function getDictEntry<T extends TableRecord>(column: TableColumn<T>, scope: TableScope<T>) {
  const dict = resolveDict(column, scope)
  if (!dict) return undefined
  // 以列 prop 对应的行值匹配字典项，用于后续颜色/标签等衍生信息
  return dict.find(item => item.value === scope.row[column.prop || ""])
}

/**
 * 从字典中获取单元格值的标签
 *
 * @template T
 * @param column - 表格列
 * @param scope - 当前作用域
 * @returns 字典中的标签
 */
export function getDictLabel<T extends TableRecord>(column: TableColumn<T>, scope: TableScope<T>) {
  return getDictEntry(column, scope)?.label ?? ""
}

/**
 * 从字典中获取单元格值的颜色
 *
 * @template T
 * @param column - 表格列
 * @param scope - 当前作用域
 * @returns 字典中的颜色
 */
export function getDictColor<T extends TableRecord>(column: TableColumn<T>, scope: TableScope<T>) {
  return getDictEntry(column, scope)?.color
}

/**
 * 从字典中获取单元格值的类型（例如，用于标签）
 *
 * @template T
 * @param column - 表格列
 * @param scope - 当前作用域
 * @returns 字典中的类型
 */
export function getDictType<T extends TableRecord>(column: TableColumn<T>, scope: TableScope<T>) {
  return getDictEntry(column, scope)?.type
}

/**
 * 检查列是否有匹配单元格值的字典条目
 *
 * @template T
 * @param column - 表格列
 * @param scope - 当前作用域
 * @returns 如果存在字典条目则返回 true，否则返回 false
 */
export function hasDict<T extends TableRecord>(column: TableColumn<T>, scope: TableScope<T>) {
  const dict = resolveDict(column, scope)
  if (!dict) return false
  // 仅当存在匹配 value 的字典项时视为有字典渲染，避免无匹配时误用 tag
  return Boolean(dict.find(item => item.value === scope.row[column.prop || ""]))
}

/**
 * 根据列配置格式化单元格值
 *
 * @template T
 * @param column - 表格列
 * @param scope - 当前作用域
 * @returns 格式化后的单元格值
 */
export function formatCell<T extends TableRecord>(column: TableColumn<T>, scope: TableScope<T>) {
  const { formatter, prop, value } = column
  // 优先使用 formatter 进行自定义格式化，其次直接取行字段，最后回退到列默认值
  if (typeof formatter === "function") return formatter(scope)
  if (prop) return (scope.row as Record<string, unknown>)[prop]
  return value ?? ""
}

/**
 * 解析组件的 'is' 属性
 *
 * @template T
 * @param component - 组件配置
 * @param scope - 当前作用域
 * @returns 要渲染的组件
 */
export function getComponentIs<T extends TableRecord>(component: TableComponent<T> | undefined, scope: TableScope<T> | undefined) {
  if (!component) return undefined
  const value = component.is
  // is 可为动态函数，根据当前作用域选择组件类型或直接返回 VNode
  return isFunction(value) ? (value as (scope?: TableScope<T>) => string | VNode | VueComponent | undefined)(scope) : value
}

/**
 * 解析组件属性
 *
 * @template T
 * @param component - 组件配置
 * @param scope - 当前作用域
 * @returns 解析后的属性
 */
export function getComponentProps<T extends TableRecord>(component: TableComponent<T> | undefined, scope: TableScope<T> | undefined) {
  if (!component) return {}
  const value = component.props
  // props 支持按行计算，便于不同数据行传入不同配置
  return isFunction(value) ? (value as (scope?: TableScope<T>) => Record<string, unknown>)(scope) : value ?? {}
}

/**
 * 解析组件样式
 *
 * @template T
 * @param component - 组件配置
 * @param scope - 当前作用域
 * @returns 解析后的样式
 */
export function getComponentStyle<T extends TableRecord>(component: TableComponent<T> | undefined, scope: TableScope<T> | undefined) {
  if (!component) return undefined
  const value = component.style
  // 样式同样可按作用域生成，支持动态高亮/颜色
  return isFunction(value) ? (value as (scope?: TableScope<T>) => Record<string, unknown>)(scope) : value
}

/**
 * 解析组件事件
 *
 * @template T
 * @param component - 组件配置
 * @param scope - 当前作用域
 * @returns 解析后的事件处理程序
 */
export function getComponentEvents<T extends TableRecord>(component: TableComponent<T> | undefined, scope: TableScope<T> | undefined) {
  if (!component) return {}
  const value = component.on
  // 事件配置函数可根据当前行绑定不同处理器（如携带行 id）
  return isFunction(value) ? (value as (scope?: TableScope<T>) => Record<string, (...args: unknown[]) => unknown>)(scope) : value ?? {}
}

/**
 * 解析组件插槽
 *
 * @template T
 * @param component - 组件配置
 * @param scope - 当前作用域
 * @returns 解析后的插槽
 */
export function getComponentSlots<T extends TableRecord>(component: TableComponent<T> | undefined, scope: TableScope<T> | undefined) {
  if (!component) return {}
  const value = component.slots
  // 返回值可为静态对象或作用域函数，保持与组件插槽结构一致
  return isFunction(value) ? (value as (scope?: TableScope<T>) => Record<string, VNodeChild>)(scope) : (value as Record<string, VNodeChild>) ?? {}
}

/**
 * 获取列的插槽配置
 *
 * @template T
 * @param column - 表格列
 * @returns 插槽配置
 */
export function getColumnSlots<T extends TableRecord>(column: TableColumn<T>) {
  const value = column.slots
  // slots 允许懒执行函数形式，表头渲染时可动态生成 header/custom 插槽
  return typeof value === "function" ? value() : value ?? {}
}

/**
 * 获取列的表头组件
 *
 * @template T
 * @param column - 表格列
 * @returns 表头组件配置
 */
export function getHeaderComponent<T extends TableRecord>(column: TableColumn<T>) {
  return (getColumnSlots(column) as Record<string, TableComponent<T>>)?.header
}

/**
 * 解析组件的插槽名称
 *
 * @template T
 * @param component - 组件配置
 * @param scope - 当前作用域
 * @returns 插槽名称
 */
export function getSlotName<T extends TableRecord>(component: TableComponent<T> | undefined, scope: TableScope<T> | undefined) {
  if (!component) return undefined
  const value = component.slot
  return isFunction(value) ? (value as (scope?: TableScope<T>) => string)(scope) : value
}

/**
 * 渲染辅助函数接口
 * @template T
 */
export interface RenderHelpers<T extends TableRecord = TableRecord> {
  hasDict: (column: TableColumn<T>, scope: TableScope<T>) => boolean
  getDictLabel: (column: TableColumn<T>, scope: TableScope<T>) => string
  getDictColor: (column: TableColumn<T>, scope: TableScope<T>) => string | undefined
  getDictType: (column: TableColumn<T>, scope: TableScope<T>) => string | undefined
  formatCell: (column: TableColumn<T>, scope: TableScope<T>) => unknown
  getComponentIs: (component: TableComponent<T> | undefined, scope: TableScope<T> | undefined) => string | VNode | VueComponent | undefined
  getComponentProps: (component: TableComponent<T> | undefined, scope: TableScope<T> | undefined) => Record<string, unknown>
  getComponentStyle: (component: TableComponent<T> | undefined, scope: TableScope<T> | undefined) => Record<string, unknown> | CSSProperties | undefined
  getComponentEvents: (component: TableComponent<T> | undefined, scope: TableScope<T> | undefined) => Record<string, (...args: unknown[]) => unknown>
  getComponentSlots: (component: TableComponent<T> | undefined, scope: TableScope<T> | undefined) => Record<string, VNodeChild>
  getHeaderComponent: (column: TableColumn<T>) => TableComponent<T> | undefined
  getSlotName: (component: TableComponent<T> | undefined, scope: TableScope<T> | undefined) => string | undefined
}

/**
 * 创建 RenderHelpers 实例
 *
 * @template T
 * @returns 渲染辅助对象
 */
export function createRenderHelpers<T extends TableRecord = TableRecord>(): RenderHelpers<T> {
  return {
    hasDict,
    getDictLabel,
    getDictColor,
    getDictType,
    formatCell,
    getComponentIs,
    getComponentProps,
    getComponentStyle,
    getComponentEvents,
    getComponentSlots,
    getHeaderComponent,
    getSlotName,
  }
}
