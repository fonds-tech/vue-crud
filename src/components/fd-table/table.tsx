import type { TableSize } from "./state"
import type { CrudBridge } from "./actions"
import type { Slots, Directive, CSSProperties } from "vue"
import type { TableScope, TableColumn, TableExpose, TableRecord, TableOptions, TableUseOptions } from "./type"
import { merge } from "lodash-es"
import { useCore } from "@/hooks"
import { TableFooter } from "./pagination"
import { TableToolbar } from "./toolbar"
import { renderColumns } from "./columns"
import { ElTable, ElLoading } from "element-plus"
import { createRenderHelpers } from "./render"
import { buildContextMenuItems } from "./actions"
import { registerEvents, unregisterEvents } from "./hooks"
import { createTableState, tableSizeOptions } from "./state"
import { h, watch, Teleport, computed, useAttrs, useSlots, onMounted, withDirectives, defineComponent, onBeforeUnmount } from "vue"
import { onDragEnd, onDragMove, saveColumns, toggleFixed, resetColumns, toggleAllColumns, onColumnShowChange, ColumnSettingsPanel, rebuildColumnSettings } from "./settings"
import "./style.scss"

/**
 * FdTable 组件
 * 一个灵活且功能强大的表格组件，内置 CRUD 支持、分页和列设置。
 */
