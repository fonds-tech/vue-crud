import type { TableCore } from "../core"
import type { TableSize } from "../core/state"
import type { TableScope, TableRecord } from "../interface"
import type { Slots, VNode, Directive, CSSProperties } from "vue"
import { TableFooter } from "./pagination"
import { TableToolbar } from "./toolbar"
import { renderColumns } from "./columns"
import { ColumnSettings } from "./settings"
import { h, withDirectives } from "vue"
import { ElTable, ElLoading } from "element-plus"
import { onDragEnd, onDragMove, saveColumns, toggleFixed, resetColumns, toggleAllColumns, onColumnShowChange } from "../core/settings"

// Element Plus Table 支持的事件列表（按官方文档枚举，用于动态生成事件监听器）
const elTableEventNames = [
  "select",
  "select-all",
  "selection-change",
  "cell-mouse-enter",
  "cell-mouse-leave",
  "cell-click",
  "cell-dblclick",
  "cell-contextmenu",
  "row-click",
  "row-contextmenu",
  "row-dblclick",
  "row-mouse-enter",
  "row-mouse-leave",
  "expand-change",
  "current-change",
  "header-click",
  "header-contextmenu",
  "sort-change",
  "filter-change",
  "header-dragend",
] as const

/**
 * 渲染表格的参数接口
 */
export interface RenderTableParams {
  slots: Slots
  engine: TableCore
}

/**
 * 事件处理器接口
 */
interface EventHandlers {
  onSelectionChange: (rows: TableRecord[]) => void
  onCellContextmenu: (row: TableRecord, column: any, event: MouseEvent) => void
}

/**
 * 构建 ElTable 事件监听器（纯函数）
 * @param handlers - 内部事件处理器
 * @param emit - 事件发射函数
 * @returns 事件监听器对象
 */
function buildEventListeners(handlers: EventHandlers, emit: (event: string, ...args: unknown[]) => void): Record<string, (...args: unknown[]) => void> {
  return elTableEventNames.reduce<Record<string, (...args: unknown[]) => void>>(
    (acc, event) => {
      // 将 kebab-case 事件名转换为 camelCase (例如 selection-change -> selectionChange)
      const camelEvent = String(event).replace(/-([a-z])/g, (_: string, letter: string) => letter.toUpperCase())
      const propName = `on${camelEvent.charAt(0).toUpperCase()}${camelEvent.slice(1)}`

      // 对于特殊事件，需要链式调用内部处理器和 emit
      if (event === "selection-change") {
        acc[propName] = (...args: unknown[]) => {
          handlers.onSelectionChange(args[0] as TableRecord[])
          emit(event, ...args)
        }
      }
      else if (event === "row-contextmenu") {
        // row-contextmenu 事件参数：(row, column, event)
        acc[propName] = (...args: unknown[]) => {
          handlers.onCellContextmenu(args[0] as TableRecord, args[1] as any, args[2] as MouseEvent)
          emit(event, ...args)
        }
      }
      else if (event === "cell-contextmenu") {
        // cell-contextmenu 事件参数：(row, column, cell, event) - event 在第4个位置
        acc[propName] = (...args: unknown[]) => {
          handlers.onCellContextmenu(args[0] as TableRecord, args[1] as any, args[3] as MouseEvent)
          emit(event, ...args)
        }
      }
      else {
        acc[propName] = (...args: unknown[]) => emit(event, ...args)
      }
      return acc
    },
    {} as Record<string, (...args: unknown[]) => void>,
  )
}

/**
 * 渲染完整的表格组件
 * @param params - 渲染参数
 * @returns 表格的 VNode
 */
export function renderTable(params: RenderTableParams): VNode {
  const { engine, slots } = params
  const { state, handlers, methods, renderHelpers, crudBridge, isLoading, sizeOptions, emitColumnsChange, emit } = engine

  // 将用户自定义插槽按名称透传给子列，确保动态 slot 解析时可用
  const extraSlots = Object.fromEntries(state.namedExtraSlots.value.map(slotName => [slotName, (scope: TableScope<TableRecord>) => slots[slotName]?.(scope) ?? null]))

  // 使用纯函数生成事件监听器
  const eventListeners = buildEventListeners(handlers, emit)

  // Element Plus Loading 指令需要 withDirectives 包装，保持类型安全
  const loadingDirective: Directive = (ElLoading as { directive?: Directive }).directive ?? (ElLoading as unknown as Directive)
  const tableNode = withDirectives(
    h(
      ElTable,
      {
        "ref": state.tableRef,
        "data": state.tableRows.value,
        "rowKey": state.rowKeyProp.value,
        "element-loading-text": "加载中...",
        "element-loading-background": "rgba(0, 0, 0, 0.7)",
        ...eventListeners,
        ...state.elTableProps.value,
      },
      {
        default: () => renderColumns(state.visibleColumns.value, renderHelpers, slots, crudBridge),
        // 优化：加载时不显示"暂无数据"，避免与loading遮罩同时出现
        empty: () => (isLoading.value ? "" : (slots.empty?.() ?? "暂无数据")),
        ...extraSlots,
      },
    ),
    [[loadingDirective, isLoading.value]],
  )

  const columnSettingsNode = ColumnSettings({
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
        slots,
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
    ],
  )
}
