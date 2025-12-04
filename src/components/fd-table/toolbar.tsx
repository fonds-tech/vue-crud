import type { TableSize } from "./state"
import type { Slots, VNodeChild } from "vue"
import { h } from "vue"
import { Operation, FullScreen, Refresh as RefreshIcon } from "@element-plus/icons-vue"
import { ElIcon, ElTooltip, ElDropdown, ElDropdownItem, ElDropdownMenu } from "element-plus"

/**
 * 表格工具栏的属性定义。
 * 用于控制工具栏显示、工具项配置以及交互回调。
 */
interface ToolbarProps {
  /** 是否显示工具栏 */
  show: boolean
  /** Vue 插槽对象 */
  slots: Slots
  /** 是否启用工具按钮 */
  toolsEnabled: boolean
  /** 表格尺寸选择的选项 */
  sizeOptions: Array<{ label: string, value: TableSize }>
  /** 当前表格尺寸 */
  currentSize: TableSize
  /** 刷新操作的回调 */
  onRefresh: () => void
  /** 尺寸更改操作的回调 */
  onSizeChange: (size: TableSize) => void
  /** 列设置的 VNode */
  columnSettings: VNodeChild
  /** 切换全屏模式的回调 */
  onToggleFullscreen: () => void
  /** 表格当前是否处于全屏模式 */
  isFullscreen: boolean
}

/**
 * 表格工具栏组件的渲染函数。
 * 根据 `show` 控制是否显示，同时提供刷新、尺寸切换、列设置与全屏等操作入口。
 *
 * @param {ToolbarProps} props - 工具栏组件的属性
 * @returns 返回渲染后的工具栏 VNode；未启用时返回 null
 */
export function TableToolbar(props: ToolbarProps) {
  if (!props.show) return null
  return h("div", { class: "fd-table__toolbar" }, [
    props.slots.toolbar?.(),
    props.toolsEnabled
      ? h("div", { class: "fd-table__tools" }, [
          h(
            ElTooltip,
            { content: "刷新", placement: "top" },
            () =>
              h(
                "div",
                { class: "fd-table__tool-btn", role: "button", tabindex: 0, onClick: () => props.onRefresh() },
                h(ElIcon, null, () => h(RefreshIcon)),
              ),
          ),
          h(
            ElDropdown,
            { trigger: "click", onCommand: (size: TableSize) => props.onSizeChange(size) },
            {
              default: () =>
                h(
                  "span",
                  { class: "fd-table__tool-trigger" },
                  h(
                    ElTooltip,
                    { content: "尺寸", placement: "top" },
                    () =>
                      h(
                        "div",
                        { class: "fd-table__tool-btn", role: "button", tabindex: 0 },
                        h(ElIcon, null, () => h(Operation)),
                      ),
                  ),
                ),
              dropdown: () =>
                h(
                  ElDropdownMenu,
                  null,
                  () =>
                    props.sizeOptions.map(size =>
                      h(
                        ElDropdownItem,
                        {
                          key: size.value,
                          command: size.value,
                          class: { "is-active": size.value === props.currentSize },
                        },
                        () => size.label,
                      ),
                    ),
                ),
            },
          ),
          props.columnSettings,
          h(
            ElTooltip,
            { content: "全屏", placement: "top" },
            () =>
              h(
                "div",
                { class: "fd-table__tool-btn", role: "button", tabindex: 0, onClick: () => props.onToggleFullscreen() },
                h(ElIcon, null, () => h(FullScreen)),
              ),
          ),
        ])
      : null,
  ])
}
