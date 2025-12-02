<template>
  <div class="fd-table" :class="[rootAttrs.class, { 'is-fullscreen': isFullscreen }]" :style="rootAttrs.style">
    <!-- 工具条：用于放置过滤、刷新等操作 -->
    <div v-if="shouldShowToolbar" class="fd-table__toolbar">
      <slot name="toolbar" />

      <div v-if="tableOptions.table.tools" class="fd-table__tools">
        <el-tooltip content="刷新" placement="top">
          <div class="fd-table__tool-btn" role="button" tabindex="0" @click="refresh()">
            <el-icon>
              <refresh-icon />
            </el-icon>
          </div>
        </el-tooltip>

        <el-dropdown trigger="click" @command="onSizeChange">
          <span class="fd-table__tool-trigger">
            <el-tooltip content="尺寸" placement="top">
              <div class="fd-table__tool-btn" role="button" tabindex="0">
                <el-icon>
                  <operation />
                </el-icon>
              </div>
            </el-tooltip>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="size in tableSizeOptions" :key="size.value" :command="size.value" :class="{ 'is-active': size.value === tableOptions.table.size }">
                {{ size.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-popover :hide-after="0" :teleported="false" width="220px" placement="bottom-start" trigger="click" popper-class="fd-table__column-popover">
          <template #reference>
            <span class="fd-table__tool-trigger">
              <el-tooltip content="列设置" placement="top">
                <div class="fd-table__tool-btn" role="button" tabindex="0">
                  <el-icon>
                    <setting />
                  </el-icon>
                </div>
              </el-tooltip>
            </span>
          </template>
          <div class="fd-table__column-panel">
            <div class="fd-table__column-header">
              <el-checkbox :model-value="isAllChecked" :indeterminate="isIndeterminate" label="全选" @change="toggleAllColumns" />
              <el-button link type="primary" @click="resetColumns"> 重置 </el-button>
            </div>
            <el-scrollbar class="fd-table__column-scroll">
              <draggable
                v-model="columnSettings"
                item-key="id"
                :animation="180"
                ghost-class="fd-table__drag-ghost"
                chosen-class="fd-table__drag-chosen"
                :move="onDragMove"
                @end="onDragEnd"
              >
                <template #item="{ element }">
                  <div class="fd-table__column-wrapper">
                    <div
                      class="fd-table__column-item"
                      :class="{
                        'is-locked': element.pinned,
                        'is-disabled': !element.sort,
                      }"
                    >
                      <el-icon class="fd-table__drag" :class="{ 'is-disabled': !element.sort }">
                        <IconTablerDragDrop />
                      </el-icon>
                      <el-checkbox :model-value="element.show" @change="onColumnShowChange(element.id, $event)" />
                      <span class="fd-table__column-label">{{ element.label }}</span>
                      <div class="fd-table__fixed-actions">
                        <el-button link size="small" :class="{ 'is-active': element.fixed === 'left' }" @click="toggleFixed(element.id, 'left')">
                          <el-icon>
                            <IconTablerPinFilled v-if="element.fixed === 'left'" class="fd-table__icon-rotate-left" />
                            <IconTablerPin v-else class="fd-table__icon-rotate-left" />
                          </el-icon>
                        </el-button>
                        <el-button link size="small" :class="{ 'is-active': element.fixed === 'right' }" @click="toggleFixed(element.id, 'right')">
                          <el-icon>
                            <IconTablerPinFilled v-if="element.fixed === 'right'" class="fd-table__icon-rotate-right" />
                            <IconTablerPin v-else class="fd-table__icon-rotate-right" />
                          </el-icon>
                        </el-button>
                      </div>
                    </div>
                  </div>
                </template>
              </draggable>
            </el-scrollbar>
            <div class="fd-table__column-footer">
              <el-button type="primary" class="fd-table__column-save" @click="saveColumns"> 保存 </el-button>
            </div>
          </div>
        </el-popover>

        <el-tooltip content="全屏" placement="top">
          <div class="fd-table__tool-btn" role="button" tabindex="0" @click="toggleFullscreen()">
            <el-icon>
              <full-screen v-if="isFullscreen" />
              <full-screen v-else />
            </el-icon>
          </div>
        </el-tooltip>
      </div>
    </div>

    <div v-if="$slots.header" class="fd-table__header">
      <slot name="header" />
    </div>

    <div class="fd-table__body">
      <el-table
        ref="tableRef"
        v-loading="isLoading"
        :data="tableRows"
        :row-key="rowKeyProp"
        v-bind="elTableProps"
        @selection-change="onSelectionChange"
        @row-contextmenu="onCellContextmenu"
      >
        <!-- 透传除默认/工具栏/页眉外的所有具名插槽 -->
        <template v-for="slotName in namedExtraSlots" #[slotName]="scope" :key="slotName">
          <slot :name="slotName" v-bind="scope ?? {}" />
        </template>

        <template v-for="column in visibleColumns" :key="column.__id">
          <el-table-column v-if="column.type === 'selection'" type="selection" v-bind="column" />
          <el-table-column v-else-if="column.type === 'index'" type="index" v-bind="column" />
          <el-table-column v-else-if="column.type === 'expand'" type="expand" v-bind="column">
            <template #default="scope">
              <slot name="expand" v-bind="scope" />
            </template>
          </el-table-column>
          <el-table-column v-else-if="column.type === 'action'" :align="column.align || 'center'" :fixed="column.fixed || 'right'" :width="column.width || 120" v-bind="column">
            <template #default="scope">
              <div class="fd-table__actions">
                <template v-for="(action, actionIndex) in resolveActions(scope, column.actions)" :key="actionIndex">
                  <template v-if="!isHidden(action, scope)">
                    <el-link v-if="isBuiltinAction(action)" :type="getActionType(action)" @click="handleBuiltinAction(action, scope)">
                      {{ action.text ?? crud.dict?.label?.[action.type!] ?? "操作" }}
                    </el-link>
                    <slot
                      v-else-if="getSlotName(action.component, scope)"
                      :name="getSlotName(action.component, scope)!"
                      :row="scope.row"
                      :column="scope.column"
                      :row-index="scope.$index"
                    />
                    <component
                      :is="getComponentIs(action.component, scope)"
                      v-else-if="getComponentIs(action.component, scope)"
                      v-bind="getComponentProps(action.component, scope)"
                      :style="getComponentStyle(action.component, scope)"
                      v-on="getComponentEvents(action.component, scope)"
                    >
                      <template v-for="(value, slotName) in getComponentSlots(action.component, scope)" :key="slotName" #[slotName]>
                        <component :is="value" />
                      </template>
                    </component>
                  </template>
                </template>
              </div>
            </template>
          </el-table-column>
          <el-table-column v-else :prop="column.prop" :align="column.align || 'center'" :min-width="column.minWidth || 120" v-bind="column">
            <template #header>
              <template v-if="getHeaderComponent(column)">
                <component
                  :is="getComponentIs(getHeaderComponent(column), { column, $index: -1, row: undefined })"
                  v-bind="getComponentProps(getHeaderComponent(column), { column, $index: -1, row: undefined })"
                  :style="getComponentStyle(getHeaderComponent(column), { column, $index: -1, row: undefined })"
                  v-on="getComponentEvents(getHeaderComponent(column), { column, $index: -1, row: undefined })"
                >
                  <template v-for="(value, slotName) in getComponentSlots(getHeaderComponent(column), { column, $index: -1, row: undefined })" :key="slotName" #[slotName]>
                    <component :is="value" />
                  </template>
                </component>
              </template>
              <template v-else>
                <el-space :size="4" align="center">
                  <span>{{ column.label }}</span>
                  <el-tooltip v-if="column.help" :content="column.help" placement="top">
                    <el-icon class="fd-table__help">
                      <IconTablerHelp />
                    </el-icon>
                  </el-tooltip>
                </el-space>
              </template>
            </template>

            <template #default="scope">
              <el-tag v-if="hasDict(column, scope)" size="small" :type="getDictType(column, scope)" :color="getDictColor(column, scope)">
                {{ getDictLabel(column, scope) }}
              </el-tag>
              <slot
                v-else-if="getSlotName(column.component, scope)"
                :name="getSlotName(column.component, scope)!"
                :row="scope.row"
                :column="scope.column"
                :row-index="scope.$index"
              />
              <component
                :is="getComponentIs(column.component, scope)"
                v-else-if="getComponentIs(column.component, scope)"
                v-bind="getComponentProps(column.component, scope)"
                :style="getComponentStyle(column.component, scope)"
                v-on="getComponentEvents(column.component, scope)"
              >
                <template v-for="(value, slotName) in getComponentSlots(column.component, scope)" :key="slotName" #[slotName]>
                  <component :is="value" />
                </template>
              </component>
              <span v-else>{{ formatCell(column, scope) }}</span>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </div>

    <!-- 底部统计以及分页 -->
    <div class="fd-table__footer">
      <div class="fd-table__tips">
        <span v-if="selectedRows.length">已选择 {{ selectedRows.length }} 条</span>
        <span>第 {{ paginationStart }}-{{ paginationEnd }} 条</span>
      </div>
      <el-pagination v-bind="paginationProps" @current-change="onPageChange" @size-change="onPageSizeChange" />
    </div>
  </div>

  <!-- 右键菜单挂载到 body，避免被表格裁剪 -->
  <teleport to="body">
    <div v-if="contextMenuState.visible" class="fd-table__context-menu" :style="{ top: `${contextMenuState.y}px`, left: `${contextMenuState.x}px` }">
      <div v-for="(item, index) in contextMenuState.items" :key="index" class="fd-table__context-menu-item" @click="handleContextAction(item)">
        {{ item.label }}
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import type { TableDict, TableScope, TableAction, TableColumn, TableOptions, TableComponent, TableUseOptions } from "./type"
import Draggable from "vuedraggable"
import { merge } from "lodash-es"
import { useCore } from "@/hooks"
import { isFunction } from "@/utils/check"
import { ElTable, ElMessage } from "element-plus"
import { Setting, Operation, FullScreen, Refresh as RefreshIcon } from "@element-plus/icons-vue"
import { ref, watch, computed, reactive, useAttrs, useSlots, onMounted, onBeforeUnmount } from "vue"

defineOptions({
  name: "fd-table",
  inheritAttrs: false,
})

// ---------------------------
// 基础上下文：插槽、属性、CRUD 核心
// ---------------------------
const props = defineProps<{
  /**
   * 表格实例名，作为列缓存 key 使用
   */
  name?: string
}>()

const emit = defineEmits<{
  (e: "columnsChange", columns: TableColumn[]): void
}>()

const attrs = useAttrs()
const slots = useSlots()
const { crud, mitt } = useCore()

// ---------------------------
// 状态：表格数据、选择状态、全屏状态
// ---------------------------
const tableRows = ref<Record<string, any>[]>([])
const selectedRows = ref<Record<string, any>[]>([])
const isFullscreen = ref(false)
const tableRef = ref<InstanceType<typeof ElTable>>()
const attrsRecord = computed(() => attrs as Record<string, any>)
const rootAttrs = computed(() => {
  const { class: className, style } = attrsRecord.value
  return { class: className, style }
})
const tableAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrsRecord.value
  return rest
})

