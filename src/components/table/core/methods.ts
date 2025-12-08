import type { TableState } from "./state"
import type { TableRecord, TableOptions, TableUseOptions } from "../interface"
import { merge } from "lodash-es"
import { getColumnId, rebuildColumnSettings } from "./settings"

/**
 * 表格方法接口
 * 定义了表格操作的核心方法
 */
export interface TableMethods {
  /** 配置表格选项 */
  use: (options: TableUseOptions<TableRecord>) => void
  /** 刷新表格数据 */
  refresh: (params?: Record<string, unknown>) => void
  /** 选择指定行 */
  select: (rowKey?: string | number | Array<string | number>, checked?: boolean) => void
  /** 全选/取消全选 */
  selectAll: (checked?: boolean) => void
  /** 展开指定行 */
  expand: (rowKey: string | number | Array<string | number>, expanded?: boolean) => void
  /** 展开/收起所有行 */
  expandAll: (expanded?: boolean) => void
  /** 设置表格数据 */
  setData: (rows: TableRecord[]) => void
  /** 设置表格属性 */
  setTable: (tableProps: Record<string, unknown>) => void
  /** 清除表格数据 */
  clearData: () => void
  /** 重置过滤器 */
  resetFilters: (dataIndex?: string | string[]) => void
  /** 清除过滤器（别名） */
  clearFilters: (dataIndex?: string | string[]) => void
  /** 重置排序器 */
  resetSorters: () => void
  /** 清除排序器（别名） */
  clearSorters: () => void
  /** 清除选择 */
  clearSelection: () => void
  /** 切换全屏 */
  toggleFullscreen: (full?: boolean) => void
}

/**
 * 创建表格方法的依赖上下文
 */
export interface TableMethodsContext {
  state: TableState
  crud: {
    refresh: (params?: Record<string, unknown>) => void
    selection: TableRecord[]
  }
  mitt?: {
    emit?: (event: string, payload?: unknown) => void
  }
  emit: (event: string, ...args: unknown[]) => void
}

/**
 * 将分页选项应用到表格状态
 * @param state - 表格状态
 * @param pagination - 分页选项
 */
function applyPaginationOptions(state: TableState, pagination?: TableOptions["pagination"]) {
  if (!pagination) return
  if (pagination.pageSizes) state.paginationState.pageSizes = [...pagination.pageSizes]
  if (pagination.pageSize) state.paginationState.pageSize = Number(pagination.pageSize)
  if (pagination.currentPage) state.paginationState.currentPage = Number(pagination.currentPage)
}

/**
 * 获取行的键值
 * @param state - 表格状态
 * @param row - 表格行
 * @returns 行键
 */
function getRowKeyValue(state: TableState, row: TableRecord) {
  const rowKey = state.rowKeyProp.value
  // rowKey 支持字符串/函数：
  // - 函数：直接调用，返回行的唯一标识
  // - 字符串：作为属性名，从 row 中获取对应的值
  if (typeof rowKey === "function") {
    return rowKey(row)
  }
  if (typeof rowKey === "string") {
    const value = row[rowKey]
    if (typeof value === "string" || typeof value === "number") return value
  }
  return undefined
}

/**
 * 根据键查找行
 * @param state - 表格状态
 * @param rowKey - 要查找的键
 * @returns 查找到的行
 */
function findRowsByKey(state: TableState, rowKey: string | number | Array<string | number>) {
  // 兼容数组批量查找，将行主键映射回行数据
  const keys = Array.isArray(rowKey) ? rowKey : [rowKey]
  return state.tableRows.value.filter((row) => {
    const keyValue = getRowKeyValue(state, row)
    return keyValue !== undefined && keys.includes(keyValue)
  })
}

/**
 * 创建表格方法
 * @param context - 方法依赖的上下文
 * @returns 表格方法对象
 */
