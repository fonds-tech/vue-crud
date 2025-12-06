import type { CSSProperties } from "vue"
import type { GridProps, GridItemData, GridCollector } from "./types"
import { GRID_CONTEXT_KEY, GRID_COLLECTOR_KEY } from "./types"
import { calculateDisplayInfo, resolveResponsiveValue } from "./utils"
import { ref, provide, computed, reactive, onMounted, defineComponent, onBeforeUnmount } from "vue"

/**
 * FdGrid 栅格容器
 * @description 使用 CSS Grid 实现自适应列数与间距，支持折叠展示。
 */
export default defineComponent<GridProps>({
  name: "fd-grid",
  inheritAttrs: false,
  props: {
    cols: {
      type: [Number, Object],
      default: 24,
    },
    rowGap: {
      type: [Number, Object],
      default: 0,
    },
    colGap: {
      type: [Number, Object],
      default: 0,
    },
    collapsed: {
      type: Boolean,
      default: false,
    },
    collapsedRows: {
      type: Number,
      default: 1,
    },
  },
  setup(props, { slots, attrs }) {
    // 响应式状态
    const viewportWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1920)

    // computed
    const cols = computed(() => Math.max(1, resolveResponsiveValue(props.cols, viewportWidth.value, 24)))
    const colGap = computed(() => Math.max(0, resolveResponsiveValue(props.colGap, viewportWidth.value, 0)))
    const rowGap = computed(() => Math.max(0, resolveResponsiveValue(props.rowGap, viewportWidth.value, 0)))

    const itemDataMap = reactive(new Map<number, GridItemData>())
    const itemList = computed(() => Array.from(itemDataMap.entries()).sort((a, b) => a[0] - b[0]).map(([, data]) => data))
    const displayInfo = computed(() =>
      calculateDisplayInfo({
        cols: cols.value,
        collapsed: props.collapsed ?? false,
        collapsedRows: props.collapsedRows ?? 1,
        items: itemList.value,
      }),
    )

    const className = computed(() => {
      const extra = (attrs as Record<string, any>).class
      return ["fd-grid", props.collapsed ? "is-collapsed" : undefined, extra].filter(Boolean)
    })

    const baseStyle = computed<CSSProperties>(() => ({
      gridTemplateColumns: `repeat(${cols.value}, minmax(0px, 1fr))`,
      columnGap: `${colGap.value}px`,
      rowGap: `${rowGap.value}px`,
    }))

    // 上下文：供子项获取列数、可见性、视口宽度
    provide(GRID_CONTEXT_KEY, {
      cols,
      colGap,
      displayIndexList: computed(() => displayInfo.value.displayIndexList),
      overflow: computed(() => displayInfo.value.overflow),
      viewportWidth,
    })

    // 收集器：子项注册与更新自身布局数据
    let seed = 0
    const collector: GridCollector = {
      registerItem() {
        return seed++
      },
      collectItemData(index, data) {
        itemDataMap.set(index, data)
      },
      removeItemData(index) {
        itemDataMap.delete(index)
      },
    }
    provide(GRID_COLLECTOR_KEY, collector)

    const passThroughAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs as Record<string, any>
      return rest
    })

    // 方法
    const handleResize = () => {
      if (typeof window !== "undefined")
        viewportWidth.value = window.innerWidth
    }

    // 生命周期
    onMounted(() => {
      if (typeof window !== "undefined")
        window.addEventListener("resize", handleResize)
    })

    onBeforeUnmount(() => {
      if (typeof window !== "undefined")
        window.removeEventListener("resize", handleResize)
    })

    return () => (
      <div
        class={className.value}
        style={[baseStyle.value, attrs.style as CSSProperties]}
        {...passThroughAttrs.value}
      >
        {slots.default?.()}
      </div>
    )
  },
})
