/**
 * @fileoverview 操作按钮渲染模块
 * 负责表格行操作按钮的 UI 渲染
 */
import type { Slots } from "vue"
import type { CrudBridge } from "../engine/actions"
import type { RenderHelpers } from "../engine/helpers"
import type { TableScope, TableAction, TableRecord } from "../type"
import { h } from "vue"
import { ElLink } from "element-plus"
import { normalizeEventProps } from "../engine/helpers"
import { isHidden, getActionType, isBuiltinAction, handleBuiltinAction } from "../engine/actions"

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

// 重新导出逻辑函数供外部使用
export { resolveActions } from "../engine/actions"
