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

const visibilityMap = computed(() => {
  const map = new Map<symbol, boolean>()
  let currentRow = 1
  let spaceLeft = resolvedCols.value

  items.value.forEach((item) => {
    const span = clampValue(item.span.value, 1, resolvedCols.value)
    const offset = clampValue(item.offset.value, 0, Math.max(resolvedCols.value - 1, 0))
    const required = Math.min(span + offset, resolvedCols.value)

    if (required > spaceLeft) {
      currentRow += 1
      spaceLeft = resolvedCols.value
    }

    const hidden = !item.suffix.value && resolvedCollapsed.value && currentRow > resolvedCollapsedRows.value
    map.set(item.id, !hidden)

    spaceLeft = Math.max(spaceLeft - required, 0)
  })

  return map
})

const gridStyle = computed<CSSProperties>(() => ({
  columnGap: `${resolvedColGap.value}px`,
  rowGap: `${resolvedRowGap.value}px`,
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
  registerItem,
  unregisterItem,
  isItemVisible(id) {
    return visibilityMap.value.get(id) ?? true
  },
}

provide(gridInjectionKey, context)
</script>
