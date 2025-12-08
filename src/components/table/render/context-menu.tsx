/**
 * @fileoverview 表格渲染层 - 右键菜单渲染
 */
import type { TableCore } from "../core"
import { h, Teleport } from "vue"

/**
 * 渲染右键上下文菜单
 * @param engine - 表格引擎实例
 * @returns 右键菜单的 VNode
 */
export function renderContextMenu(engine: TableCore) {
  const { state, handlers } = engine

  return h(
    Teleport,
    { to: "body" },
    {
      default: () =>
        state.contextMenuState.visible
          ? h(
              "div",
              {
                class: "fd-table__context-menu",
                style: { top: `${state.contextMenuState.y}px`, left: `${state.contextMenuState.x}px` },
              },
              state.contextMenuState.items.map((item, index) =>
                h(
                  "div",
                  {
                    key: index,
                    class: "fd-table__context-menu-item",
                    onClick: () => handlers.handleContextAction(item),
                  },
                  item.label,
                ),
              ),
            )
          : null,
    },
  )
}
