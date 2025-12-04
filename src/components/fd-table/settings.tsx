import type { VNode } from "vue"
import type { TableColumn, TableRecord } from "./type"
import type { TableState, ColumnSetting } from "./state"
import Draggable from "vuedraggable"
import { h } from "vue"
import { Setting } from "@element-plus/icons-vue"
import { ElIcon, ElButton, ElMessage, ElPopover, ElTooltip, ElCheckbox, ElScrollbar } from "element-plus"

/**
 * 拖动事件对象
 */
interface DragMoveEvent {
  draggedContext?: { element?: ColumnSetting }
  relatedContext?: { element?: ColumnSetting }
}

/**
 * 列设置面板组件的属性
 */
interface ColumnSettingsPanelProps {
  state: TableState
  onColumnShowChange: (id: string, value: boolean) => void
  toggleAllColumns: (value: boolean) => void
  onDragMove: (evt: DragMoveEvent) => boolean
  onDragEnd: () => void
  toggleFixed: (id: string, fixed: "left" | "right") => void
  resetColumns: () => void
  saveColumns: () => void
}

/**
 * 生成列的唯一 ID
 *
 * @param column - 表格列
 * @param index - 列的索引
 * @returns 生成的列 ID
 */
function getColumnId(column: TableColumn<TableRecord>, index: number) {
  return column.__id || column.prop || column.label || `col_${index}`
}

/**
 * 基于列 ID 生成版本字符串
 *
 * @param columns - 表格列列表
 * @returns 版本字符串
 */
function getVersion(columns: TableColumn<TableRecord>[]) {
  const ids = columns.map((column, index) => getColumnId(column, index))
  // 通过排序去重后的 id 串作为版本号，列增删时可使缓存失效
  return Array.from(new Set(ids)).sort().join("|")
}

/**
 * 从本地存储读取列设置
 *
 * @param cacheKey - 用于缓存的键
 * @param version - 预期的版本字符串
 * @returns 解析后的缓存对象或 undefined
 */
function readCache(cacheKey: string | undefined, version: string) {
  if (!cacheKey || typeof localStorage === "undefined") return undefined
  try {
    const raw = localStorage.getItem(cacheKey)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as {
      version: string
      order: string[]
      columns: Record<string, { show: boolean, pinned?: boolean, fixed?: "left" | "right" }>
    }
    // 缓存版本不匹配时丢弃，避免结构变化带来的脏数据
    if (parsed.version !== version) return undefined
    return parsed
  }
  catch {
    return undefined
  }
}

/**
 * 将当前列设置写入本地存储
 *
 * @param state - 表格状态
 */
export function writeCache(state: TableState) {
  if (!state.cacheKey.value || typeof localStorage === "undefined") return
  try {
    const version = getVersion(state.tableOptions.columns)
    // 仅记录可排序列的顺序，固定或禁止排序的列维持原位置
    const order = state.columnSettings.value
      .filter(item => item.sort)
      .sort((a, b) => a.order - b.order)
      .map(item => item.id)
    const columns = Object.fromEntries(
      state.columnSettings.value.map(item => [item.id, { show: item.show, pinned: item.pinned, fixed: item.fixed }]),
    )
    localStorage.setItem(state.cacheKey.value, JSON.stringify({ version, order, columns }))
  }
  catch {
    // 缓存失败不阻塞主流程
  }
}

/**
 * 基于表格选项和缓存重建列设置
 *
 * @param state - 表格状态
 * @param useCache - 是否使用缓存设置
 */
