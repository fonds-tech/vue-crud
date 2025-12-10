import type { CrudBridge } from "../core/actions"
import type { Slots, VNode } from "vue"
import type { RenderHelpers } from "../core/helpers"
import type { TagProps, TableColumnCtx } from "element-plus"
import type { TableScope, TableColumn, TableRecord } from "../interface"
import { h } from "vue"
import { resolveActions } from "../core/actions"
import { QuestionFilled } from "@element-plus/icons-vue"
import { renderActionButtons } from "./actions"
import { ElTag, ElIcon, ElSpace, ElTooltip, ElTableColumn } from "element-plus"

/**
 * 从列对象中移除 Element Plus 列组件不需要的特定属性
 *
 * @param column - 列配置对象
 * @returns 不包含特定属性的列对象
 */
function omitColumnProps(column: TableColumn<TableRecord>) {
  // 通过解构剔除仅内部使用的配置字段，避免传递到 Element Plus 列组件造成未知属性告警
  const { actions, component, slots, dict, value, show, sort, pinned, __id, help, ...rest } = column as Record<string, unknown>
  return rest
}

/** 操作列默认宽度 */
const ACTION_COLUMN_WIDTH = 120
/** 普通列默认最小宽度 */
const COLUMN_MIN_WIDTH = 120

/**
 * 渲染表格列
 *
 * @param columns - 要渲染的表格列列表
 * @param renderHelpers - 渲染辅助函数
 * @param slots - Vue 插槽对象
 * @param crud - CRUD 桥接实例
 * @returns 代表表格列的 VNode 数组
 */
export function renderColumns(columns: TableColumn<TableRecord>[], renderHelpers: RenderHelpers<TableRecord>, slots: Slots, crud: CrudBridge) {
  return columns.map((column, index) => {
    // 为列生成稳定 id 以配合虚拟 DOM diff，同时仅透传 Element Plus 接受的列属性
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
      // 操作列采用默认宽度与居中对齐，并固定在右侧保证可见性
      const width = column.width ?? ACTION_COLUMN_WIDTH
      const align = column.align ?? "center"
      return h(
        ElTableColumn,
        { key: column.__id ?? index, align, fixed: column.fixed ?? "right", width, ...columnProps },
        {
          default: (scope: TableScope<TableRecord>) => {
            // 将 actions 配置解析为当前行可用的动作按钮，并过滤空节点避免渲染空占位
            const actions = resolveActions(scope, column.actions)
            const nodes = renderActionButtons(scope, actions, slots, renderHelpers, crud).filter(Boolean) as VNode[]
            return h("div", { class: "fd-table__actions" }, nodes)
          },
        },
      )
    }

    const headerComponent = renderHelpers.getHeaderComponent(column as TableColumn<TableRecord>)
    const align = column.align ?? "center"
    const minWidth = column.minWidth ?? COLUMN_MIN_WIDTH
    const prop = column.prop

    return h(
      ElTableColumn,
      { key: column.__id ?? index, prop, align, minWidth, ...columnProps },
      {
        header: () => {
          if (headerComponent) {
            // 表头使用虚拟 scope 仅携带列上下文（$index 设为 -1 表示非数据行），为动态组件提供统一取值入口
            const scope: TableScope<TableRecord> = { column: column as unknown as TableColumnCtx<TableRecord>, row: {} as TableRecord, $index: -1 }
            const isValue = renderHelpers.getComponentIs(headerComponent, scope)
            const componentSlots = renderHelpers.getComponentSlots(headerComponent, scope)
            return isValue
              ? h(
                  isValue,
                  {
                    ...renderHelpers.getComponentProps(headerComponent, scope),
                    style: renderHelpers.getComponentStyle(headerComponent, scope),
                    ...renderHelpers.getComponentEvents(headerComponent, scope),
                  },
                  Object.fromEntries(
                    // 将配置化的 slot 映射为 VNode 插槽函数，并剔除未定义的槽避免无效渲染
                    Object.entries(componentSlots)
                      .filter(([, value]) => value !== undefined)
                      .map(([slotKey, value]) => [slotKey, () => value]),
                  ),
                )
              : null
          }
          return h(ElSpace, { size: 4, alignment: "center" }, () => [
            h("span", null, column.label),
            column.help
              ? h(ElTooltip, { content: column.help, placement: "top" }, () =>
                  h(
                    "span",
                    { class: "fd-table__help" },
                    h(ElIcon, null, () => h(QuestionFilled)),
                  ))
              : null,
          ])
        },
        default: (scope: TableScope<TableRecord>) => {
          if (renderHelpers.hasDict(column, scope)) {
            // 若列绑定数据字典，优先使用标签形式呈现，颜色与类型由字典配置驱动
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
            // 如存在外部具名插槽，直接委托渲染以便调用方完全接管单元格内容
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
                // 动态组件渲染：统一收集 props、样式与事件，并规范事件命名以匹配 Vue onX 格式
                ...renderHelpers.getComponentProps(column.component, scope),
                style: renderHelpers.getComponentStyle(column.component, scope),
                ...renderHelpers.getComponentEvents(column.component, scope),
              },
              Object.fromEntries(
                Object.entries(componentSlots)
                  .filter(([, value]) => value !== undefined)
                  .map(([slotKey, value]) => [slotKey, () => value]),
              ),
            )
          }
          // 最终兜底：无自定义组件或插槽时使用格式化后的文本输出，保证单元格有内容可展示
          return h("span", null, String(renderHelpers.formatCell(column, scope)))
        },
      },
    )
  })
}
