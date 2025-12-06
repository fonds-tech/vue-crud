import type { TableSize } from "../engine/state"
import type { TableEngine } from "../engine"
import type { TableScope, TableRecord } from "../type"
import type { Slots, VNode, Directive, CSSProperties } from "vue"
import { TableFooter } from "./pagination"
import { TableToolbar } from "./toolbar"
import { elTableEvents } from "../type"
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
  slots: Slots
  engine: TableEngine
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
  const extraSlots = Object.fromEntries(
    state.namedExtraSlots.value.map(slotName => [slotName, (scope: TableScope<TableRecord>) => slots[slotName]?.(scope) ?? null]),
  )

  // 动态生成 ElTable 事件监听器
  const eventListeners = elTableEvents.reduce((acc, event) => {
    // 将 kebab-case 事件名转换为 camelCase (例如 selection-change -> selectionChange)
    const camelEvent = event.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    const propName = `on${camelEvent.charAt(0).toUpperCase()}${camelEvent.slice(1)}`

    // 对于特殊事件，需要链式调用内部处理器和 emit
    if (event === "selection-change") {
      acc[propName] = (...args: unknown[]) => {
        handlers.onSelectionChange(args[0] as TableRecord[])
        emit(event, ...args)
      }
    }
    else if (event === "row-contextmenu" || (event === "cell-contextmenu" && !state.tableOptions.table.rowKey)) {
      // 优先使用 row-contextmenu 或 cell-contextmenu (如果未设置 rowKey)
      // 注意：这里我们主要内部使用 cell-contextmenu，ElTable 的 contextmenu 事件冒泡行为需注意
      // 但 handlers.onCellContextmenu 实际上是绑在 onRowContextmenu 上的（见原代码）
      // 保持原逻辑：onRowContextmenu 使用 handlers.onCellContextmenu
      if (event === "row-contextmenu") {
        acc[propName] = (...args: unknown[]) => {
          handlers.onCellContextmenu(args[0] as TableRecord, args[1] as any, args[2] as MouseEvent)
          emit(event, ...args)
        }
      }
      else {
        acc[propName] = (...args: unknown[]) => emit(event, ...args)
      }
    }
    else {
      acc[propName] = (...args: unknown[]) => emit(event, ...args)
    }
    return acc
  }, {} as Record<string, (...args: unknown[]) => void>)

  // Element Plus Loading 指令需要 withDirectives 包装，保持类型安全
  const loadingDirective: Directive = (ElLoading as { directive?: Directive }).directive ?? (ElLoading as unknown as Directive)
  const tableNode = withDirectives(
    h(
      ElTable,
      {
        ref: state.tableRef,
        data: state.tableRows.value,
        rowKey: state.rowKeyProp.value,
        ...eventListeners,
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
      renderContextMenu(engine),
    ],
  )
}
