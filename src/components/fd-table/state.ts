import type { Ref, Slots, ComputedRef } from "vue"
import type { TableInstance, PaginationProps } from "element-plus"
import type { TableColumn, TableRecord, TableOptions } from "./type"
import { ref, computed, reactive } from "vue"

/**
 * 表示表格列设置的接口
 */
export interface ColumnSetting {
  id: string
  label: string
  show: boolean
  order: number
  sort: boolean
  pinned: boolean
  fixed?: "left" | "right"
}

/**
 * 表示上下文菜单项的接口
 */
export interface ContextMenuItem {
  label: string
  action: () => void
}

/**
 * 表示分页状态的接口
 */
export interface PaginationState {
  total: number
  pageSize: number
  currentPage: number
  pageSizes: number[]
}

/**
 * 表示表格整体状态的接口
 */
export interface TableState {
  tableRows: Ref<TableRecord[]>
  selectedRows: Ref<TableRecord[]>
  isFullscreen: Ref<boolean>
  tableRef: Ref<TableInstance | undefined>
  tableOptions: TableOptions<TableRecord>
  columnSettings: Ref<ColumnSetting[]>
  cacheKey: ComputedRef<string | undefined>
  isAllChecked: ComputedRef<boolean>
  isIndeterminate: ComputedRef<boolean>
  attrsRecord: ComputedRef<Record<string, unknown>>
  rootAttrs: ComputedRef<Record<string, unknown>>
  tableAttrs: ComputedRef<Record<string, unknown>>
  visibleColumns: ComputedRef<TableColumn<TableRecord>[]>
  namedExtraSlots: ComputedRef<string[]>
  elTableProps: ComputedRef<Record<string, unknown>>
  paginationState: PaginationState
  paginationProps: ComputedRef<Partial<PaginationProps>>
  paginationStart: ComputedRef<number>
  paginationEnd: ComputedRef<number>
  rowKeyProp: ComputedRef<TableOptions<TableRecord>["table"]["rowKey"]>
  shouldShowToolbar: ComputedRef<boolean>
  contextMenuState: {
    visible: boolean
    x: number
    y: number
    items: ContextMenuItem[]
  }
}

/**
 * 默认分页配置
 */
export const defaultPagination = {
  layout: "total, sizes, prev, pager, next, jumper",
  background: true,
  pageSize: 20,
  pageSizes: [10, 20, 50, 100],
}

/**
 * 表格尺寸的类型定义
 */
export type TableSize = "" | "large" | "default" | "small"

/**
 * 表格尺寸选择的选项
 */
export const tableSizeOptions: Array<{ label: string, value: TableSize }> = [
  { label: "紧凑", value: "small" },
  { label: "默认", value: "default" },
  { label: "偏大", value: "large" },
]

/**
 * 创建并初始化表格状态
 *
 * @param props - 组件属性
 * @param slots - 组件插槽
 * @param attrs - 组件属性
 * @param initialCrudParams - 初始 CRUD 参数
 * @returns 初始化的表格状态
 */
export function createTableState(
  props: { name?: string },
  slots: Slots,
  attrs: Record<string, unknown>,
  initialCrudParams: Partial<{ page: number, size: number }> = {},
): TableState {
  const tableRows = ref<TableRecord[]>([])
  const selectedRows = ref<TableRecord[]>([])
  const isFullscreen = ref(false)
  const tableRef = ref<TableInstance>()
  const tableOptions = reactive<TableOptions<TableRecord>>({
    table: {
      border: true,
      stripe: false,
      size: "default",
      tools: true,
      rowKey: "id",
    },
    columns: [],
    pagination: { ...defaultPagination },
  } as TableOptions<TableRecord>)

  const attrsRecord = computed(() => attrs as Record<string, unknown>)
  const rootAttrs = computed(() => {
    const { class: className, style } = attrsRecord.value
    return { class: className, style }
  })
  const tableAttrs = computed(() => {
    const { class: _class, style: _style, ...rest } = attrsRecord.value
    return rest
  })

  const paginationState = reactive<PaginationState>({
    total: 0,
    pageSize: initialCrudParams.size ?? tableOptions.pagination?.pageSize ?? defaultPagination.pageSize ?? defaultPagination.pageSizes[0],
    currentPage: initialCrudParams.page ?? 1,
    pageSizes: tableOptions.pagination?.pageSizes ?? defaultPagination.pageSizes,
  })

  const paginationProps = computed<Partial<PaginationProps>>(() => ({
    layout: tableOptions.pagination?.layout ?? defaultPagination.layout,
    background: tableOptions.pagination?.background ?? defaultPagination.background,
    ...tableOptions.pagination,
    pageSizes: paginationState.pageSizes,
    pageSize: paginationState.pageSize,
    total: paginationState.total,
    currentPage: paginationState.currentPage,
  }))

  const columnSettings = ref<ColumnSetting[]>([])
  const cacheKey = computed(() => {
    const tableName = props.name ?? tableOptions.name
    return tableName ? `fd-table:${tableName}:columns` : undefined
  })
  const isAllChecked = computed(() => columnSettings.value.length > 0 && columnSettings.value.every(item => item.show))
  const isIndeterminate = computed(() => {
    const visible = columnSettings.value.filter(item => item.show)
    return visible.length > 0 && visible.length < columnSettings.value.length
  })

  const visibleColumns = computed<TableColumn<TableRecord>[]>(() => {
    if (!columnSettings.value.length) return tableOptions.columns

    const idToColumn = new Map<string, TableColumn<TableRecord>>()
    tableOptions.columns.forEach((column, index) => {
      const id = column.__id || column.prop || column.label || `col_${index}`
      idToColumn.set(id, column)
    })

    return columnSettings.value
      .filter(item => item.show)
      .map((state) => {
        const column = idToColumn.get(state.id)
        if (!column) return undefined
        return {
          ...column,
          fixed: state.fixed,
        }
      })
      .filter(Boolean) as TableColumn<TableRecord>[]
  })

  const namedExtraSlots = computed(() => Object.keys(slots).filter(key => !["toolbar", "header", "default"].includes(key)))

  const elTableProps = computed(() => {
    const { tools, fullscreen: _fullscreen, ...rest } = tableOptions.table
    return {
      height: "100%",
      highlightCurrentRow: true,
      headerCellClassName: "fd-table__header-cell",
      ...tableAttrs.value,
      ...rest,
    }
  })

  const paginationStart = computed(() => (paginationState.total === 0 ? 0 : (paginationState.currentPage - 1) * paginationState.pageSize + 1))
  const paginationEnd = computed(() => (paginationState.total === 0 ? 0 : Math.min(paginationState.currentPage * paginationState.pageSize, paginationState.total)))
  const rowKeyProp = computed(() => tableOptions.table.rowKey)
  const shouldShowToolbar = computed(() => Boolean(slots.toolbar || tableOptions.table.tools))

  const contextMenuState = reactive({
    visible: false,
    x: 0,
    y: 0,
    items: [] as ContextMenuItem[],
  })

  return {
    tableRows,
    selectedRows,
    isFullscreen,
    tableRef,
    tableOptions,
    columnSettings,
    cacheKey,
    isAllChecked,
    isIndeterminate,
    attrsRecord,
    rootAttrs,
    tableAttrs,
    visibleColumns,
    namedExtraSlots,
    elTableProps,
    paginationState,
    paginationProps,
    paginationStart,
    paginationEnd,
    rowKeyProp,
    shouldShowToolbar,
    contextMenuState,
  }
}