export function createTableMethods(context: TableMethodsContext): TableMethods {
  const { state, crud, mitt, emit } = context

  /**
   * 使用提供的选项配置表格
   */
  const use = (useOptions: TableUseOptions<TableRecord>) => {
    // merge 支持增量配置，保留已存在的状态值（如 paginationState）
    merge(state.tableOptions, useOptions)
    applyPaginationOptions(state, useOptions.pagination)
    if (useOptions.columns) {
      // 补全列的默认属性，确保后续渲染与缓存有稳定 __id
      state.tableOptions.columns = useOptions.columns.map((column, index) => ({
        __id: getColumnId(column, index),
        show: column.show ?? true,
        sort: column.sort ?? column.type !== "action",
        align: column.align ?? "center",
        ...column,
      }))
      rebuildColumnSettings(state)
    }
  }

  /**
   * 刷新表格数据
   */
  const refresh = (params?: Record<string, unknown>) => {
    crud.refresh(params)
  }

  /**
   * 选择特定行
   */
  const select = (rowKey?: string | number | Array<string | number>, checked = true) => {
    if (!rowKey) return
    const rows = findRowsByKey(state, rowKey)
    rows.forEach((row) => {
      // 利用 el-table 原生 API 切换勾选状态
      state.tableRef.value?.toggleRowSelection(row, checked)
    })
  }

  /**
   * 选择或取消选择所有行
   */
  const selectAll = (checked?: boolean) => {
    if (checked === undefined) {
      state.tableRef.value?.toggleAllSelection?.()
      return
    }
    // 清空后按需重新勾选，避免状态不同步
    state.tableRef.value?.clearSelection?.()
    if (checked) {
      state.tableRows.value.forEach((row) => {
        state.tableRef.value?.toggleRowSelection(row, true)
      })
    }
  }

  /**
   * 展开特定行
   */
  const expand = (rowKey: string | number | Array<string | number>, expanded = true) => {
    const rows = findRowsByKey(state, rowKey)
    rows.forEach((row) => {
      // 使用 Element Plus 提供的展开控制，保持与 UI 状态一致
      state.tableRef.value?.toggleRowExpansion(row, expanded)
    })
  }

  /**
   * 展开或收起所有行
   */
  const expandAll = (expanded = true) => {
    state.tableRows.value.forEach((row) => {
      state.tableRef.value?.toggleRowExpansion(row, expanded)
    })
  }

  /**
   * 重置过滤器
   */
  const resetFilters = (dataIndex?: string | string[]) => {
    if (dataIndex) {
      state.tableRef.value?.clearFilter(dataIndex)
    }
    else {
      state.tableRef.value?.clearFilter()
    }
  }

  /**
   * 重置排序器
   */
  const resetSorters = () => {
    state.tableRef.value?.clearSort()
  }

  /**
   * 清除过滤器（resetFilters 的别名）
   */
  const clearFilters = (dataIndex?: string | string[]) => {
    resetFilters(dataIndex)
  }

  /**
   * 清除排序器（resetSorters 的别名）
   */
  const clearSorters = () => {
    resetSorters()
  }

  /**
   * 直接设置表格数据
   */
  const setData = (rows: TableRecord[]) => {
    state.tableRows.value = Array.isArray(rows) ? [...rows] : []
  }

  /**
   * 清除表格数据
   */
  const clearData = () => {
    state.tableRows.value = []
  }

  /**
   * 设置表格属性
   */
  const setTable = (tableProps: Record<string, unknown>) => {
    merge(state.tableOptions.table, tableProps)
  }

  /**
   * 清除当前选择
   */
  const clearSelection = () => {
    state.tableRef.value?.clearSelection?.()
    state.selectedRows.value = []
    // 注意：crud.selection 由 useCrud hook 通过 selection-change 事件自动同步，这里不直接赋值
  }

  /**
   * 切换全屏模式
   */
  const toggleFullscreen = (full?: boolean) => {
    state.isFullscreen.value = typeof full === "boolean" ? full : !state.isFullscreen.value
    mitt?.emit?.("fullscreen", state.isFullscreen.value)
    emit("fullscreenChange", state.isFullscreen.value)
  }

  return {
    use,
    refresh,
    select,
    selectAll,
    expand,
    expandAll,
    setData,
    setTable,
    clearData,
    resetFilters,
    clearFilters,
    resetSorters,
    clearSorters,
    clearSelection,
    toggleFullscreen,
  }
}
