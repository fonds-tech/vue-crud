/**
 * @fileoverview 表格引擎主入口
 * 参考 fd-form 的 engine 架构，提供统一的表格引擎接口
 */
import type { MittLike } from "./hooks"
import type { CrudBridge } from "./actions"
import type { TableState } from "./state"
import type { TableMethods } from "./methods"
import type { TableHandlers } from "./handlers"
import type { RenderHelpers } from "./helpers"
import type { Slots, ComputedRef } from "vue"
import type { TableColumn, TableExpose, TableRecord } from "../type"
import { createTableMethods } from "./methods"
import { createTableHandlers } from "./handlers"
import { createRenderHelpers } from "./helpers"
import { rebuildColumnSettings } from "./settings"
import { registerEvents, unregisterEvents } from "./hooks"
import { createTableState, tableSizeOptions } from "./state"
import { watch, computed, onMounted, onBeforeUnmount } from "vue"

/**
 * 表格引擎实例接口
 * 对外暴露的完整引擎上下文
 */
export interface TableEngine {
  /** 表格状态 */
  state: TableState
  /** 核心方法 */
  methods: TableMethods
  /** 事件处理器 */
  handlers: TableHandlers
  /** 渲染辅助函数 */
  renderHelpers: RenderHelpers
  /** CRUD 桥接对象 */
  crudBridge: CrudBridge
  /** 加载状态 */
  isLoading: ComputedRef<boolean>
  /** 尺寸选项 */
  sizeOptions: typeof tableSizeOptions
  /** 暴露给父组件的接口 */
  exposed: TableExpose
  /** 触发列变更事件 */
  emitColumnsChange: (cols: TableColumn<TableRecord>[]) => void
}

/**
 * 表格引擎初始化选项
 */
export interface TableEngineOptions {
  props: { name?: string }
  slots: Slots
  attrs: Record<string, unknown>
  emit: (event: "columnsChange", cols: TableColumn<TableRecord>[]) => void
  crud: {
    loading: boolean
    selection: TableRecord[]
    params?: Record<string, unknown>
    dict?: { label?: unknown, primaryId?: string }
    getParams?: () => Record<string, unknown>
    setParams: (params: Record<string, unknown>) => void
    refresh: (params?: Record<string, unknown>) => void
    rowInfo: (row: TableRecord) => void
    rowEdit: (row: TableRecord) => void
    rowDelete: (row: TableRecord) => void
  }
  mitt?: MittLike
}

/**
 * 创建表格引擎
 * 将状态、方法、事件处理器整合为统一的引擎实例
 *
 * @param options - 引擎初始化选项
 * @returns 表格引擎实例
 */
export function useTableEngine(options: TableEngineOptions): TableEngine {
  const { props, slots, attrs, emit, crud, mitt } = options

  // 初始查询参数来自 crud hook，保持分页同步
  const initialCrudParams = crud?.getParams?.() ?? crud?.params ?? {}
  const state = createTableState(props, slots, attrs, initialCrudParams)

  // 渲染辅助函数
  const renderHelpers = createRenderHelpers()

  // 将 crud 能力包装为桥接对象，方便传递到渲染层
  const crudBridge: CrudBridge = {
    refresh: (params?: Record<string, unknown>) => crud.refresh(params),
    rowInfo: crud.rowInfo,
    rowEdit: crud.rowEdit,
    rowDelete: crud.rowDelete,
    dict: {
      // label 是一个 Record<string, string | undefined>，需要类型断言以匹配 CrudBridge.dict.label
      label: crud.dict?.label && typeof crud.dict.label === "object" ? crud.dict.label as Record<string, string | undefined> : undefined,
      primaryId: crud.dict?.primaryId,
    },
  }

  // 加载状态
  const isLoading = computed(() => crud.loading)

  // 触发列变更事件
  const emitColumnsChange = (cols: TableColumn<TableRecord>[]) => emit("columnsChange", cols)

  // 创建核心方法
  const methods = createTableMethods({
    state,
    crud: {
      refresh: crud.refresh,
      selection: crud.selection,
    },
    mitt,
  })

  // 创建事件处理器
  const handlers = createTableHandlers({
    state,
    crud: {
      selection: crud.selection,
      setParams: crud.setParams,
      refresh: crud.refresh,
    },
    crudBridge,
    refresh: methods.refresh,
  })

  // 监听列配置变化，重建列设置
  watch(
    () => state.tableOptions.columns,
    (cols) => {
      if (cols && cols.length) {
        // 当列配置变动时同步重建列设置（如新增/删除列）
        rebuildColumnSettings(state)
      }
    },
    { deep: true },
  )

  // mitt 事件映射
  const mittHandlers = {
    refresh: handlers.tableRefreshHandler,
    select: (rowKey?: string | number | Array<string | number>, checked?: boolean) => methods.select(rowKey, checked),
    selectAll: (checked?: boolean) => methods.selectAll(checked),
    clearSelection: () => methods.clearSelection(),
    toggleFullscreen: (full?: boolean) => methods.toggleFullscreen(typeof full === "boolean" ? full : undefined),
    closeContextMenu: handlers.closeContextMenu,
  }

  // 生命周期钩子
  onMounted(() => {
    // 注册 mitt 事件与全局点击监听，支持外部控制刷新/选择等
    registerEvents(mitt, mittHandlers)
  })

  onBeforeUnmount(() => {
    // 组件销毁时移除监听，避免内存泄漏
    unregisterEvents(mitt, mittHandlers)
  })

  // 暴露给父组件的接口
  const exposed: TableExpose = {
    get selection() {
      return state.selectedRows.value
    },
    get isSelectAll() {
      return state.selectedRows.value.length === state.tableRows.value.length && state.tableRows.value.length > 0
    },
    get data() {
      return state.tableRows.value
    },
    use: methods.use,
    refresh: methods.refresh,
    select: methods.select,
    selectAll: methods.selectAll,
    expand: methods.expand,
    expandAll: methods.expandAll,
    setData: methods.setData,
    setTable: methods.setTable,
    clearData: methods.clearData,
    resetFilters: methods.resetFilters,
    clearFilters: methods.clearFilters,
    resetSorters: methods.resetSorters,
    clearSorters: methods.clearSorters,
    clearSelection: methods.clearSelection,
    toggleFullscreen: methods.toggleFullscreen,
  }

  return {
    state,
    methods,
    handlers,
    renderHelpers,
    crudBridge,
    isLoading,
    sizeOptions: tableSizeOptions,
    exposed,
    emitColumnsChange,
  }
}

// 导出子模块
export * from "./actions"
export type { CrudBridge } from "./actions"
export * from "./handlers"
export * from "./helpers"
export * from "./methods"
export { rebuildColumnSettings } from "./settings"
export { tableSizeOptions } from "./state"
export type { ColumnSetting, TableSize, TableState } from "./state"
