import type { VNode } from "vue"
import type { ColumnSetting } from "../core/state"
import type { DragMoveEvent, ColumnSettingsPanelProps } from "../core/settings"
import Draggable from "vuedraggable"
import IconTablerPinFilled from "~icons/tabler/pin-filled"
import { h } from "vue"
import { Setting } from "@element-plus/icons-vue"
import { ElIcon, ElButton, ElMessage, ElPopover, ElTooltip, ElCheckbox, ElScrollbar } from "element-plus"

/**
 * 渲染触发按钮（设置图标）
 */
function renderTriggerButton(): VNode {
  return (
    <span class="fd-table__tool-trigger">
      <ElTooltip content="列设置" placement="top">
        <div class="fd-table__tool-btn" role="button" tabindex={0}>
          <ElIcon>
            <Setting />
          </ElIcon>
        </div>
      </ElTooltip>
    </span>
  )
}

/**
 * 渲染面板头部（全选复选框 + 重置按钮）
 */
function renderPanelHeader(props: ColumnSettingsPanelProps): VNode {
  const { state } = props
  return (
    <div class="fd-table__column-header">
      <ElCheckbox
        modelValue={state.isAllChecked.value}
        indeterminate={state.isIndeterminate.value}
        label="全选"
        onChange={(val: unknown) => props.toggleAllColumns(Boolean(val))}
      />
      <ElButton link type="primary" onClick={() => props.resetColumns()}>
        重置
      </ElButton>
    </div>
  )
}

/**
 * 渲染单个列设置项
 */
function renderColumnItem(element: ColumnSetting, props: ColumnSettingsPanelProps): VNode {
  const itemClass = ["fd-table__column-item", { "is-locked": element.pinned, "is-disabled": !element.sort }]
  const dragClass = ["fd-table__drag", { "is-disabled": !element.sort }]

  return (
    <div class="fd-table__column-wrapper">
      <div class={itemClass}>
        {/* 拖拽手柄 */}
        <span class={dragClass} aria-hidden="true">
          ⋮⋮
        </span>
        {/* 显示/隐藏复选框 */}
        <ElCheckbox modelValue={element.show} onChange={(val: unknown) => props.onColumnShowChange(element.id, Boolean(val))} />
        {/* 列标签 */}
        <span class="fd-table__column-label">{element.label}</span>
        {/* 固定列操作按钮 */}
        <div class="fd-table__fixed-actions">
          <ElButton link size="small" class={{ "is-active": element.fixed === "left" }} onClick={() => props.toggleFixed(element.id, "left")}>
            <ElIcon class="fd-table__pin-icon fd-table__icon-rotate-left">
              <IconTablerPinFilled />
            </ElIcon>
          </ElButton>
          <ElButton link size="small" class={{ "is-active": element.fixed === "right" }} onClick={() => props.toggleFixed(element.id, "right")}>
            <ElIcon class="fd-table__pin-icon fd-table__icon-rotate-right">
              <IconTablerPinFilled />
            </ElIcon>
          </ElButton>
        </div>
      </div>
    </div>
  )
}

/**
 * 渲染可拖拽列表区域
 */
function renderDraggableList(props: ColumnSettingsPanelProps): VNode {
  const { state } = props
  // 注意：vuedraggable 的类型定义不完全支持 JSX，因此使用 h 函数
  return (
    <ElScrollbar class="fd-table__column-scroll">
      {h(
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
          item: ({ element }: { element: ColumnSetting }) => renderColumnItem(element, props),
        },
      )}
    </ElScrollbar>
  )
}

/**
 * 渲染面板底部（保存按钮）
 */
function renderPanelFooter(props: ColumnSettingsPanelProps): VNode {
  const handleSave = () => {
    props.saveColumns()
    ElMessage.success("保存成功")
  }

  return (
    <div class="fd-table__column-footer">
      <ElButton type="primary" class="fd-table__column-save" onClick={handleSave}>
        保存
      </ElButton>
    </div>
  )
}

/**
 * 渲染列设置面板主体内容
 */
function renderPanelContent(props: ColumnSettingsPanelProps): VNode {
  return (
    <div class="fd-table__column-panel">
      {renderPanelHeader(props)}
      {renderDraggableList(props)}
      {renderPanelFooter(props)}
    </div>
  )
}

/**
 * 列设置面板组件
 *
 * @description 提供表格列的显示/隐藏、排序、固定等配置功能
 */
export function ColumnSettings(props: ColumnSettingsPanelProps): VNode {
  return (
    <ElPopover width="220px" placement="bottom-start" trigger="click" teleported={false} hide-after={0} popperClass="fd-table__column-popover">
      {{
        reference: () => renderTriggerButton(),
        default: () => renderPanelContent(props),
      }}
    </ElPopover>
  )
}