// ---------------------------
// 配置：表格/列配置、表格尺寸选项、分页信息
// ---------------------------
const defaultPagination = {
  layout: "total, sizes, prev, pager, next, jumper",
  background: true,
  pageSize: 20,
  pageSizes: [10, 20, 50, 100],
}

const tableOptions = reactive<TableOptions>({
  table: {
    border: true,
    stripe: false,
    size: "default",
    tools: true,
    rowKey: "id",
  },
  columns: [],
  pagination: { ...defaultPagination },
})

const tableSizeOptions = [
  { label: "紧凑", value: "small" },
  { label: "默认", value: "default" },
  { label: "偏大", value: "large" },
]

const initialCrudParams = crud?.getParams?.() ?? crud?.params ?? {}
const paginationState = reactive({
  total: 0,
  // 兜底 crud 未注入或 getParams 未定义场景，避免初始化时报错
  pageSize: initialCrudParams.size ?? tableOptions.pagination?.pageSize ?? defaultPagination.pageSize ?? defaultPagination.pageSizes[0],
  currentPage: initialCrudParams.page ?? 1,
  pageSizes: tableOptions.pagination?.pageSizes ?? defaultPagination.pageSizes,
})

const paginationProps = computed(() => ({
  layout: tableOptions.pagination?.layout ?? defaultPagination.layout,
  background: tableOptions.pagination?.background ?? defaultPagination.background,
  ...tableOptions.pagination,
  pageSizes: paginationState.pageSizes,
  pageSize: paginationState.pageSize,
  total: paginationState.total,
  currentPage: paginationState.currentPage,
}))

