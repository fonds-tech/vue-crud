<template>
  <div class="fd-table" :class="{ 'is-fullscreen': isFullscreen }">
    <!-- 工具条：用于放置过滤、刷新等操作 -->
    <div v-if="shouldShowToolbar" class="fd-table__toolbar">
      <slot name="toolbar" />

      <div v-if="tableOptions.table.tools" class="fd-table__tools">
        <el-tooltip content="刷新">
          <el-button circle size="small" @click="refresh()">
            <el-icon>
              <refresh />
            </el-icon>
          </el-button>
        </el-tooltip>

        <el-dropdown trigger="click" @command="onSizeChange">
          <span class="fd-table__tool-trigger">
            <el-tooltip content="尺寸">
              <el-button circle size="small">
                <el-icon>
                  <operation />
                </el-icon>
              </el-button>
            </el-tooltip>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="size in tableSizeOptions" :key="size.value" :command="size.value"
                :class="{ 'is-active': size.value === tableOptions.table.size }"
              >
                {{ size.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-popover width="220" placement="bottom" trigger="click">
          <template #reference>
            <span class="fd-table__tool-trigger">
              <el-tooltip content="列设置">
                <el-button circle size="small">
                  <el-icon>
                    <setting />
                  </el-icon>
                </el-button>
              </el-tooltip>
            </span>
          </template>
          <div class="fd-table__columns">
            <el-checkbox
              v-for="column in columnVisibilityOptions" :key="column.id" v-model="column.show"
              :label="column.label"
            />
          </div>
        </el-popover>

        <el-tooltip content="全屏">
          <el-button circle size="small" @click="toggleFullscreen()">
            <el-icon>
              <full-screen v-if="isFullscreen" />
              <full-screen v-else />
            </el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <div v-if="$slots.header" class="fd-table__header">
      <slot name="header" />
    </div>

    <div class="fd-table__body">
      <el-table
        ref="tableRef" :data="tableRows" :loading="isLoading" :row-key="rowKeyProp" v-bind="elTableProps"
        @selection-change="onSelectionChange" @row-contextmenu="onCellContextmenu"
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
          <el-table-column
            v-else-if="column.type === 'action'" :align="column.align || 'center'"
            :fixed="column.fixed || 'right'" :width="column.width || 200" v-bind="column"
          >
            <template #default="scope">
              <div class="fd-table__actions">
                <template v-for="(action, actionIndex) in resolveActions(scope, column.actions)" :key="actionIndex">
                  <template v-if="!isHidden(action, scope)">
                    <el-link
                      v-if="isBuiltinAction(action)" :type="getActionType(action)"
                      @click="handleBuiltinAction(action, scope)"
                    >
                      {{ action.text ?? crud.dict?.label?.[action.type!] ?? '操作' }}
                    </el-link>
                    <slot
                      v-else-if="getSlotName(action.component, scope)" :name="getSlotName(action.component, scope)!"
                      :row="scope.row" :column="scope.column" :row-index="scope.$index"
                    />
                    <component
                      :is="getComponentIs(action.component, scope)"
                      v-else-if="getComponentIs(action.component, scope)"
                      v-bind="getComponentProps(action.component, scope)"
                      :style="getComponentStyle(action.component, scope)"
                      v-on="getComponentEvents(action.component, scope)"
                    >
                      <template
                        v-for="(value, slotName) in getComponentSlots(action.component, scope)" :key="slotName"
                        #[slotName]
                      >
                        <component :is="value" />
                      </template>
                    </component>
                  </template>
                </template>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-else :prop="column.prop" :align="column.align || 'center'"
            :min-width="column.minWidth || 120" v-bind="column"
          >
            <template #header>
              <el-space :size="4" align="center">
                <span>{{ column.label }}</span>
                <el-tooltip v-if="column.help" :content="column.help">
                  <el-icon class="fd-table__help">
                    <operation />
                  </el-icon>
                </el-tooltip>
              </el-space>
            </template>

            <template #default="scope">
              <el-tag
                v-if="hasDict(column, scope)" size="small" :type="getDictType(column, scope)"
                :color="getDictColor(column, scope)"
              >
                {{ getDictLabel(column, scope) }}
              </el-tag>
              <slot
                v-else-if="getSlotName(column.component, scope)" :name="getSlotName(column.component, scope)!"
                :row="scope.row" :column="scope.column" :row-index="scope.$index"
              />
              <component
                :is="getComponentIs(column.component, scope)"
                v-else-if="getComponentIs(column.component, scope)" v-bind="getComponentProps(column.component, scope)"
                :style="getComponentStyle(column.component, scope)" v-on="getComponentEvents(column.component, scope)"
              >
                <template
                  v-for="(value, slotName) in getComponentSlots(column.component, scope)" :key="slotName"
                  #[slotName]
                >
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
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper" :current-page="paginationState.currentPage"
        :page-size="paginationState.pageSize" :total="paginationState.total" :page-sizes="paginationState.pageSizes"
        @current-change="onPageChange" @size-change="onPageSizeChange"
      />
    </div>
  </div>

  <!-- 右键菜单挂载到 body，避免被表格裁剪 -->
  <teleport to="body">
    <div
      v-if="contextMenuState.visible" class="fd-table__context-menu"
      :style="{ top: `${contextMenuState.y}px`, left: `${contextMenuState.x}px` }"
    >
      <el-button
        v-for="(item, index) in contextMenuState.items" :key="index" text size="small"
        @click="handleContextAction(item)"
      >
        {{ item.label }}
      </el-button>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import type { TableDict, TableScope, TableAction, TableColumn, TableOptions, TableComponent, TableUseOptions } from "./type"
import { clone } from "@fonds/utils"
import { merge } from "lodash-es"
import { useCore } from "@/hooks"
import { ElTable } from "element-plus"
import { isFunction } from "@/utils/check"
import { Setting, Operation, FullScreen } from "@element-plus/icons-vue"
import { ref, watch, computed, reactive, useAttrs, useSlots, onMounted, onBeforeUnmount } from "vue"

defineOptions({
  name: "fd-table",
  inheritAttrs: false,
})

// ---------------------------
// 基础上下文：插槽、属性、CRUD 核心
// ---------------------------
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
const attrsRecord = attrs as Record<string, any>

// ---------------------------
// 配置：表格/列配置、表格尺寸选项、分页信息
// ---------------------------
const tableOptions = reactive<TableOptions>({
  table: {
    border: true,
    stripe: false,
    size: "default",
    tools: true,
    rowKey: "id",
  },
  columns: [],
})

const tableSizeOptions = [
  { label: "紧凑", value: "small" },
  { label: "默认", value: "default" },
  { label: "偏大", value: "large" },
]

const paginationState = reactive({
  total: 0,
  pageSize: crud.getParams().size ?? 20,
  currentPage: crud.getParams().page ?? 1,
  pageSizes: [10, 20, 50, 100],
})

const columnVisibilityOptions = ref<{ id: string, label: string, show: boolean }[]>([])

// 自动同步列显示开关，保留用户勾选状态
watch(
  () => tableOptions.columns,
  (cols) => {
    columnVisibilityOptions.value = cols.map((column, index) => {
      const id = column.__id || column.prop || column.label || `col_${index}`
      const previous = columnVisibilityOptions.value.find(item => item.id === id)
      return {
        id,
        label: column.label || column.prop || id,
        show: previous?.show ?? true,
      }
    })
  },
  { deep: true },
)

// ---------------------------
// 衍生数据：加载状态、插槽列表、可见列、分页区间
// ---------------------------
const isLoading = computed(() => crud.loading)
const rowKeyProp = computed(() => (tableOptions.table.rowKey as string) || crud.dict?.primaryId || "id")
const shouldShowToolbar = computed(() => Boolean(slots.toolbar || tableOptions.table.tools))
const namedExtraSlots = computed(() => Object.keys(slots).filter(key => !["toolbar", "header", "default"].includes(key)))

const visibleColumns = computed(() => {
  const visibleFields = new Set(columnVisibilityOptions.value.filter(item => item.show).map(item => item.id))
  return tableOptions.columns.filter(column => visibleFields.has(column.__id || column.prop || column.label || ""))
})

const elTableProps = computed(() => {
  const { tools, fullscreen: _fullscreen, ...rest } = tableOptions.table
  return {
    highlightCurrentRow: true,
    headerCellClassName: "fd-table__header-cell",
    ...attrsRecord,
    ...rest,
  }
})

const paginationStart = computed(() => (paginationState.currentPage - 1) * paginationState.pageSize + 1)
const paginationEnd = computed(() => Math.min(paginationState.currentPage * paginationState.pageSize, paginationState.total))

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
  if (!payload || typeof payload !== "object")
    return
  const data = payload as { list?: any[], page?: number, count?: number, pageSize?: number }
  tableRows.value = Array.isArray(data.list) ? data.list : []
  paginationState.total = data.count ?? tableRows.value.length
  if (data.page)
    paginationState.currentPage = data.page
  if (data.pageSize)
    paginationState.pageSize = data.pageSize
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

/**
 * 由 fd-crud 主体注入的 use 方法，合并外部配置
 */
function use(useOptions: TableUseOptions) {
  merge(tableOptions, useOptions)
  if (useOptions.columns) {
    tableOptions.columns = useOptions.columns.map((column, index) => ({
      __id: column.prop || column.label || `col_${index}`,
      ...column,
    }))
    columnVisibilityOptions.value = tableOptions.columns.map(column => ({
      id: column.__id || column.prop || column.label || "",
      label: column.label || column.prop || "",
      show: true,
    }))
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
  if (!actions)
    return []
  if (typeof actions === "function")
    return actions(scope)
  return actions
}

function isBuiltinAction(action: TableAction) {
  return Boolean(action.type && ["detail", "update", "delete"].includes(action.type))
}

function getActionType(action: TableAction) {
  if (action.type === "delete")
    return "danger"
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
  if (typeof hidden === "function")
    return hidden(scope)
  return Boolean(hidden)
}

/**
 * 列辅助：若字段配置了字典，则展示成 tag
 */
function hasDict(column: TableColumn, scope: any) {
  const dict = resolveDict(column, scope)
  if (!dict)
    return false
  return Boolean(dict.find(item => item.value === scope.row[column.prop || ""]))
}

function resolveDict(column: TableColumn, scope: any): TableDict[] | undefined {
  const dictData = column.dict
  if (!dictData)
    return undefined
  return typeof dictData === "function" ? dictData(scope) : dictData
}

function getDictEntry(column: TableColumn, scope: any) {
  const dict = resolveDict(column, scope)
  if (!dict)
    return undefined
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
  if (typeof formatter === "function")
    return formatter(scope)
  if (prop)
    return scope.row[prop]
  return value ?? ""
}

function getComponentIs(component: TableComponent | undefined, scope: any) {
  if (!component)
    return undefined
  const value = component.is
  return isFunction(value) ? (value as (scope?: any) => any)(scope) : value
}

function getComponentProps(component: TableComponent | undefined, scope: any) {
  if (!component)
    return {}
  const value = component.props
  return isFunction(value) ? (value as (scope?: any) => any)(scope) : value ?? {}
}

function getComponentStyle(component: TableComponent | undefined, scope: any) {
  if (!component)
    return undefined
  const value = component.style
  return isFunction(value) ? (value as (scope?: any) => any)(scope) : value
}

function getComponentEvents(component: TableComponent | undefined, scope: any) {
  if (!component)
    return {}
  const value = component.on
  return isFunction(value) ? (value as (scope?: any) => any)(scope) : value ?? {}
}

function getComponentSlots(component: TableComponent | undefined, scope: any) {
  if (!component)
    return {}
  const value = component.slots
  return isFunction(value) ? (value as (scope?: any) => any)(scope) : value ?? {}
}

function getSlotName(component: TableComponent | undefined, scope: any) {
  if (!component)
    return undefined
  const value = component.slot
  return isFunction(value) ? (value as (scope?: any) => any)(scope) : value
}

/**
 * 直接替换表格数据，模板内部始终使用深拷贝副本
 */
function setData(rows: Record<string, any>[]) {
  tableRows.value = clone(rows)
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
function findRowsByKey(rowKey: string | number | Array<string | number>) {
  const keys = Array.isArray(rowKey) ? rowKey : [rowKey]
  return tableRows.value.filter(row => keys.includes(row[rowKeyProp.value]))
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
    const resolvedActions = resolveActions({ row, column, $index: 0 }, actionColumn.actions).filter(action => !isHidden(action, { row, column, $index: 0 }))
    contextMenuState.items = resolvedActions.map(action => ({
      label: action.text ?? crud.dict?.label?.[action.type ?? ""] ?? "操作",
      action: () => {
        if (action.type) {
          handleBuiltinAction(action, { row, column, $index: 0 })
        }
      },
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

  &__tool-trigger {
    display: inline-flex;
  }

  &__body {
    flex: 1;
    min-height: 0;
  }

  &__footer {
    gap: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__tips {
    color: var(--el-text-color-secondary);
    display: flex;
    font-size: 12px;
    flex-direction: column;
  }

  &__columns {
    gap: 6px;
    display: flex;
    flex-direction: column;
  }

  &__actions {
    gap: 8px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  &__help {
    cursor: help;
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
}
</style>
