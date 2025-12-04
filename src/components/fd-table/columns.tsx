import type { CrudBridge } from "./actions"
import type { Slots, VNode } from "vue"
import type { RenderHelpers } from "./render"
import type { TagProps, TableColumnCtx } from "element-plus"
import type { TableScope, TableColumn, TableRecord } from "./type"
import { h } from "vue"
import { QuestionFilled } from "@element-plus/icons-vue"
import { normalizeEventProps } from "./render"
import { resolveActions, renderActionButtons } from "./actions"
import { ElTag, ElIcon, ElSpace, ElTooltip, ElTableColumn } from "element-plus"

/**
 * 从列对象中移除 Element Plus 列组件不需要的特定属性
 *
 * @param column - 列配置对象
 * @returns 不包含特定属性的列对象
 */
function omitColumnProps(column: TableColumn<TableRecord>) {
  const { actions, component, slots, dict, value, show, sort, pinned, __id, help, ...rest } = column as Record<string, unknown>
  return rest
}

/**
 * 渲染表格列
 *
 * @param columns - 要渲染的表格列列表
 * @param renderHelpers - 渲染辅助函数
 * @param slots - Vue 插槽对象
 * @param crud - CRUD 桥接实例
 * @returns 代表表格列的 VNode 数组
 */
export function renderColumns(
  columns: TableColumn<TableRecord>[],
  renderHelpers: RenderHelpers<TableRecord>,
  slots: Slots,
  crud: CrudBridge,
) {
  return columns.map((column, index) => {
    const columnProps: Record<string, unknown> = { id: column.__id ?? column.prop ?? `col_${index}`, ...omitColumnProps(column) }
    if (column.type === "selection") {
      return h(ElTableColumn, { key: column.__id ?? index, type: "selection", ...columnProps })
    }
    if (column.type === "index") {
      return h(ElTableColumn, { key: column.__id ?? index, type: "index", ...columnProps })
    }
    if (column.type === "expand") {
      return h(
        ElTableColumn,
        { key: column.__id ?? index, type: "expand", ...columnProps },
        {
          default: (scope: TableScope<TableRecord>) => slots.expand?.(scope),
        },
      )
    }
    if (column.type === "action") {
      const width = column.width ?? 120
      const align = column.align ?? "center"
      return h(
        ElTableColumn,
        { key: column.__id ?? index, align, fixed: column.fixed ?? "right", width, ...columnProps },
        {
          default: (scope: TableScope<TableRecord>) => {
            const actions = resolveActions(scope, column.actions)
            const nodes = renderActionButtons(scope, actions, slots, renderHelpers, crud).filter(Boolean) as VNode[]
            return h("div", { class: "fd-table__actions" }, nodes)
          },
        },
      )
    }

    const headerComponent = renderHelpers.getHeaderComponent(column as TableColumn<TableRecord>)
    const align = column.align ?? "center"
    const minWidth = column.minWidth ?? 120
    const prop = column.prop

    return h(
      ElTableColumn,
      { key: column.__id ?? index, prop, align, minWidth, ...columnProps },
      {
        header: () => {
          if (headerComponent) {
            const scope: TableScope<TableRecord> = { column: column as unknown as TableColumnCtx<TableRecord>, row: {} as TableRecord, $index: -1 }
            const isValue = renderHelpers.getComponentIs(headerComponent, scope)
            const componentSlots = renderHelpers.getComponentSlots(headerComponent, scope)
            return isValue
              ? h(
                  isValue,
                  {
                    ...renderHelpers.getComponentProps(headerComponent, scope),
                    style: renderHelpers.getComponentStyle(headerComponent, scope),
                    ...normalizeEventProps(renderHelpers.getComponentEvents(headerComponent, scope)),
                  },
                  Object.fromEntries(
                    Object.entries(componentSlots)
                      .filter(([, value]) => value !== undefined)
                      .map(([slotKey, value]) => [
                        slotKey,
                        () => value,
                      ]),
                  ),
                )
              : null
          }
          return h(
            ElSpace,
            { size: 4, align: "center" },
            () => [
              h("span", null, column.label),
              column.help
                ? h(
                    ElTooltip,
                    { content: column.help, placement: "top" },
                    () =>
                      h(
                        "span",
                        { class: "fd-table__help" },
                        h(ElIcon, null, () => h(QuestionFilled)),
                      ),
                  )
                : null,
            ],
          )
        },
        default: (scope: TableScope<TableRecord>) => {
          if (renderHelpers.hasDict(column, scope)) {
            return h(
              ElTag,
              {
                size: "small",
                type: renderHelpers.getDictType(column, scope) as TagProps["type"],
                color: renderHelpers.getDictColor(column, scope),
              },
              () => renderHelpers.getDictLabel(column, scope),
            )
          }
          const slotName = renderHelpers.getSlotName(column.component, scope)
          if (slotName && slots[slotName]) {
            return slots[slotName]!({
              row: scope.row,
              column: scope.column,
              rowIndex: scope.$index,
            })
          }
          const isValue = renderHelpers.getComponentIs(column.component, scope)
          if (isValue) {
            const componentSlots = renderHelpers.getComponentSlots(column.component, scope)
            return h(
              isValue,
              {
                ...renderHelpers.getComponentProps(column.component, scope),
                style: renderHelpers.getComponentStyle(column.component, scope),
                ...normalizeEventProps(renderHelpers.getComponentEvents(column.component, scope)),
              },
              Object.fromEntries(
                Object.entries(componentSlots)
                  .filter(([, value]) => value !== undefined)
                  .map(([slotKey, value]) => [
                    slotKey,
                    () => value,
                  ]),
              ),
            )
          }
          return h("span", null, String(renderHelpers.formatCell(column, scope)))
        },
      },
    )
  })
}
