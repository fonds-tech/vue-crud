<template>
  <div class="fd-grid" :style="gridStyle">
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

const viewportWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1920)

function handleResize() {
  if (typeof window === "undefined") {
    return
  }
  viewportWidth.value = window.innerWidth
}

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("resize", handleResize)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", handleResize)
  }
})

const items = shallowRef<GridItemState[]>([])

const resolvedCols = computed(() => clampValue(resolveResponsiveValue(props.cols, viewportWidth.value, 24), 1, 60))
const resolvedRowGap = computed(() => Math.max(0, resolveResponsiveValue(props.rowGap, viewportWidth.value, 0)))
const resolvedColGap = computed(() => Math.max(0, resolveResponsiveValue(props.colGap, viewportWidth.value, 0)))
const resolvedCollapsed = computed(() => props.collapsed)
const resolvedCollapsedRows = computed(() => Math.max(1, props.collapsedRows))

const visibilityState = computed(() => {
  const map = new Map<symbol, boolean>()
  const displayIds = new Set<symbol>()
  const colsValue = resolvedCols.value
  const collapsed = resolvedCollapsed.value
  const collapsedRowsValue = resolvedCollapsedRows.value

  const effectiveItems = items.value.map((item) => {
    const span = clampValue(item.span.value, 1, colsValue)
    const offset = clampValue(item.offset.value, 0, Math.max(colsValue - 1, 0))
    const effectiveSpan = Math.min(offset > 0 ? span + offset : span, colsValue)
    return {
      id: item.id,
      suffix: item.suffix.value,
      span: effectiveSpan,
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
  gap: `${resolvedRowGap.value}px ${resolvedColGap.value}px`,
}))

const registerItem: GridContext["registerItem"] = (state) => {
  const exists = items.value.some(item => item.id === state.id)
  items.value = exists ? items.value.map(item => (item.id === state.id ? state : item)) : [...items.value, state]
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

<style scoped>
.fd-grid {
  height: fit-content;
  display: grid;
}
</style>