export default defineComponent({
  name: "fd-table",
  inheritAttrs: false,
  props: {
    /** 表格名称，用于缓存列设置 */
    name: String,
  },
  emits: ["columnsChange"],
  setup(props, { slots, expose, emit }) {
    const attrs = useAttrs()
    const vueSlots = useSlots()
    const { crud, mitt } = useCore()
    const initialCrudParams = crud?.getParams?.() ?? crud?.params ?? {}
    const state = createTableState(props, vueSlots, attrs, initialCrudParams)
    const renderHelpers = createRenderHelpers()
    const crudBridge: CrudBridge = {
      refresh: params => crud.refresh(params),
      rowInfo: crud.rowInfo,
      rowEdit: crud.rowEdit,
      rowDelete: crud.rowDelete,
      dict: { label: crud.dict?.label, primaryId: crud.dict?.primaryId },
    }
    const isLoading = computed(() => crud.loading)
    const emitColumnsChange = (cols: TableColumn<TableRecord>[]) => emit("columnsChange", cols)

    /**
     * 将分页选项应用到表格状态
     * @param pagination - 分页选项
     */
    const applyPaginationOptions = (pagination?: TableOptions["pagination"]) => {
      if (!pagination) return
      if (pagination.pageSizes) state.paginationState.pageSizes = [...pagination.pageSizes]
      if (pagination.pageSize) state.paginationState.pageSize = Number(pagination.pageSize)
      if (pagination.currentPage) state.paginationState.currentPage = Number(pagination.currentPage)
    }

    /**
     * 使用提供的选项配置表格
     * @param useOptions - 要应用的选项
     */
    const use = (useOptions: TableUseOptions<TableRecord>) => {
      merge(state.tableOptions, useOptions)
      applyPaginationOptions(useOptions.pagination)
      if (useOptions.columns) {
        state.tableOptions.columns = useOptions.columns.map((column, index) => ({
          __id: column.prop || column.label || `col_${index}`,
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
     * @param params - 可选的刷新参数
     */
    const refresh = (params?: Record<string, unknown>) => {
      crud.refresh(params)
    }

    /**
     * 处理表格尺寸更改
     * @param size - 新的尺寸
     */
    const onSizeChange = (size: TableSize) => {
      state.tableOptions.table.size = size
    }

    /**
     * 处理行选择更改
     * @param rows - 选中的行
     */
    const onSelectionChange = (rows: TableRecord[]) => {
      state.selectedRows.value = rows
      crud.selection = rows
    }

    /**
     * 处理当前页码更改
     * @param page - 新的页码
     */
    const onPageChange = (page: number) => {
      state.paginationState.currentPage = page
      crud.setParams({ page })
      crud.refresh()
    }

    /**
     * 处理每页数量更改
     * @param size - 新的每页数量
     */
    const onPageSizeChange = (size: number) => {
      state.paginationState.pageSize = size
      state.paginationState.currentPage = 1
      crud.setParams({ page: 1, size })
      crud.refresh()
    }

    /**
     * 获取行的键值
     * @param row - 表格行
     * @returns 行键
     */
    const getRowKeyValue = (row: TableRecord) => {
      const rowKey = state.rowKeyProp.value
      const key = typeof rowKey === "function" ? rowKey(row) : rowKey
      if (typeof key === "string" || typeof key === "number") return key
      return undefined
    }

    /**
     * 根据键查找行
     * @param rowKey - 要查找的键
     * @returns 查找到的行
     */
    const findRowsByKey = (rowKey: string | number | Array<string | number>) => {
      const keys = Array.isArray(rowKey) ? rowKey : [rowKey]
      return state.tableRows.value.filter((row) => {
        const keyValue = getRowKeyValue(row)
        return keyValue !== undefined && keys.includes(keyValue)
      })
    }

    /**
     * 选择特定行
     * @param rowKey - 要选中的行键
     * @param checked - 是否选中
     */
    const select = (rowKey?: string | number | Array<string | number>, checked = true) => {
      if (!rowKey) return
      const rows = findRowsByKey(rowKey)
      rows.forEach((row) => {
        state.tableRef.value?.toggleRowSelection(row, checked)
      })
    }

    /**
     * 选择或取消选择所有行
     * @param checked - 如果为 true，则全选；如果为 false，则取消全选；如果未定义，则切换全选
     */
    const selectAll = (checked?: boolean) => {
      if (checked === undefined) {
        state.tableRef.value?.toggleAllSelection?.()
        return
      }
      state.tableRef.value?.clearSelection?.()
      if (checked) {
        state.tableRows.value.forEach((row) => {
          state.tableRef.value?.toggleRowSelection(row, true)
        })
      }
    }

    /**
     * 展开特定行
     * @param rowKey - 要展开的行键
     * @param expanded - 是否展开
     */
    const expand = (rowKey: string | number | Array<string | number>, expanded = true) => {
      const rows = findRowsByKey(rowKey)
      rows.forEach((row) => {
        state.tableRef.value?.toggleRowExpansion(row, expanded)
      })
    }

    /**
     * 展开或收起所有行
     * @param expanded - 是否展开
     */
    const expandAll = (expanded = true) => {
      state.tableRows.value.forEach((row) => {
        state.tableRef.value?.toggleRowExpansion(row, expanded)
      })
    }

    /**
     * 重置过滤器
     * @param dataIndex - 要重置过滤器的列键
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
     * @param dataIndex - 要清除过滤器的列键
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
     * @param rows - 新的数据行
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
     * @param tableProps - 要设置的属性
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
      crud.selection = []
    }

    /**
     * 切换全屏模式
     * @param full - 显式全屏状态
     */
    const toggleFullscreen = (full?: boolean) => {
      state.isFullscreen.value = typeof full === "boolean" ? full : !state.isFullscreen.value
      mitt?.emit?.("fullscreen", state.isFullscreen.value)
    }

    /**
     * 关闭上下文菜单
     */
    const closeContextMenu = () => {
      state.contextMenuState.visible = false
    }

    /**
     * 处理来自核心的数据刷新事件
     * @param payload - 数据有效载荷
     */
    const tableRefreshHandler = (payload: unknown) => {
      if (!payload || typeof payload !== "object") return
      const data = payload as { list?: TableRecord[], page?: number, count?: number, pageSize?: number }
      state.tableRows.value = Array.isArray(data.list) ? data.list : []
      state.paginationState.total = data.count ?? state.tableRows.value.length
      if (data.page) state.paginationState.currentPage = data.page
      if (data.pageSize) state.paginationState.pageSize = data.pageSize
    }

    /**
     * 处理单元格上的上下文菜单事件
     * @param row - 行
     * @param column - 列
     * @param event - 鼠标事件
     */
    const onCellContextmenu = (row: TableRecord, column: TableScope["column"], event: MouseEvent) => {
      event.preventDefault()
      const rowIndex = state.tableRows.value.findIndex(item => item === row)
      const scope: TableScope<TableRecord> = { row, column, $index: rowIndex >= 0 ? rowIndex : 0 }
      state.contextMenuState.items = buildContextMenuItems(scope, state.tableOptions.columns, crudBridge, refresh)
      state.contextMenuState.x = event.clientX
      state.contextMenuState.y = event.clientY
      state.contextMenuState.visible = true
    }

    /**
     * 处理上下文菜单操作
     * @param item - 菜单项
     */
    const handleContextAction = (item: { action: () => void }) => {
      item.action()
      closeContextMenu()
    }

    watch(
      () => state.tableOptions.columns,
      (cols) => {
        if (cols && cols.length) {
          rebuildColumnSettings(state)
        }
      },
      { deep: true },
    )

    const handlers = {
      refresh: tableRefreshHandler,
      select: (rowKey?: string | number | Array<string | number>, checked?: boolean) => select(rowKey, checked),
      selectAll: (checked?: boolean) => selectAll(checked),
      clearSelection: () => clearSelection(),
      toggleFullscreen: (full?: boolean) => toggleFullscreen(typeof full === "boolean" ? full : undefined),
      closeContextMenu,
    }

    onMounted(() => {
      registerEvents(mitt, handlers)
    })

    onBeforeUnmount(() => {
      unregisterEvents(mitt, handlers)
    })

    expose({
      get selection() {
        return state.selectedRows.value
      },
      get isSelectAll() {
        return state.selectedRows.value.length === state.tableRows.value.length && state.tableRows.value.length > 0
      },
      get data() {
        return state.tableRows.value
      },
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
    } satisfies TableExpose)

    const renderContextMenu = () =>
      h(
        Teleport,
        { to: "body" },
        {
          default: () =>
            state.contextMenuState.visible
              ? h(
                  "div",
                  {
                    class: "fd-table__context-menu",
                    style: { top: `${state.contextMenuState.y}px`, left: `${state.contextMenuState.x}px` },
                  },
                  state.contextMenuState.items.map((item, index) =>
                    h(
                      "div",
                      {
                        key: index,
                        class: "fd-table__context-menu-item",
                        onClick: () => handleContextAction(item),
                      },
                      item.label,
                    ),
                  ),
                )
              : null,
        },
      )

    return () => {
      const extraSlots = Object.fromEntries(
        state.namedExtraSlots.value.map(slotName => [slotName, (scope: TableScope<TableRecord>) => slots[slotName]?.(scope) ?? null]),
      )

      const loadingDirective: Directive = (ElLoading as { directive?: Directive }).directive ?? (ElLoading as unknown as Directive)
      const tableNode = withDirectives(
        h(
          ElTable,
          {
            ref: state.tableRef,
            data: state.tableRows.value,
            rowKey: state.rowKeyProp.value,
            onSelectionChange,
            onRowContextmenu: onCellContextmenu,
            ...state.elTableProps.value,
          },
          {
            default: () => renderColumns(state.visibleColumns.value, renderHelpers, slots as Slots, crudBridge),
            ...extraSlots,
          },
        ),
        [[loadingDirective, isLoading.value]],
      )

      const columnSettingsNode = ColumnSettingsPanel({
        state,
        onColumnShowChange: (id, val) => onColumnShowChange(state, id, val),
        toggleAllColumns: val => toggleAllColumns(state, val),
        onDragMove: evt => onDragMove(evt),
        onDragEnd: () => onDragEnd(state),
        toggleFixed: (id, fixed) => toggleFixed(state, id, fixed),
        resetColumns: () => resetColumns(state),
        saveColumns: () => saveColumns(state, emitColumnsChange),
      })

      return h(
        "div",
        {
          class: ["fd-table", state.rootAttrs.value.class, { "is-fullscreen": state.isFullscreen.value }],
          style: state.rootAttrs.value.style as CSSProperties,
        },
        [
          TableToolbar({
            show: state.shouldShowToolbar.value,
            slots: vueSlots as Slots,
            toolsEnabled: Boolean(state.tableOptions.table.tools),
            sizeOptions: tableSizeOptions,
            currentSize: (state.tableOptions.table.size as TableSize | undefined) ?? "default",
            onRefresh: () => refresh(),
            onSizeChange: size => onSizeChange(size),
            columnSettings: columnSettingsNode,
            onToggleFullscreen: () => toggleFullscreen(),
            isFullscreen: state.isFullscreen.value,
          }),
          slots.header ? h("div", { class: "fd-table__header" }, slots.header()) : null,
          h("div", { class: "fd-table__body" }, [tableNode]),
          TableFooter({
            paginationStart: state.paginationStart.value,
            paginationEnd: state.paginationEnd.value,
            selectedCount: state.selectedRows.value.length,
            paginationProps: state.paginationProps.value,
            onPageChange,
            onPageSizeChange,
          }),
          renderContextMenu(),
        ],
      )
    }
  },
})