interface ColumnSetting {
  id: string
  label: string
  show: boolean
  order: number
  sort: boolean
  pinned: boolean
  fixed?: "left" | "right"
}

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

function getColumnId(column: TableColumn, index: number) {
  return column.__id || column.prop || column.label || `col_${index}`
}

function getVersion(columns: TableColumn[]) {
  const ids = columns.map((column, index) => getColumnId(column, index))
  return Array.from(new Set(ids)).sort().join("|")
}

function readCache(version: string) {
  if (!cacheKey.value || typeof localStorage === "undefined") return undefined
  try {
    const raw = localStorage.getItem(cacheKey.value)
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
    // 读取失败直接跳过缓存
    return undefined
  }
}

function writeCache() {
  if (!cacheKey.value || typeof localStorage === "undefined") return
  try {
    const version = getVersion(tableOptions.columns)
    const order = columnSettings.value
      .filter(item => item.sort)
      .sort((a, b) => a.order - b.order)
      .map(item => item.id)
    const columns = Object.fromEntries(columnSettings.value.map(item => [item.id, { show: item.show, pinned: item.pinned, fixed: item.fixed }]))
    localStorage.setItem(cacheKey.value, JSON.stringify({ version, order, columns }))
  }
  catch {
    // 写入失败不影响主流程
  }
}

