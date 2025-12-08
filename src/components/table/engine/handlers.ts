import type { CrudBridge } from "./actions"
import type { TableSize, TableState } from "./state"
import type { TableScope, TableRecord } from "../types"
import { buildContextMenuItems } from "./actions"

/**
 * 表格事件处理器接口
 */
export interface TableHandlers {
  /** 处理尺寸变更 */
  onSizeChange: (size: TableSize) => void
  /** 处理行选择变更 */
  onSelectionChange: (rows: TableRecord[]) => void
  /** 处理页码变更 */
  onPageChange: (page: number) => void
  /** 处理每页数量变更 */
  onPageSizeChange: (size: number) => void
  /** 处理右键菜单事件 */
  onCellContextmenu: (row: TableRecord, column: TableScope["column"], event: MouseEvent) => void
  /** 处理右键菜单操作 */
  handleContextAction: (item: { action: () => void }) => void
  /** 关闭右键菜单 */
  closeContextMenu: () => void
  /** 处理数据刷新事件 */
  tableRefreshHandler: (payload: unknown) => void
}

/**
 * 创建事件处理器的依赖上下文
 */
export interface TableHandlersContext {
  state: TableState
  crud: {
    selection: TableRecord[]
    setParams: (params: Record<string, unknown>) => void
    refresh: (params?: Record<string, unknown>) => void
  }
  crudBridge: CrudBridge
  refresh: (params?: Record<string, unknown>) => void
  /** 事件发射器 */
  emit: (event: string, ...args: unknown[]) => void
}

/**
 * 创建表格事件处理器
 * @param context - 处理器依赖的上下文
 * @returns 事件处理器对象
 */
export function createTableHandlers(context: TableHandlersContext): TableHandlers {
  const { state, crud, crudBridge, refresh, emit } = context

  /**
   * 处理表格尺寸更改
   */
  const onSizeChange = (size: TableSize) => {
    state.tableOptions.table.size = size
    emit("sizeChange", size)
  }

  /**
   * 处理行选择更改
   */
  const onSelectionChange = (rows: TableRecord[]) => {
    // 同步选中行到本地状态与 crud hook，便于外部复用
    state.selectedRows.value = rows
    crud.selection = rows
    // 注意：selection-change 由 render/table.tsx 中 ElTable 直接透传触发
  }

  /**
   * 处理当前页码更改
   */
  const onPageChange = (page: number) => {
    // 更新本地分页并写入 crud 参数，触发刷新
    state.paginationState.currentPage = page
    crud.setParams({ page })
    crud.refresh()
    emit("pageChange", page)
  }

  /**
   * 处理每页数量更改
   */
  const onPageSizeChange = (size: number) => {
    // 变更 pageSize 时重置页码为 1，保持刷新逻辑一致
    state.paginationState.pageSize = size
    state.paginationState.currentPage = 1
    crud.setParams({ page: 1, size })
    crud.refresh()
    emit("pageSizeChange", size)
  }

  /**
   * 关闭上下文菜单
   */
  const closeContextMenu = () => {
    state.contextMenuState.visible = false
  }

  /**
   * 处理来自核心的数据刷新事件
   */
  const tableRefreshHandler = (payload: unknown) => {
    if (!payload || typeof payload !== "object") return
    const data = payload as { list?: TableRecord[], page?: number, count?: number, pageSize?: number }
    // 将 crud 返回的数据映射到内部状态：数据列表、分页总数、当前页与页容量
    state.tableRows.value = Array.isArray(data.list) ? data.list : []
    state.paginationState.total = data.count ?? state.tableRows.value.length
    if (data.page) state.paginationState.currentPage = data.page
    if (data.pageSize) state.paginationState.pageSize = data.pageSize
  }

  /**
   * 处理单元格上的上下文菜单事件
   */
  const onCellContextmenu = (row: TableRecord, column: TableScope["column"], event: MouseEvent) => {
    event.preventDefault()
    const rowIndex = state.tableRows.value.findIndex(item => item === row)
    // 构造作用域并基于配置生成菜单项，同时记录鼠标坐标用于弹窗定位
    const scope: TableScope<TableRecord> = { row, column, $index: rowIndex >= 0 ? rowIndex : 0 }
    state.contextMenuState.items = buildContextMenuItems(scope, state.tableOptions.columns, crudBridge, refresh)
    state.contextMenuState.x = event.clientX
    state.contextMenuState.y = event.clientY
    state.contextMenuState.visible = true
  }

  /**
   * 处理上下文菜单操作
   */
  const handleContextAction = (item: { action: () => void }) => {
    item.action()
    closeContextMenu()
  }

  return {
    onSizeChange,
    onSelectionChange,
    onPageChange,
    onPageSizeChange,
    onCellContextmenu,
    handleContextAction,
    closeContextMenu,
    tableRefreshHandler,
  }
}
