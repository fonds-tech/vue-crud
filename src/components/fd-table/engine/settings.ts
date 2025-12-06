/**
 * @fileoverview 列设置逻辑模块
 * 包含列设置的类型定义、缓存操作和状态管理
 */
import type { TableColumn, TableRecord } from "../type"
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
 * 从本地存储读取列设置
 */
function readCache(cacheKey: string | undefined, version: string) {
  if (!cacheKey || typeof localStorage === "undefined") return undefined
  try {
    const raw = localStorage.getItem(cacheKey)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as {
      version: string
      order: string[]
      columns: Record<string, { show: boolean, pinned?: boolean, fixed?: "left" | "right" }>
    }
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
  if (!state.cacheKey.value || typeof localStorage === "undefined") return
  try {
    const version = getVersion(state.tableOptions.columns)
    const order = state.columnSettings.value
      .filter(item => item.sort)
      .sort((a, b) => a.order - b.order)
      .map(item => item.id)
    const columns = Object.fromEntries(
      state.columnSettings.value.map(item => [item.id, { show: item.show, pinned: item.pinned, fixed: item.fixed }]),
    )
    localStorage.setItem(state.cacheKey.value, JSON.stringify({ version, order, columns }))
  }
  catch {
    // 缓存失败不阻塞主流程
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
    const normalizedFixed: ColumnSetting["fixed"] = rawFixed === "left" || rawFixed === "right"
      ? rawFixed
      : rawFixed === true
        ? "left"
        : undefined
    const fixed = normalizedFixed
      ?? (column.type === "action"
        ? "right"
        : column.type === "selection"
          ? "left"
          : undefined)
    const baseOrder = sort ? orderMap.get(id) ?? index : index
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
  if (state.cacheKey.value && typeof localStorage !== "undefined") {
    localStorage.removeItem(state.cacheKey.value)
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
