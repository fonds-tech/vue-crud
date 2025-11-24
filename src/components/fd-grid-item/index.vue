<template>
  <div v-show="isVisible" class="fd-grid__item" :class="itemClass" :style="itemStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from "vue"
import type { GridItemProps, GridItemState } from "../fd-grid/type"
import { gridInjectionKey } from "../fd-grid/type"
import { clampValue, resolveResponsiveValue } from "../fd-grid/utils"
import { inject, computed, onBeforeMount, onBeforeUnmount } from "vue"

defineOptions({
  name: "fd-grid-item",
})

const props = withDefaults(defineProps<GridItemProps>(), {
  span: 1,
  offset: 0,
  suffix: false,
})

const grid = inject(gridInjectionKey)

if (!grid) {
  console.warn("[fd-grid-item] 需要在 fd-grid 内使用，以获得栅格参数和折叠能力。")
}

const cols = computed(() => grid?.cols.value ?? 24)
const viewportWidth = computed(() => grid?.width.value ?? (typeof window !== "undefined" ? window.innerWidth : 1920))

const resolvedSpan = computed(() => clampValue(resolveResponsiveValue(props.span, viewportWidth.value, 1), 1, cols.value))
const resolvedOffset = computed(() => clampValue(resolveResponsiveValue(props.offset, viewportWidth.value, 0), 0, Math.max(cols.value - 1, 0)))

const id = Symbol("fd-grid-item")
const state: GridItemState = {
  id,
  span: resolvedSpan,
  offset: resolvedOffset,
  suffix: computed(() => props.suffix),
}

onBeforeMount(() => {
  grid?.registerItem(state)
})

onBeforeUnmount(() => {
  grid?.unregisterItem(id)
})

const isVisible = computed(() => grid?.isItemVisible(id) ?? true)

const itemStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    gridColumn: `span ${resolvedOffset.value + 1} / span ${resolvedSpan.value}`,
  }

  if (props.suffix) {
    style.justifySelf = "end"
  }

  return style
})

const itemClass = computed(() => ({
  "fd-grid__item--suffix": props.suffix,
}))
</script>

<style lang="scss">
.fd-grid__item {
  height: fit-content;
  min-width: 0;
  box-sizing: border-box;
}

.fd-grid__item--suffix {
  justify-self: end;
}
</style>
