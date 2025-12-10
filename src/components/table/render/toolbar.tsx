import type { TableSize } from "../core/state"
import type { Slots, VNodeChild } from "vue"
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
 * 渲染刷新按钮
 */
function renderRefreshButton(onRefresh: () => void) {
  return (
    <ElTooltip content="刷新" placement="top">
      <div class="fd-table__tool-btn" role="button" tabindex={0} onClick={() => onRefresh()}>
        <ElIcon>
          <RefreshIcon />
        </ElIcon>
      </div>
    </ElTooltip>
  )
}

/**
 * 渲染尺寸选择下拉菜单
 */
function renderSizeDropdown(props: ToolbarProps) {
  return (
    <ElDropdown trigger="click" onCommand={(size: TableSize) => props.onSizeChange(size)}>
      {{
        default: () => (
          <span class="fd-table__tool-trigger">
            <ElTooltip content="尺寸" placement="top">
              <div class="fd-table__tool-btn" role="button" tabindex={0}>
                <ElIcon>
                  <Operation />
                </ElIcon>
              </div>
            </ElTooltip>
          </span>
        ),
        dropdown: () => (
          <ElDropdownMenu>
            {props.sizeOptions.map(size => (
              <ElDropdownItem key={size.value} command={size.value} class={{ "is-active": size.value === props.currentSize }}>
                {size.label}
              </ElDropdownItem>
            ))}
          </ElDropdownMenu>
        ),
      }}
    </ElDropdown>
  )
}

/**
 * 渲染全屏按钮
 */
function renderFullscreenButton(onToggle: () => void) {
  return (
    <ElTooltip content="全屏" placement="top">
      <div class="fd-table__tool-btn" role="button" tabindex={0} onClick={() => onToggle()}>
        <ElIcon>
          <FullScreen />
        </ElIcon>
      </div>
    </ElTooltip>
  )
}

/**
 * 表格工具栏组件的渲染函数。
 * 根据 `show` 控制是否显示，同时提供刷新、尺寸切换、列设置与全屏等操作入口。
 *
 * @param {ToolbarProps} props - 工具栏组件的属性
 * @returns 返回渲染后的工具栏 VNode；未启用时返回 null
 */
export function TableToolbar(props: ToolbarProps) {
  // show 为 false 时直接返回 null，避免渲染空容器
  if (!props.show) return null

  // 工具区：左侧透传自定义 toolbar 插槽，右侧提供刷新/尺寸/列设置/全屏四个入口
  return (
    <div class="fd-table__toolbar">
      {props.slots.toolbar?.()}
      {props.toolsEnabled && (
        <div class="fd-table__tools">
          {renderRefreshButton(props.onRefresh)}
          {renderSizeDropdown(props)}
          {props.columnSettings}
          {renderFullscreenButton(props.onToggleFullscreen)}
        </div>
      )}
    </div>
  )
}
