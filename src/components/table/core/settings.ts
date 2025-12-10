/**
 * @fileoverview 列设置逻辑模块
 * 包含列设置的类型定义、缓存操作和状态管理
 */
import type { TableColumn, TableRecord } from "../interface"
import type { TableState, ColumnSetting } from "./state"

/**
 * 拖拽事件对象
 */
export interface DragMoveEvent {
  draggedContext?: { element?: ColumnSetting }
  relatedContext?: { element?: ColumnSetting }
}

/**
 * 列设置面板组件的属性
 */
export interface ColumnSettingsPanelProps {
  state: TableState
  onColumnShowChange: (id: string, value: boolean) => void
  toggleAllColumns: (value: boolean) => void
  onDragMove: (evt: DragMoveEvent) => boolean
  onDragEnd: () => void
  toggleFixed: (id: string, fixed: "left" | "right") => void
  resetColumns: () => void
  saveColumns: () => void
}

/**
 * 生成列的唯一 ID
 */
export function getColumnId(column: TableColumn<TableRecord>, index: number) {
  return column.__id || column.prop || column.label || `col_${index}`
}

/**
 * 基于列 ID 生成版本字符串
 */
function getVersion(columns: TableColumn<TableRecord>[]) {
  const ids = columns.map((column, index) => getColumnId(column, index))
  return Array.from(new Set(ids)).sort().join("|")
}

/**
 * 列缓存数据的类型定义
 */
interface ColumnCacheData {
  version: string
  order: string[]
  columns: Record<string, { show: boolean, pinned?: boolean, fixed?: "left" | "right" }>
}

/**
 * 校验缓存数据结构是否有效
 * @param data - 待校验的数据
 * @returns 是否为有效的缓存数据
 */
function isValidCacheData(data: unknown): data is ColumnCacheData {
  if (data === null || typeof data !== "object") return false

  const obj = data as Record<string, unknown>

  // 校验 version 字段
  if (typeof obj.version !== "string") return false

  // 校验 order 字段
  if (!Array.isArray(obj.order)) return false
  if (!obj.order.every(item => typeof item === "string")) return false

  // 校验 columns 字段
  if (typeof obj.columns !== "object" || obj.columns === null) return false
  const columns = obj.columns as Record<string, unknown>
  for (const value of Object.values(columns)) {
    if (typeof value !== "object" || value === null) return false
    const col = value as Record<string, unknown>
    if (typeof col.show !== "boolean") return false
    if (col.pinned !== undefined && typeof col.pinned !== "boolean") return false
    if (col.fixed !== undefined && col.fixed !== "left" && col.fixed !== "right") return false
  }

  return true
}

/**
 * 安全检查 localStorage 是否可用
 * @returns localStorage 是否可用
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "__fd_table_test__"
    localStorage.setItem(testKey, "1")
    localStorage.removeItem(testKey)
    return true
  }
  catch {
    // 隐私模式或 localStorage 被禁用时会抛出异常
    return false
  }
}

/**
 * 从本地存储读取列设置
 */
function readCache(cacheKey: string | undefined, version: string): ColumnCacheData | undefined {
  if (!cacheKey || !isLocalStorageAvailable()) return undefined
  try {
    const raw = localStorage.getItem(cacheKey)
    if (!raw) return undefined

    const parsed: unknown = JSON.parse(raw)

    // 运行时校验数据结构
    if (!isValidCacheData(parsed)) {
      // 缓存数据结构无效，清理并返回
      localStorage.removeItem(cacheKey)
      return undefined
    }

    // 版本不匹配时返回 undefined（不删除，可能是临时切换列配置）
    if (parsed.version !== version) return undefined

    return parsed
  }
  catch {
    return undefined
  }
}

/**
 * 将当前列设置写入本地存储
 */
export function writeCache(state: TableState) {
  if (!state.cacheKey.value || !isLocalStorageAvailable()) return
  try {
    const version = getVersion(state.tableOptions.columns)
    const order = state.columnSettings.value
      .filter(item => item.sort)
      .sort((a, b) => a.order - b.order)
      .map(item => item.id)
    const columns = Object.fromEntries(state.columnSettings.value.map(item => [item.id, { show: item.show, pinned: item.pinned, fixed: item.fixed }]))
    const cacheData: ColumnCacheData = { version, order, columns }
    localStorage.setItem(state.cacheKey.value, JSON.stringify(cacheData))
  }
  catch {
    // 缓存失败不阻塞主流程（可能是存储空间不足或隐私模式）
  }
}

