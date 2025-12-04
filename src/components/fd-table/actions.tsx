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
  // 支持 actions 既可为静态数组也可为动态函数，函数形态时可基于当前行上下文裁剪操作集合
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
  // 仅识别 CRUD 内置的三类动作，方便后续分支走统一处理逻辑
  return Boolean(action.type && ["detail", "update", "delete"].includes(action.type))
}

/**
 * 获取给定操作的元素类型（颜色）
 *
 * @param action - 要评估的操作
 * @returns Element Plus 类型字符串（删除为 'danger'，其他为 'primary'）
 */
export function getActionType(action: TableAction) {
  // Element Plus 的按钮颜色类型映射，删除操作使用危险色强调不可逆风险
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
  // 将动作分发到 CRUD 桥接接口，使用可选调用保障对应能力未注入时不报错
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
  // hidden 支持布尔或函数，函数形态可基于行数据做权限/状态级别的动态显隐
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
    // 当未定义操作列时仅暴露刷新入口，避免空菜单导致交互断层
    return [
      {
        label: "刷新",
        action: () => refresh(),
      },
    ]
  }

  const resolvedActions = resolveActions(scope, actionColumn.actions)
  // 仅保留内置动作且过滤掉被隐藏的项，避免上下文菜单出现无效/自定义项
  const menuActions = resolvedActions.filter(action => isBuiltinAction(action) && !isHidden(action, scope))
  const items: ContextMenuItem[] = menuActions.map(action => ({
    // 优先使用自定义文案，其次从字典获取，兜底为“操作”，保证菜单可读性
    label: action.text ?? crud.dict?.label?.[action.type ?? ""] ?? "操作",
    action: () => handleBuiltinAction(action, scope, crud),
  }))
  items.unshift({
    // 将刷新放到首位，强调这是常用快捷操作
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
    // 先做显隐过滤，隐藏项直接返回 null 占位，避免渲染不必要的节点
    if (isHidden(action, scope)) {
      return null
    }
    // 内置动作走统一的 Element Plus 链接按钮渲染，保持样式一致性并挂载对应处理函数
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
    // 若指定了插槽名称且父组件提供了对应插槽，优先使用插槽进行完全自定义渲染
    if (slotName && slots[slotName]) {
      return slots[slotName]!({
        row: scope.row,
        column: scope.column,
        rowIndex: scope.$index,
      })
    }
    const isValue = renderHelpers.getComponentIs(action.component, scope)
    if (isValue) {
      // 从配置中提取各 slot 内容并过滤掉 undefined，包装为函数以符合 Vue slot 约定
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
          // props/style/event 均通过 renderHelpers 基于行上下文动态获取，实现“配置化组件”
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
