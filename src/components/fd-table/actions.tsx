import type { Slots } from "vue"
import type { RenderHelpers } from "./render"
import type { ContextMenuItem } from "./state"
import type { TableScope, TableAction, TableColumn, TableRecord } from "./type"
import { h } from "vue"
import { ElLink } from "element-plus"
import { normalizeEventProps } from "./render"

/**
 * 定义 CRUD 操作桥接的接口
 */
export interface CrudBridge {
  /** 刷新数据的方法 */
  refresh: (params?: Record<string, unknown>) => void
  /** 查看行详情的方法 */
  rowInfo?: (row: TableRecord) => void
  /** 编辑行的方法 */
  rowEdit?: (row: TableRecord) => void
  /** 删除行的方法 */
  rowDelete?: (row: TableRecord) => void
  /** 标签和键的字典 */
  dict?: { label?: Record<string, string | undefined>, primaryId?: string }
}

/**
 * 解析给定表格作用域的操作
 *
 * @param scope - 当前表格作用域（行、列、索引）
 * @param actions - 要解析的操作，可以是数组或返回数组的函数
 * @returns 解析后的表格操作数组
 */
export function resolveActions(
  scope: TableScope<TableRecord>,
  actions?: TableAction<TableRecord>[] | ((scope: TableScope<TableRecord>) => TableAction<TableRecord>[]),
): TableAction<TableRecord>[] {
  if (!actions) return []
  if (typeof actions === "function") return actions(scope)
  return actions
}

/**
 * 检查操作是否为内置操作（详情、更新、删除）
 *
 * @param action - 要检查的操作
 * @returns 如果是内置操作则返回 true，否则返回 false
 */
export function isBuiltinAction(action: TableAction) {
  return Boolean(action.type && ["detail", "update", "delete"].includes(action.type))
}

/**
 * 获取给定操作的元素类型（颜色）
 *
 * @param action - 要评估的操作
 * @returns Element Plus 类型字符串（删除为 'danger'，其他为 'primary'）
 */
export function getActionType(action: TableAction) {
  if (action.type === "delete") return "danger"
  return "primary"
}

/**
 * 处理内置操作的执行
 *
 * @param action - 要执行的操作
 * @param scope - 触发操作的作用域
 * @param crud - 包含处理方法的 CRUD 桥接实例
 */
export function handleBuiltinAction(action: TableAction<TableRecord>, scope: TableScope<TableRecord>, crud: CrudBridge) {
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

/**
 * 判断操作或列是否应隐藏
 *
 * @param item - 要检查的项目
 * @param scope - 当前作用域
 * @returns 如果项目应隐藏则返回 true，否则返回 false
 */
export function isHidden(item: TableAction<TableRecord> | TableColumn<TableRecord>, scope: TableScope<TableRecord>) {
  const hidden = item.hidden
  if (typeof hidden === "function") return hidden(scope)
  return Boolean(hidden)
}

/**
 * 构建表格行的上下文菜单项
 *
 * @param scope - 行的作用域
 * @param columns - 表格列列表
 * @param crud - CRUD 桥接实例
 * @param refresh - 刷新函数
 * @returns 上下文菜单项数组
 */
export function buildContextMenuItems(
  scope: TableScope<TableRecord>,
  columns: TableColumn<TableRecord>[],
  crud: CrudBridge,
  refresh: (params?: Record<string, unknown>) => void,
): ContextMenuItem[] {
  const actionColumn = columns.find(item => item.type === "action")
  if (!actionColumn) {
    return [
      {
        label: "刷新",
        action: () => refresh(),
      },
    ]
  }

  const resolvedActions = resolveActions(scope, actionColumn.actions)
  const menuActions = resolvedActions.filter(action => isBuiltinAction(action) && !isHidden(action, scope))
  const items: ContextMenuItem[] = menuActions.map(action => ({
    label: action.text ?? crud.dict?.label?.[action.type ?? ""] ?? "操作",
    action: () => handleBuiltinAction(action, scope, crud),
  }))
  items.unshift({
    label: "刷新",
    action: () => refresh(),
  })
  return items
}

/**
 * 渲染表格行的操作按钮
 *
 * @param scope - 行的作用域
 * @param actions - 要渲染的操作列表
 * @param slots - Vue 插槽对象
 * @param renderHelpers - 渲染辅助函数
 * @param crud - CRUD 桥接实例
 * @returns 代表操作按钮的 VNode 数组
 */
export function renderActionButtons(
  scope: TableScope<TableRecord>,
  actions: TableAction<TableRecord>[],
  slots: Slots,
  renderHelpers: RenderHelpers<TableRecord>,
  crud: CrudBridge,
) {
  return actions.map((action, actionIndex) => {
    if (isHidden(action, scope)) {
      return null
    }
    if (isBuiltinAction(action)) {
      return h(
        ElLink,
        {
          key: actionIndex,
          type: getActionType(action),
          onClick: () => handleBuiltinAction(action, scope, crud),
        },
        () => action.text ?? crud.dict?.label?.[action.type ?? ""] ?? "操作",
      )
    }
    const slotName = renderHelpers.getSlotName(action.component, scope)
    if (slotName && slots[slotName]) {
      return slots[slotName]!({
        row: scope.row,
        column: scope.column,
        rowIndex: scope.$index,
      })
    }
    const isValue = renderHelpers.getComponentIs(action.component, scope)
    if (isValue) {
      const componentSlots = renderHelpers.getComponentSlots(action.component, scope)
      const normalizedSlots = Object.fromEntries(
        Object.entries(componentSlots)
          .filter(([, value]) => value !== undefined)
          .map(([slotKey, value]) => [slotKey, () => value]),
      )
      return h(
        isValue,
        {
          key: actionIndex,
          ...renderHelpers.getComponentProps(action.component, scope),
          style: renderHelpers.getComponentStyle(action.component, scope),
          ...normalizeEventProps(renderHelpers.getComponentEvents(action.component, scope)),
        },
        normalizedSlots,
      )
    }
    return null
  })
}
