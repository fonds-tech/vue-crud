import type { TableInstance, PaginationProps } from "element-plus"
import type { TableColumn, TableRecord, TableOptions } from "../types"
import type { Ref, Slots, ComputedRef, UnwrapNestedRefs } from "vue"
import { ref, computed, reactive } from "vue"

export type TableSize = "" | "large" | "default" | "small"

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
  tableOptions: UnwrapNestedRefs<TableOptions<TableRecord>>
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
 * 默认分页配置（基于常量生成，保持向后兼容）
 */
export const defaultPagination = {
  layout: "total, sizes, prev, pager, next, jumper",
  background: true,
  pageSize: 20,
  pageSizes: [10, 20, 50, 100],
}

/**
 * 表格尺寸选择的选项（从常量重新导出，保持向后兼容）
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
 * @param props.name - 表格名称，用于缓存键生成
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
  // 核心响应式容器：表格行、选中行、全屏状态、表实例与全局配置
  const tableRows = ref<TableRecord[]>([])
  const selectedRows = ref<TableRecord[]>([])
  const isFullscreen = ref(false)
  const tableRef = ref<TableInstance>()
  // tableOptions 作为"源配置"，后续 use(...) 更新直接作用于此，默认启用边框、指定行主键
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

  // attrsRecord 保存外部透传属性，rootAttrs/tableAttrs 用于拆分根容器样式与表格专用属性
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

  // paginationProps 统一生成传给 el-pagination 的 props，确保受控的 total/currentPage/pageSize 同步
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
  // 列全选/半选状态用于同步列设置弹窗中的 checkbox 状态
  const isAllChecked = computed(() => columnSettings.value.length > 0 && columnSettings.value.every(item => item.show))
  const isIndeterminate = computed(() => {
    const visible = columnSettings.value.filter(item => item.show)
    return visible.length > 0 && visible.length < columnSettings.value.length
  })

  const visibleColumns = computed<TableColumn<TableRecord>[]>(() => {
    // 无列设置时直接返回初始列，避免不必要的 Map 构建
    if (!columnSettings.value.length) return tableOptions.columns

    // 将列 id 映射到原始列配置，确保按照用户排序输出且保留其他字段
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
          // 固定列配置来自用户在列设置中的选择，覆盖原始 fixed
          fixed: state.fixed,
        }
      })
      .filter(Boolean) as TableColumn<TableRecord>[]
  })

  // 过滤出用户自定义的额外具名插槽，排除系统保留插槽
  const reservedSlots = new Set<string>(["toolbar", "header", "default"])
  const namedExtraSlots = computed(() => Object.keys(slots).filter(key => !reservedSlots.has(key)))

  // fd-table 专用的配置键集合，不应透传给 el-table
  const fdTableOnlyKeys = new Set<string>(["tools", "fullscreen"])

  // 显式收窄返回类型以避免 TS 对展开后的 TableConfig 进行深度实例化导致 "类型实例化过深" 报错
  const elTableProps = computed<Record<string, unknown>>(() => {
    const merged: Record<string, unknown> = {
      height: "100%",
      highlightCurrentRow: true,
      headerCellClassName: "fd-table__header-cell",
      ...tableAttrs.value,
    }
    // 通过遍历过滤掉 fd-table 专用配置，剩余属性透传给 el-table
    // 使用 Object.keys 避免 TableProps 深度类型推断导致 TS2589
    const tableConfig = tableOptions.table ?? {}
    for (const key of Object.keys(tableConfig)) {
      if (!fdTableOnlyKeys.has(key)) {
        merged[key] = (tableConfig as Record<string, unknown>)[key]
      }
    }
    return merged
  })

  // 分页起止显示值基于 total 与当前页动态计算，total 为 0 时展示 0-0
  const paginationStart = computed(() => (paginationState.total === 0 ? 0 : (paginationState.currentPage - 1) * paginationState.pageSize + 1))
  const paginationEnd = computed(() => (paginationState.total === 0 ? 0 : Math.min(paginationState.currentPage * paginationState.pageSize, paginationState.total)))
  const rowKeyProp = computed(() => tableOptions.table.rowKey)
  // 工具栏仅在传入 toolbar 插槽或开启 tools 开关时展示
  const shouldShowToolbar = computed(() => Boolean(slots.toolbar || tableOptions.table.tools))

  // 右键菜单状态存储屏幕坐标与菜单项，用于 contextmenu 触发时展示
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
