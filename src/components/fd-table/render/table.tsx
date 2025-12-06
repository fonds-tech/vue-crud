/**
 * @fileoverview 表格渲染层 - 主表格渲染函数
 * 将渲染逻辑从 table.tsx 抽离，保持主文件精简
 */
import type { TableSize } from "../engine/state"
import type { TableEngine } from "../engine"
import type { TableScope, TableRecord } from "../type"
import type { Slots, VNode, Directive, CSSProperties } from "vue"
import { TableFooter } from "./pagination"
import { TableToolbar } from "./toolbar"
import { renderColumns } from "./columns"
import { renderContextMenu } from "./context-menu"
import { h, withDirectives } from "vue"
import { ElTable, ElLoading } from "element-plus"
import { ColumnSettingsPanel } from "./settings-panel"
import { onDragEnd, onDragMove, saveColumns, toggleFixed, resetColumns, toggleAllColumns, onColumnShowChange } from "../engine/settings"

/**
 * 渲染表格的参数接口
 */
export interface RenderTableParams {
  engine: TableEngine
  slots: Slots
  vueSlots: Slots
}

/**
 * 渲染完整的表格组件
 * @param params - 渲染参数
 * @returns 表格的 VNode
 */
export function renderTable(params: RenderTableParams): VNode {
  const { engine, slots, vueSlots } = params
  const { state, handlers, methods, renderHelpers, crudBridge, isLoading, sizeOptions, emitColumnsChange } = engine

  // 将用户自定义插槽按名称透传给子列，确保动态 slot 解析时可用
  const extraSlots = Object.fromEntries(
    state.namedExtraSlots.value.map(slotName => [slotName, (scope: TableScope<TableRecord>) => slots[slotName]?.(scope) ?? null]),
  )

  // Element Plus Loading 指令需要 withDirectives 包装，保持类型安全
  const loadingDirective: Directive = (ElLoading as { directive?: Directive }).directive ?? (ElLoading as unknown as Directive)
  const tableNode = withDirectives(
    h(
      ElTable,
      {
        ref: state.tableRef,
        data: state.tableRows.value,
        rowKey: state.rowKeyProp.value,
        onSelectionChange: handlers.onSelectionChange,
        onRowContextmenu: handlers.onCellContextmenu,
        ...state.elTableProps.value,
      },
      {
        default: () => renderColumns(state.visibleColumns.value, renderHelpers, slots, crudBridge),
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
        slots: vueSlots,
        toolsEnabled: Boolean(state.tableOptions.table.tools),
        sizeOptions,
        currentSize: (state.tableOptions.table.size as TableSize | undefined) ?? "default",
        onRefresh: () => methods.refresh(),
        onSizeChange: size => handlers.onSizeChange(size),
        columnSettings: columnSettingsNode,
        onToggleFullscreen: () => methods.toggleFullscreen(),
        isFullscreen: state.isFullscreen.value,
      }),
      slots.header ? h("div", { class: "fd-table__header" }, slots.header()) : null,
      h("div", { class: "fd-table__body" }, [tableNode]),
      TableFooter({
        paginationStart: state.paginationStart.value,
        paginationEnd: state.paginationEnd.value,
        selectedCount: state.selectedRows.value.length,
        paginationProps: state.paginationProps.value,
        onPageChange: handlers.onPageChange,
        onPageSizeChange: handlers.onPageSizeChange,
      }),
      renderContextMenu(engine),
    ],
  )
}
