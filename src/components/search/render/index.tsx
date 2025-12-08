import type { SearchEngine } from "../engine"
import type { Slots, VNodeChild } from "vue"
import FdForm from "../../form/form"
import FdGrid from "../../grid"
import { renderActions } from "./action"

/**
 * 搜索组件渲染上下文
 */
export interface SearchRenderContext {
  /** 搜索引擎 */
  engine: SearchEngine
  /** 组件插槽 */
  slots: Slots
}

/**
 * 渲染搜索组件
 * @param ctx 渲染上下文
 */
export function renderSearch(ctx: SearchRenderContext): VNodeChild {
  const { engine, slots } = ctx

  return (
    <div class="fd-search">
      <FdForm ref={engine.formRef} class="fd-search__form" v-slots={engine.formSlots.value} />
      {engine.resolvedActions.value.length > 0 && (
        <FdGrid class="fd-search__action" {...engine.actionGridProps.value}>
          {renderActions(engine, slots)}
        </FdGrid>
      )}
    </div>
  )
}

export { renderAction, renderActions } from "./action"
export { renderActionSlots, renderComponent, renderCustomSlots } from "./slots"