export function rebuildColumnSettings(state: TableState, useCache = true) {
  const version = getVersion(state.tableOptions.columns)
  const cache = useCache ? readCache(state.cacheKey.value, version) : undefined
  // 缓存中的 order 用于重建排序优先级
  const orderMap = new Map<string, number>()
  cache?.order?.forEach((id, idx) => orderMap.set(id, idx))

  const settings: ColumnSetting[] = state.tableOptions.columns.map((column, index) => {
    const id = getColumnId(column, index)
    const pinned = cache?.columns?.[id]?.pinned ?? column.pinned ?? false
    // 操作列/选择列禁止排序，避免被拖动改变固定列位置
    const isNonSortableType = column.type === "action" || column.type === "selection"
    const sort = !isNonSortableType && (column.sort ?? true) && !pinned
    // fixed 兼容多种输入：true 视为左固定，其余保持 undefined
    const rawFixed = cache?.columns?.[id]?.fixed ?? column.fixed
    const normalizedFixed: ColumnSetting["fixed"] = rawFixed === "left" || rawFixed === "right"
      ? rawFixed
      : rawFixed === true
        ? "left"
        : undefined
    // 默认固定策略：action 固定右侧，selection 固定左侧
    const fixed = normalizedFixed
      ?? (column.type === "action"
        ? "right"
        : column.type === "selection"
          ? "left"
          : undefined)
    // 排序优先使用缓存顺序，否则退回原始索引
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

  state.columnSettings.value = settings
  sortColumnSettings(state)
}

/**
 * 处理列可见性更改
 *
 * @param state - 表格状态
 * @param id - 列的 ID
 * @param value - 新的可见性值
 */
export function onColumnShowChange(state: TableState, id: string, value: boolean) {
  state.columnSettings.value = state.columnSettings.value.map(item => (item.id === id ? { ...item, show: value } : item))
}

/**
 * 切换所有列的可见性
 *
 * @param state - 表格状态
 * @param value - 所有列的新可见性值
 */
export function toggleAllColumns(state: TableState, value: boolean) {
  state.columnSettings.value = state.columnSettings.value.map(item => ({ ...item, show: value }))
}

/**
 * 基于固定状态和顺序对列设置进行排序
 *
 * @param state - 表格状态
 */
export function sortColumnSettings(state: TableState) {
  const rank = (fixed?: "left" | "right") => {
    if (fixed === "left") return 0
    if (fixed === "right") return 2
    return 1
  }
  // 排序规则：先按固定方向（左优先，右最后），再按 order；最终重置 order 为当前序
  state.columnSettings.value = [...state.columnSettings.value]
    .sort((a, b) => {
      const r = rank(a.fixed) - rank(b.fixed)
      if (r !== 0) return r
      return a.order - b.order
    })
    .map((item, idx) => ({ ...item, order: idx }))
}

/**
 * 从数组索引同步列设置的顺序属性
 *
 * @param state - 表格状态
 */
export function syncOrderFromList(state: TableState) {
  state.columnSettings.value = state.columnSettings.value.map((item, index) => ({
    ...item,
    order: index,
  }))
}

/**
 * 处理拖动结束操作
 *
 * @param state - 表格状态
 */
export function onDragEnd(state: TableState) {
  syncOrderFromList(state)
  sortColumnSettings(state)
}

/**
 * 处理拖动过程中的移动事件
 *
 * @param evt - 拖动移动事件
 * @returns 如果允许移动则返回 true，否则返回 false
 */
export function onDragMove(evt: DragMoveEvent) {
  const dragged = evt?.draggedContext?.element
  const related = evt?.relatedContext?.element
  // 禁止拖动不可排序或已固定的列，也禁止跨 fixed 分组交换
  if (!dragged || !dragged.sort) return false
  if (dragged.pinned || related?.pinned) return false
  if (dragged.fixed !== related?.fixed) return false
  return true
}

/**
 * 切换列的固定状态
 *
 * @param state - 表格状态
 * @param id - 列的 ID
 * @param fixed - 要切换的固定位置
 */
export function toggleFixed(state: TableState, id: string, fixed: "left" | "right") {
  state.columnSettings.value = state.columnSettings.value.map((item) => {
    if (item.id !== id) return item
    const nextFixed = item.fixed === fixed ? undefined : fixed
    return {
      ...item,
      fixed: nextFixed,
      sort: (item.sort ?? true) && !item.pinned,
    }
  })
  sortColumnSettings(state)
}

/**
 * 将列设置重置为默认状态
 *
 * @param state - 表格状态
 */
export function resetColumns(state: TableState) {
  if (state.cacheKey.value && typeof localStorage !== "undefined") {
    localStorage.removeItem(state.cacheKey.value)
  }
  rebuildColumnSettings(state, false)
}

/**
 * 保存当前列设置
 *
 * @param state - 表格状态
 * @param emit - 通知父组件的 emit 函数
 */
export function saveColumns(state: TableState, emit: (columns: TableColumn<TableRecord>[]) => void) {
  writeCache(state)
  emit(state.visibleColumns.value)
  ElMessage.success("保存成功")
}

/**
 * 渲染列设置面板
 *
 * @param props - 面板的属性
 * @returns 代表列设置面板的 VNode
 */
export function ColumnSettingsPanel(props: ColumnSettingsPanelProps): VNode {
  const { state } = props
  // 整体使用 Popover 包裹，触发器为“列设置”按钮，内容包含选择、拖拽、固定、保存等操作
  return h(
    ElPopover,
    {
      "width": "220px",
      "placement": "bottom-start",
      "trigger": "click",
      "teleported": false,
      "hide-after": 0,
      "popperClass": "fd-table__column-popover",
    },
    {
      reference: () =>
        h(
          "span",
          { class: "fd-table__tool-trigger" },
          h(
            ElTooltip,
            { content: "列设置", placement: "top" },
            {
              default: () =>
                h(
                  "div",
                  { class: "fd-table__tool-btn", role: "button", tabindex: 0 },
                  h(ElIcon, null, () => h(Setting)),
                ),
            },
          ),
        ),
      default: () =>
        h("div", { class: "fd-table__column-panel" }, [
          h("div", { class: "fd-table__column-header" }, [
            h(ElCheckbox, {
              modelValue: state.isAllChecked.value,
              indeterminate: state.isIndeterminate.value,
              label: "全选",
              onChange: (val: unknown) => props.toggleAllColumns(Boolean(val)),
            }),
            h(ElButton, { link: true, type: "primary", onClick: () => props.resetColumns() }, () => "重置"),
          ]),
          h(
            ElScrollbar,
            { class: "fd-table__column-scroll" },
            () =>
              h(
                Draggable,
                {
                  "modelValue": state.columnSettings.value,
                  "item-key": "id",
                  "animation": 180,
                  "ghost-class": "fd-table__drag-ghost",
                  "chosen-class": "fd-table__drag-chosen",
                  "move": (evt: DragMoveEvent) => props.onDragMove(evt),
                  "onUpdate:modelValue": (val: ColumnSetting[]) => {
                    state.columnSettings.value = val
                  },
                  "onEnd": () => props.onDragEnd(),
                },
                {
                  item: ({ element }: { element: ColumnSetting }) =>
                    h("div", { class: "fd-table__column-wrapper" }, [
                      h(
                        "div",
                        {
                          class: [
                            "fd-table__column-item",
                            {
                              "is-locked": element.pinned,
                              "is-disabled": !element.sort,
                            },
                          ],
                        },
                        [
                          h("span", { "class": ["fd-table__drag", { "is-disabled": !element.sort }], "aria-hidden": "true" }, "⋮⋮"),
                          h(ElCheckbox, {
                            modelValue: element.show,
                            onChange: (val: unknown) => props.onColumnShowChange(element.id, Boolean(val)),
                          }),
                          h("span", { class: "fd-table__column-label" }, element.label),
                          h("div", { class: "fd-table__fixed-actions" }, [
                            h(
                              ElButton,
                              {
                                link: true,
                                size: "small",
                                class: { "is-active": element.fixed === "left" },
                                onClick: () => props.toggleFixed(element.id, "left"),
                              },
                              () => h("span", { class: "fd-table__pin-icon fd-table__icon-rotate-left" }, element.fixed === "left" ? "L" : "↢"),
                            ),
                            h(
                              ElButton,
                              {
                                link: true,
                                size: "small",
                                class: { "is-active": element.fixed === "right" },
                                onClick: () => props.toggleFixed(element.id, "right"),
                              },
                              () => h("span", { class: "fd-table__pin-icon fd-table__icon-rotate-right" }, element.fixed === "right" ? "R" : "↣"),
                            ),
                          ]),
                        ],
                      ),
                    ]),
                },
              ),
          ),
          h("div", { class: "fd-table__column-footer" }, [
            h(ElButton, { type: "primary", class: "fd-table__column-save", onClick: () => props.saveColumns() }, () => "保存"),
          ]),
        ]),
    },
  )
}
