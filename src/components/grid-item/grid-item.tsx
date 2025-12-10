import type { CSSProperties } from "vue"
import type { FdGridItemProps } from "./interface"
import type { GridCollector, GridContextState } from "../grid/interface"
import { fdGridItemProps } from "./props"
import { GRID_CONTEXT_KEY, GRID_COLLECTOR_KEY } from "../grid/interface"
import { resolveItemData, resolveResponsiveValue } from "../grid/utils"
import { inject, computed, watchEffect, defineComponent, onBeforeUnmount } from "vue"

/**
 * FdGridItem 栅格子项
 * @description 支持响应式跨度与偏移，并能感知容器折叠状态。
 */
export default defineComponent<FdGridItemProps>({
  name: "fd-grid-item",
  inheritAttrs: false,
  props: fdGridItemProps,
  setup(props, { slots, attrs }) {
    const grid = inject<GridContextState | undefined>(GRID_CONTEXT_KEY, undefined)
    const collector = inject<GridCollector | undefined>(GRID_COLLECTOR_KEY, undefined)
    const index = collector?.registerItem() ?? -1

    const span = computed(() => resolveResponsiveValue(props.span, grid?.viewportWidth.value, 1))
    const offset = computed(() => resolveResponsiveValue(props.offset, grid?.viewportWidth.value, 0))
    const itemData = computed(() =>
      resolveItemData(grid?.cols.value ?? 1, {
        span: span.value,
        offset: offset.value,
        suffix: props.suffix,
      }),
    )

    const className = computed(() => {
      const extra = (attrs as Record<string, any>).class
      return ["fd-grid-item", extra].filter(Boolean)
    })

    const visible = computed(() => {
      if (!grid) return true
      return grid.displayIndexList.value.includes(index)
    })

    const offsetStyle = computed<CSSProperties>(() => {
      const data = itemData.value
      const gap = grid?.colGap.value ?? 0
      if (data.offset > 0) {
        const oneSpan = `(100% - ${gap * (data.span - 1)}px) / ${data.span}`
        return {
          marginLeft: `calc((${oneSpan} * ${data.offset}) + ${gap * data.offset}px)`,
        }
      }
      return {}
    })

    const baseStyle = computed<CSSProperties>(() => {
      const data = itemData.value
      const style: CSSProperties = {
        gridColumn: `span ${data.span}`,
        ...offsetStyle.value,
      }
      if (!visible.value || data.span === 0) style.display = "none"
      return style
    })

    const passThroughAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs as Record<string, any>
      return rest
    })

    const finalStyle = computed(() => {
      const extraStyle = (attrs as Record<string, any>).style as CSSProperties | undefined
      if (!extraStyle) return baseStyle.value
      return [baseStyle.value, extraStyle]
    })

    const overflow = computed(() => grid?.overflow.value ?? false)

    watchEffect(() => {
      if (!collector || index === -1) return
      collector.collectItemData(index, itemData.value)
    })

    onBeforeUnmount(() => {
      if (!collector || index === -1) return
      collector.removeItemData(index)
    })

    return () => (
      <div class={className.value} style={finalStyle.value} {...passThroughAttrs.value}>
        {slots.default?.({ overflow: overflow.value })}
      </div>
    )
  },
})
