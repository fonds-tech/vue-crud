/**
 * @fileoverview CRUD 操作逻辑模块
 * 包含 CrudBridge 定义和操作相关的逻辑函数
 */
import type { ContextMenuItem } from "./state"
import type { TableScope, TableAction, TableColumn, TableRecord } from "../type"

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
 */
export function isBuiltinAction(action: TableAction) {
  return Boolean(action.type && ["detail", "update", "delete"].includes(action.type))
}

/**
 * 获取给定操作的元素类型（颜色）
 */
export function getActionType(action: TableAction) {
  if (action.type === "delete") return "danger"
  return "primary"
}

/**
 * 处理内置操作的执行
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
 */
export function isHidden(item: TableAction<TableRecord> | TableColumn<TableRecord>, scope: TableScope<TableRecord>) {
  const hidden = item.hidden
  if (typeof hidden === "function") return hidden(scope)
  return Boolean(hidden)
}

/**
 * 构建表格行的上下文菜单项
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
