<template>
  <div ref="rootRef" class="fd-grid" :style="gridStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from "vue"
import type { GridProps, GridContext, GridItemState } from "./type"
import { gridInjectionKey } from "./type"
import { clampValue, resolveResponsiveValue } from "./utils"
import { ref, provide, computed, onMounted, shallowRef, onBeforeUnmount } from "vue"

defineOptions({
  name: "fd-grid",
})

const props = withDefaults(defineProps<GridProps>(), {
  cols: 24,
  rowGap: 0,
  colGap: 0,
  collapsed: false,
  collapsedRows: 1,
})

const rootRef = ref<HTMLElement | null>(null)
const viewportWidth = ref(1920)
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  // 初始宽度
  if (rootRef.value) {
    viewportWidth.value = rootRef.value.clientWidth
  }

  if (typeof ResizeObserver !== "undefined" && rootRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width
        // 简单的防抖或直接设置，这里直接设置
        viewportWidth.value = width
      }
    })
    resizeObserver.observe(rootRef.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})

const items = shallowRef<GridItemState[]>([])

const resolvedCols = computed(() => clampValue(resolveResponsiveValue(props.cols, viewportWidth.value, 24), 1, 60))
const resolvedRowGap = computed(() => Math.max(0, resolveResponsiveValue(props.rowGap, viewportWidth.value, 0)))
const resolvedColGap = computed(() => Math.max(0, resolveResponsiveValue(props.colGap, viewportWidth.value, 0)))
const resolvedCollapsed = computed(() => props.collapsed)
const resolvedCollapsedRows = computed(() => Math.max(1, props.collapsedRows))

// 基于 DOM 位置排序后的 items
const sortedItems = computed(() => {
  const list = [...items.value]
  if (list.every(item => item.el)) {
    return list.sort((a, b) => {
      if (!a.el || !b.el) return 0
      // compareDocumentPosition 返回值掩码：4 表示 b 在 a 后面 (FOLLOWING)
      const position = a.el.compareDocumentPosition(b.el)
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1
      return 0
    })
  }
  return list
})

const visibilityState = computed(() => {
  const map = new Map<symbol, boolean>()
  const displayIds = new Set<symbol>()
  const colsValue = resolvedCols.value
  const collapsed = resolvedCollapsed.value
  const collapsedRowsValue = resolvedCollapsedRows.value

  // 使用排序后的列表进行计算
  const effectiveItems = sortedItems.value.map((item) => {
    const span = clampValue(item.span.value, 1, colsValue)
    const offset = clampValue(item.offset.value, 0, Math.max(colsValue - 1, 0))
    // Offset 这里只影响布局空间计算，不影响 span 本身（margin-left 实现）
    // 但是计算是否换行时，offset 实际上消耗了行空间
    const effectiveSpan = Math.min(span + offset, colsValue)
    return {
      id: item.id,
      suffix: item.suffix.value,
      span: effectiveSpan, // 包含 offset 的总宽度
    }
  })

  if (!collapsed) {
    effectiveItems.forEach((entry) => {
      map.set(entry.id, true)
    })
    return { map, overflow: false }
  }

  const exceedsRows = (spanSum: number) => Math.ceil(spanSum / colsValue) > collapsedRowsValue
  let spanSum = 0

  // 优先保留 Suffix 节点
  // 注意：如果 Suffix 节点很大，可能会占据大量空间
  effectiveItems.forEach((entry) => {
    if (entry.suffix) {
      spanSum += entry.span
      displayIds.add(entry.id)
    }
  })

  if (!exceedsRows(spanSum)) {
    for (const entry of effectiveItems) {
      if (entry.suffix) {
        continue
      }
      const nextSpan = spanSum + entry.span
      if (exceedsRows(nextSpan)) {
        break
      }
      displayIds.add(entry.id)
      spanSum = nextSpan
    }
  }

  const overflow = effectiveItems.some(entry => !entry.suffix && !displayIds.has(entry.id))

  effectiveItems.forEach((entry) => {
    map.set(entry.id, displayIds.has(entry.id))
  })

  return { map, overflow }
})

const visibilityMap = computed(() => visibilityState.value.map)
const overflow = computed(() => visibilityState.value.overflow)

const gridStyle = computed<CSSProperties>(() => ({
  display: "grid",
  gridTemplateColumns: `repeat(${resolvedCols.value}, minmax(0, 1fr))`,
  columnGap: `${resolvedColGap.value}px`,
  rowGap: `${resolvedRowGap.value}px`,
  // gap shorthand
  gap: `${resolvedRowGap.value}px ${resolvedColGap.value}px`,
}))

const registerItem: GridContext["registerItem"] = (state) => {
  const exists = items.value.some(item => item.id === state.id)
  if (exists) {
    items.value = items.value.map(item => (item.id === state.id ? state : item))
  }
  else {
    items.value = [...items.value, state]
  }
}

const unregisterItem: GridContext["unregisterItem"] = (id) => {
  items.value = items.value.filter(item => item.id !== id)
}

const context: GridContext = {
  cols: resolvedCols,
  colGap: resolvedColGap,
  rowGap: resolvedRowGap,
  collapsed: resolvedCollapsed,
  collapsedRows: resolvedCollapsedRows,
  width: computed(() => viewportWidth.value),
  overflow,
  visibilityMap,
  registerItem,
  unregisterItem,
  isItemVisible(id) {
    return visibilityMap.value.get(id) ?? true
  },
}

provide(gridInjectionKey, context)
</script>

<style lang="scss">
.fd-grid {
  height: fit-content;
  display: grid;
}
</style>