/**
 * 基于表格选项和缓存重建列设置
 */
export function rebuildColumnSettings(state: TableState, useCache = true) {
  const version = getVersion(state.tableOptions.columns)
  const cache = useCache ? readCache(state.cacheKey.value, version) : undefined
  const orderMap = new Map<string, number>()
  cache?.order?.forEach((id, idx) => orderMap.set(id, idx))

  const settings: ColumnSetting[] = state.tableOptions.columns.map((column, index) => {
    const id = getColumnId(column, index)
    const pinned = cache?.columns?.[id]?.pinned ?? column.pinned ?? false
    const isNonSortableType = column.type === "action" || column.type === "selection"
    const sort = !isNonSortableType && (column.sort ?? true) && !pinned
    const rawFixed = cache?.columns?.[id]?.fixed ?? column.fixed
    const normalizedFixed: ColumnSetting["fixed"] = rawFixed === "left" || rawFixed === "right" ? rawFixed : rawFixed === true ? "left" : undefined
    const fixed = normalizedFixed ?? (column.type === "action" ? "right" : column.type === "selection" ? "left" : undefined)
    const baseOrder = sort ? (orderMap.get(id) ?? index) : index
    const label = column.label || (column.type === "selection" ? "选择" : column.prop) || id
    return {
      id,
      label,
      show: cache?.columns?.[id]?.show ?? column.show ?? true,
      order: baseOrder,
      sort,
      pinned,
      fixed,
    }
  })

  state.columnSettings.value = settings
  sortColumnSettings(state)
}

/**
 * 处理列可见性更改
 */
export function onColumnShowChange(state: TableState, id: string, value: boolean) {
  state.columnSettings.value = state.columnSettings.value.map(item => (item.id === id ? { ...item, show: value } : item))
}

/**
 * 切换所有列的可见性
 */
export function toggleAllColumns(state: TableState, value: boolean) {
  state.columnSettings.value = state.columnSettings.value.map(item => ({ ...item, show: value }))
}

/**
 * 基于固定状态和顺序对列设置进行排序
 */
export function sortColumnSettings(state: TableState) {
  const rank = (fixed?: "left" | "right") => {
    if (fixed === "left") return 0
    if (fixed === "right") return 2
    return 1
  }
  state.columnSettings.value = [...state.columnSettings.value]
    .sort((a, b) => {
      const r = rank(a.fixed) - rank(b.fixed)
      if (r !== 0) return r
      return a.order - b.order
    })
    .map((item, idx) => ({ ...item, order: idx }))
}

/**
 * 从数组索引同步列设置的顺序属性
 */
export function syncOrderFromList(state: TableState) {
  state.columnSettings.value = state.columnSettings.value.map((item, index) => ({
    ...item,
    order: index,
  }))
}

/**
 * 处理拖动结束操作
 */
export function onDragEnd(state: TableState) {
  syncOrderFromList(state)
  sortColumnSettings(state)
}

/**
 * 处理拖动过程中的移动事件
 */
export function onDragMove(evt: DragMoveEvent) {
  const dragged = evt?.draggedContext?.element
  const related = evt?.relatedContext?.element
  if (!dragged || !dragged.sort) return false
  if (dragged.pinned || related?.pinned) return false
  if (dragged.fixed !== related?.fixed) return false
  return true
}

/**
 * 切换列的固定状态
 */
export function toggleFixed(state: TableState, id: string, fixed: "left" | "right") {
  state.columnSettings.value = state.columnSettings.value.map((item) => {
    if (item.id !== id) return item
    const nextFixed = item.fixed === fixed ? undefined : fixed
    return {
      ...item,
      fixed: nextFixed,
      sort: (item.sort ?? true) && !item.pinned,
    }
  })
  sortColumnSettings(state)
}

/**
 * 将列设置重置为默认状态
 */
export function resetColumns(state: TableState) {
  if (state.cacheKey.value && isLocalStorageAvailable()) {
    try {
      localStorage.removeItem(state.cacheKey.value)
    }
    catch {
      // 移除缓存失败不阻塞重置流程
    }
  }
  rebuildColumnSettings(state, false)
}

/**
 * 保存当前列设置
 */
export function saveColumns(state: TableState, emit: (columns: TableColumn<TableRecord>[]) => void) {
  writeCache(state)
  emit(state.visibleColumns.value)
}