function rebuildColumnSettings(cols: TableColumn[], useCache = true) {
  const version = getVersion(cols)
  const cache = useCache ? readCache(version) : undefined
  const orderMap = new Map<string, number>()
  cache?.order?.forEach((id, idx) => orderMap.set(id, idx))

  const settings: ColumnSetting[] = cols.map((column, index) => {
    const id = getColumnId(column, index)
    const pinned = cache?.columns?.[id]?.pinned ?? column.pinned ?? false
    const isNonSortableType = column.type === "action" || column.type === "selection"
    const sort = !isNonSortableType && (column.sort ?? true) && !pinned
    // 行为列默认右侧固定，便于操作按钮保持可见
    const rawFixed = cache?.columns?.[id]?.fixed ?? (column as any)?.fixed ?? undefined
    const fixed = rawFixed
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

  columnSettings.value = settings
  sortColumnSettings()
}

watch(
  () => tableOptions.columns,
  (cols) => {
    if (cols && cols.length) {
      rebuildColumnSettings(cols)
    }
  },
  { deep: true },
)

function onColumnShowChange(id: string, value: boolean) {
  columnSettings.value = columnSettings.value.map(item => (item.id === id ? { ...item, show: value } : item))
}

function toggleAllColumns(value: boolean) {
  columnSettings.value = columnSettings.value.map(item => ({ ...item, show: value }))
}

function sortColumnSettings() {
  const rank = (fixed?: "left" | "right") => {
    if (fixed === "left") return 0
    if (fixed === "right") return 2
    return 1
  }
  columnSettings.value = [...columnSettings.value]
    .sort((a, b) => {
      const r = rank(a.fixed) - rank(b.fixed)
      if (r !== 0) return r
      return a.order - b.order
    })
    .map((item, idx) => ({ ...item, order: idx }))
}

function syncOrderFromList() {
  columnSettings.value = columnSettings.value.map((item, index) => ({
    ...item,
    order: index,
  }))
}

function onDragEnd() {
  syncOrderFromList()
  sortColumnSettings()
}

function onDragMove(evt: any) {
  const dragged = evt?.draggedContext?.element as ColumnSetting | undefined
  const related = evt?.relatedContext?.element as ColumnSetting | undefined
  if (!dragged || !dragged.sort) return false
  if (dragged.pinned || related?.pinned) return false
  if (dragged.fixed !== related?.fixed) return false
  return true
}

function toggleFixed(id: string, fixed: "left" | "right") {
  columnSettings.value = columnSettings.value.map((item) => {
    if (item.id !== id) return item
    const nextFixed = item.fixed === fixed ? undefined : fixed
    return {
      ...item,
      fixed: nextFixed,
      sort: (item.sort ?? true) && !item.pinned,
    }
  })
  sortColumnSettings()
}

function resetColumns() {
  if (cacheKey.value && typeof localStorage !== "undefined") {
    localStorage.removeItem(cacheKey.value)
  }
  rebuildColumnSettings(tableOptions.columns, false)
}

function saveColumns() {
  writeCache()
  emit("columnsChange", visibleColumns.value)
  ElMessage.success("保存成功")
}

// ---------------------------
// 衍生数据：加载状态、插槽列表、可见列、分页区间
// ---------------------------
const isLoading = computed(() => crud.loading)
const rowKeyProp = computed(() => tableOptions.table.rowKey ?? crud.dict?.primaryId ?? "id")
const shouldShowToolbar = computed(() => Boolean(slots.toolbar || tableOptions.table.tools))
const namedExtraSlots = computed(() => Object.keys(slots).filter(key => !["toolbar", "header", "default"].includes(key)))

const visibleColumns = computed(() => {
  if (!columnSettings.value.length) return tableOptions.columns

  const idToColumn = new Map<string, TableColumn>()
  tableOptions.columns.forEach((column, index) => {
    const id = getColumnId(column, index)
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
    .filter(Boolean) as TableColumn[]
})

watch(
  visibleColumns,
  (cols) => {
    emit("columnsChange", cols)
  },
  { deep: true },
)

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

interface ContextMenuItem {
  label: string
  action: () => void
}
const contextMenuState = reactive({
  visible: false,
  x: 0,
  y: 0,
  items: [] as ContextMenuItem[],
})

// ---------------------------
// 事件总线：与 crud 核心保持同步
// ---------------------------
function tableRefreshHandler(payload: unknown) {
  if (!payload || typeof payload !== "object") return
  const data = payload as { list?: any[], page?: number, count?: number, pageSize?: number }
  tableRows.value = Array.isArray(data.list) ? data.list : []
  paginationState.total = data.count ?? tableRows.value.length
  if (data.page) paginationState.currentPage = data.page
  if (data.pageSize) paginationState.pageSize = data.pageSize
}

function tableSelectHandler(rowKey: unknown, checked?: boolean) {
  select(rowKey as any, checked)
}

function tableSelectAllHandler(checked?: boolean) {
  selectAll(checked)
}

function tableClearSelectionHandler() {
  clearSelection()
}

function tableFullscreenHandler(full?: unknown) {
  toggleFullscreen(typeof full === "boolean" ? full : undefined)
}

function registerEvents() {
  mitt?.on?.("table.refresh", tableRefreshHandler)
  mitt?.on?.("table.select", tableSelectHandler as any)
  mitt?.on?.("table.selectAll", tableSelectAllHandler as any)
  mitt?.on?.("table.clearSelection", tableClearSelectionHandler)
  mitt?.on?.("table.toggleFullscreen", tableFullscreenHandler)
  document.addEventListener("click", closeContextMenu)
}

function unregisterEvents() {
  mitt?.off?.("table.refresh", tableRefreshHandler)
  mitt?.off?.("table.select", tableSelectHandler as any)
  mitt?.off?.("table.selectAll", tableSelectAllHandler as any)
  mitt?.off?.("table.clearSelection", tableClearSelectionHandler)
  mitt?.off?.("table.toggleFullscreen", tableFullscreenHandler)
  document.removeEventListener("click", closeContextMenu)
}

function closeContextMenu() {
  contextMenuState.visible = false
}

function applyPaginationOptions(pagination?: TableOptions["pagination"]) {
  if (!pagination) return
  if (pagination.pageSizes) paginationState.pageSizes = [...pagination.pageSizes]
  if (pagination.pageSize) paginationState.pageSize = Number(pagination.pageSize)
  if (pagination.currentPage) paginationState.currentPage = Number(pagination.currentPage)
}

/**
 * 由 fd-crud 主体注入的 use 方法，合并外部配置
 */
function use(useOptions: TableUseOptions) {
  merge(tableOptions, useOptions)
  applyPaginationOptions(useOptions.pagination)
  if (useOptions.columns) {
    tableOptions.columns = useOptions.columns.map((column, index) => ({
      __id: column.prop || column.label || `col_${index}`,
      show: column.show ?? true,
      sort: column.sort ?? column.type !== "action",
      align: column.align ?? "center",
      ...column,
    }))
    rebuildColumnSettings(tableOptions.columns)
  }
}

function refresh(params?: Record<string, any>) {
  crud.refresh(params)
}

function onSizeChange(size: string) {
  tableOptions.table.size = size as any
}

/**
 * 选中行变化时同步至 crud，供外部按钮复用
 */
function onSelectionChange(rows: any[]) {
  selectedRows.value = rows
  crud.selection = rows
}

/**
 * 翻页时更新参数并自动触发 refresh
 */
function onPageChange(page: number) {
  paginationState.currentPage = page
  crud.setParams({ page })
  crud.refresh()
}

/**
 * 修改分页容量后重置页码并刷新
 */
function onPageSizeChange(size: number) {
  paginationState.pageSize = size
  paginationState.currentPage = 1
  crud.setParams({ page: 1, size })
  crud.refresh()
}

/**
 * 将 actions 转换为统一数组，兼容函数/静态写法
 */
function resolveActions(scope: any, actions?: TableAction[] | ((scope: TableScope) => TableAction[])) {
  if (!actions) return []
  if (typeof actions === "function") return actions(scope)
  return actions
}

function isBuiltinAction(action: TableAction) {
  return Boolean(action.type && ["detail", "update", "delete"].includes(action.type))
}

function getActionType(action: TableAction) {
  if (action.type === "delete") return "danger"
  return "primary"
}

function handleBuiltinAction(action: TableAction, scope: any) {
  if (action.type === "detail") {
    crud.rowInfo?.(scope.row)
  }
  else if (action.type === "update") {
    crud.rowEdit?.(scope.row)
  }
  else if (action.type === "delete") {
    crud.rowDelete?.(scope.row)
  }
}

function isHidden(item: TableAction | TableColumn, scope: any) {
  const hidden = item.hidden
  if (typeof hidden === "function") return hidden(scope)
  return Boolean(hidden)
}

/**
 * 列辅助：若字段配置了字典，则展示成 tag
 */
function hasDict(column: TableColumn, scope: any) {
  const dict = resolveDict(column, scope)
  if (!dict) return false
  return Boolean(dict.find(item => item.value === scope.row[column.prop || ""]))
}

function resolveDict(column: TableColumn, scope: any): TableDict[] | undefined {
  const dictData = column.dict
  if (!dictData) return undefined
  return typeof dictData === "function" ? dictData(scope) : dictData
}

function getDictEntry(column: TableColumn, scope: any) {
  const dict = resolveDict(column, scope)
  if (!dict) return undefined
  return dict.find(item => item.value === scope.row[column.prop || ""])
}

function getDictLabel(column: TableColumn, scope: any) {
  return getDictEntry(column, scope)?.label ?? ""
}

function getDictColor(column: TableColumn, scope: any) {
  return getDictEntry(column, scope)?.color
}

function getDictType(column: TableColumn, scope: any) {
  return getDictEntry(column, scope)?.type
}

function formatCell(column: TableColumn, scope: any) {
  const { formatter, prop, value } = column
  if (typeof formatter === "function") return formatter(scope)
  if (prop) return scope.row[prop]
  return value ?? ""
}

function getComponentIs(component: TableComponent | undefined, scope: any) {
  if (!component) return undefined
  const value = component.is
  return isFunction(value) ? (value as (scope?: any) => any)(scope) : value
}

function getComponentProps(component: TableComponent | undefined, scope: any) {
  if (!component) return {}
  const value = component.props
  return isFunction(value) ? (value as (scope?: any) => any)(scope) : value ?? {}
}

function getComponentStyle(component: TableComponent | undefined, scope: any) {
  if (!component) return undefined
  const value = component.style
  return isFunction(value) ? (value as (scope?: any) => any)(scope) : value
}

function getComponentEvents(component: TableComponent | undefined, scope: any) {
  if (!component) return {}
  const value = component.on
  return isFunction(value) ? (value as (scope?: any) => any)(scope) : value ?? {}
}

function getComponentSlots(component: TableComponent | undefined, scope: any) {
  if (!component) return {}
  const value = component.slots
  return isFunction(value) ? (value as (scope?: any) => any)(scope) : value ?? {}
}

function getColumnSlots(column: TableColumn) {
  const value = column.slots
  return typeof value === "function" ? value() : value ?? {}
}

function getHeaderComponent(column: TableColumn) {
  return (getColumnSlots(column) as any).header as TableComponent | undefined
}

function getSlotName(component: TableComponent | undefined, scope: any) {
  if (!component) return undefined
  const value = component.slot
  return isFunction(value) ? (value as (scope?: any) => any)(scope) : value
}

/**
 * 直接替换表格数据，浅拷贝数组避免改动入参
 */
function setData(rows: Record<string, any>[]) {
  tableRows.value = Array.isArray(rows) ? [...rows] : []
}

/**
 * 按需调整 element-plus 表格层面的原子属性
 */
function setTable(props: Record<string, any>) {
  merge(tableOptions.table, props)
}

function clearData() {
  tableRows.value = []
}

/**
 * 对外暴露的清空多选能力，同时同步 crud.selection
 */
function clearSelection() {
  tableRef.value?.clearSelection?.()
  selectedRows.value = []
  crud.selection = []
}

/**
 * 通过 row-key 字段定位数据行，供多处复用
 */
function getRowKeyValue(row: Record<string, any>) {
  const rowKey = rowKeyProp.value
  if (typeof rowKey === "function") return rowKey(row)
  return row?.[rowKey as string]
}

function findRowsByKey(rowKey: string | number | Array<string | number>) {
  const keys = Array.isArray(rowKey) ? rowKey : [rowKey]
  return tableRows.value.filter(row => keys.includes(getRowKeyValue(row)))
}

function select(rowKey: string | number | Array<string | number>, checked = true) {
  const rows = findRowsByKey(rowKey)
  rows.forEach((row) => {
    tableRef.value?.toggleRowSelection(row, checked)
  })
}

/**
 * 外部调用可强制全选/全不选；若未传参数则切换当前选中态
 */
function selectAll(checked?: boolean) {
  if (checked === undefined) {
    tableRef.value?.toggleAllSelection?.()
    return
  }
  tableRef.value?.clearSelection?.()
  if (checked) {
    tableRows.value.forEach((row) => {
      tableRef.value?.toggleRowSelection(row, true)
    })
  }
}

function expand(rowKey: string | number | Array<string | number>, expanded = true) {
  const rows = findRowsByKey(rowKey)
  rows.forEach((row) => {
    tableRef.value?.toggleRowExpansion(row, expanded)
  })
}

function expandAll(expanded = true) {
  tableRows.value.forEach((row) => {
    tableRef.value?.toggleRowExpansion(row, expanded)
  })
}

function resetFilters(dataIndex?: string | string[]) {
  if (dataIndex) {
    tableRef.value?.clearFilter(dataIndex)
  }
  else {
    tableRef.value?.clearFilter()
  }
}

function clearFilters(dataIndex?: string | string[]) {
  resetFilters(dataIndex)
}

function resetSorters() {
  tableRef.value?.clearSort()
}

function clearSorters() {
  tableRef.value?.clearSort()
}

/**
 * 全屏开关：支持被动响应 mitt，也支持内部按钮手动切换
 */
function toggleFullscreen(full?: boolean) {
  isFullscreen.value = typeof full === "boolean" ? full : !isFullscreen.value
  mitt.emit("fullscreen", isFullscreen.value)
}

/**
 * 自定义右键菜单：根据 action 列生成可执行操作
 */
function onCellContextmenu(row: any, column: any, event: MouseEvent) {
  event.preventDefault()
  const rowIndex = tableRows.value.findIndex(item => item === row)
  const scope = { row, column, $index: rowIndex >= 0 ? rowIndex : 0 }
  const actionColumn = tableOptions.columns.find(item => item.type === "action")
  if (!actionColumn) {
    contextMenuState.items = [
      {
        label: "刷新",
        action: () => refresh(),
      },
    ]
  }
  else {
    const resolvedActions = resolveActions(scope, actionColumn.actions)
    const menuActions = resolvedActions.filter(action => isBuiltinAction(action) && !isHidden(action, scope))
    contextMenuState.items = menuActions.map(action => ({
      label: action.text ?? crud.dict?.label?.[action.type ?? ""] ?? "操作",
      action: () => handleBuiltinAction(action, scope),
    }))
    contextMenuState.items.unshift({
      label: "刷新",
      action: () => refresh(),
    })
  }
  contextMenuState.x = event.clientX
  contextMenuState.y = event.clientY
  contextMenuState.visible = true
}

/**
 * 点击右键菜单后执行动作并立即关闭菜单
 */
function handleContextAction(item: ContextMenuItem) {
  item.action()
  closeContextMenu()
}

onMounted(() => {
  registerEvents()
})

onBeforeUnmount(() => {
  unregisterEvents()
})

defineExpose({
  get selection() {
    return selectedRows.value
  },
  get isSelectAll() {
    return selectedRows.value.length === tableRows.value.length && tableRows.value.length > 0
  },
  get data() {
    return tableRows.value
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
})
</script>

<style lang="scss">
.fd-table {
  gap: 12px;
  height: 100%;
  display: flex;
  overflow: hidden;
  flex-direction: column;

  &.is-fullscreen {
    inset: 0;
    padding: 16px;
    z-index: 2000;
    position: fixed;
    background: var(--el-bg-color-page);
  }

  &__toolbar {
    gap: 12px;
    display: flex;
    align-items: center;

    .el-button + .el-button {
      margin-left: 0;
    }
  }

  &__tools {
    gap: 8px;
    display: flex;
    margin-left: auto;
  }

  &__tool-btn {
    color: var(--el-text-color-regular);
    width: 32px;
    border: 1px solid var(--el-border-color);
    cursor: pointer;
    height: 32px;
    display: inline-flex;
    padding: 0;
    min-width: 32px;
    transition: all 0.2s ease;
    align-items: center;
    border-radius: var(--el-border-radius-base);
    justify-content: center;
    background-color: var(--el-fill-color-blank);

    &:hover {
      color: var(--el-color-primary);
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    &:active {
      color: var(--el-color-primary);
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-8);
    }

    &:focus-visible {
      outline: 2px solid var(--el-color-primary);
      outline-offset: 1px;
    }
  }

  &__tool-trigger {
    display: inline-flex;
  }

  &__body {
    flex: 1;
    overflow: hidden;
  }

  &__footer {
    gap: 12px;
    color: var(--el-text-color-regular);
    display: flex;
    font-size: var(--el-font-size-base);
    align-items: center;
    justify-content: space-between;
  }

  &__tips {
    gap: 12px;
    color: var(--el-text-color-regular);
    display: inline-flex;
    font-size: var(--el-font-size-base);
    align-items: center;
    line-height: 32px; // 与分页行高一致
    white-space: nowrap;
  }

  &__column-panel {
    display: flex;
    flex-direction: column;
  }

  &__column-header {
    display: flex;
    align-items: center;
    padding-left: 6px;
    padding-bottom: 4px;
    justify-content: space-between;
  }

  &__column-scroll {
    border-top: 1px solid var(--el-border-color-lighter);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__column-footer {
    margin-top: 6px;
  }

  &__column-wrapper {
    gap: 2px;
    display: flex;
    padding: 0 2px;
    flex-direction: column;
  }

  &__column-item {
    gap: 8px;
    display: flex;
    padding: 0 4px;
    align-items: center;
    border-radius: 6px;

    &.is-locked {
      opacity: 0.85;
    }

    &.is-disabled .fd-table__drag {
      color: var(--el-text-color-placeholder);
      cursor: not-allowed;
    }

    &:hover {
      background: var(--el-fill-color-light);
    }
  }

  &__drag {
    color: var(--el-text-color-primary);
    cursor: grab;
    font-weight: 700;

    &.is-disabled {
      cursor: not-allowed;
    }
  }

  &__column-label {
    flex: 1;
    color: var(--el-text-color-primary);
    cursor: default;
    overflow: hidden;
    font-size: var(--el-font-size-base);
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__pin {
    color: var(--el-color-primary);
  }

  &__column-save {
    width: 100%;
  }

  &__drag-ghost,
  &__drag-chosen {
    opacity: 0.9;
    position: relative;
    border-radius: 6px;
  }

  &__drag-ghost::after,
  &__drag-chosen::after {
    inset: 0;
    border: 1px dashed var(--el-color-primary);
    content: "";
    position: absolute;
    box-sizing: border-box;
    border-radius: 6px;
    pointer-events: none;
  }

  &__fixed-actions {
    gap: 4px;
    display: inline-flex;

    .el-button.is-active {
      color: var(--el-color-primary);
    }

    .el-icon {
      font-size: 14px;
      line-height: 1;
    }

    .fd-table__icon-rotate-left {
      transform: rotate(0deg);
    }

    .fd-table__icon-rotate-right {
      transform: rotate(-90deg);
    }
  }

  &__actions {
    gap: 8px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  &__help {
    color: var(--el-text-color-secondary);
    cursor: pointer;
    transition: color 0.15s ease;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  &__context-menu {
    gap: 4px;
    border: 1px solid var(--el-border-color);
    display: flex;
    padding: 8px;
    z-index: 2100;
    position: fixed;
    background: var(--el-bg-color-overlay);
    box-shadow: var(--el-box-shadow-light);
    border-radius: 6px;
    flex-direction: column;
  }

  &__context-menu-item {
    color: var(--el-text-color-regular);
    cursor: pointer;
    padding: 5px 12px;
    font-size: 13px;
    transition: all 0.2s;
    line-height: 20px;
    user-select: none;
    border-radius: 4px;

    &:hover {
      color: var(--el-color-primary);
      background-color: var(--el-fill-color-light);
    }
  }

  .el-popper.fd-table__column-popover {
    padding: 6px;
  }
}
</style>
