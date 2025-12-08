import type { Slots, VNodeChild } from "vue"
import type { SearchCore, SearchAction } from "../interface"
import FdGridItem from "../../grid-item"
import { ElIcon, ElButton } from "element-plus"
import { renderComponent, renderActionSlots } from "./slots"
import { Search as IconSearch, ArrowUp as IconArrowUp, Loading as IconLoading, Refresh as IconRefresh, ArrowDown as IconArrowDown } from "@element-plus/icons-vue"

/**
 * 渲染单个动作按钮
 * @param engine 搜索引擎
 * @param action 动作配置
 * @param index 动作索引
 * @param slots 组件插槽
 */
export function renderAction(
  engine: SearchCore,
  action: SearchAction,
  index: number,
  slots: Slots,
): VNodeChild {
  const actionSlot = renderActionSlots(engine, action, slots)
  const { collapsed, collapseLabel, crud, loading } = engine

  return (
    <FdGridItem key={index} class="fd-search__action-item" {...engine.getActionItemProps(action)}>
      {action.type === "search" && (
        <ElButton type="primary" disabled={loading.value} onClick={() => engine.search()}>
          <ElIcon class={["fd-search__icon", { "is-loading": loading.value }]}>
            {loading.value ? <IconLoading /> : <IconSearch />}
          </ElIcon>
          <span>{action.text || crud.dict?.label?.search || "搜索"}</span>
        </ElButton>
      )}

      {action.type === "reset" && (
        <ElButton onClick={() => engine.reset()}>
          <ElIcon class="fd-search__icon">
            <IconRefresh />
          </ElIcon>
          <span>{action.text || crud.dict?.label?.reset || "重置"}</span>
        </ElButton>
      )}

      {action.type === "collapse" && (
        <ElButton onClick={() => engine.collapse()}>
          <ElIcon class="fd-search__icon">
            {!collapsed.value ? <IconArrowUp /> : <IconArrowDown />}
          </ElIcon>
          <span>{collapseLabel.value}</span>
        </ElButton>
      )}

      {!action.type && actionSlot}

      {!action.type && !actionSlot && renderComponent(engine, action)}
    </FdGridItem>
  )
}

/**
 * 渲染动作按钮组
 * @param engine 搜索引擎
 * @param slots 组件插槽
 */
export function renderActions(engine: SearchCore, slots: Slots): VNodeChild[] {
  return engine.resolvedActions.value.map((action, index) =>
    renderAction(engine, action, index, slots),
  )
}
