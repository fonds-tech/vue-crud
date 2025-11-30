<template>
  <div ref="elRef" class="fd-grid__item" :class="itemClass" :style="itemStyle">
    <slot :overflow="overflow" />
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from "vue"
import type { GridItemProps, GridItemState } from "../fd-grid/type"
import { gridInjectionKey } from "../fd-grid/type"
import { clampValue, resolveResponsiveValue } from "../fd-grid/utils"

import { ref, inject, computed, onMounted, onBeforeMount, onBeforeUnmount } from "vue"

defineOptions({
  name: "fd-grid-item",
})

const props = withDefaults(defineProps<GridItemProps>(), {
  span: 1,
  offset: 0,
  suffix: false,
})

const grid = inject(gridInjectionKey)
const elRef = ref<HTMLElement | null>(null)

if (!grid) {
  console.warn("[fd-grid-item] 需要在 fd-grid 内使用，以获得栅格参数和折叠能力。")
}

const cols = computed(() => grid?.cols.value ?? 24)
const colGap = computed(() => grid?.colGap.value ?? 0)
const viewportWidth = computed(() => grid?.width.value ?? (typeof window !== "undefined" ? window.innerWidth : 1920))

const resolvedSpan = computed(() => {
  const val = clampValue(resolveResponsiveValue(props.span, viewportWidth.value, 1), 1, cols.value)
  return val
})
const resolvedOffset = computed(() => {
  const val = clampValue(resolveResponsiveValue(props.offset, viewportWidth.value, 0), 0, Math.max(cols.value - 1, 0))
  return val
})

const id = Symbol("fd-grid-item")
const state: GridItemState = {
  id,
  span: resolvedSpan,
  offset: resolvedOffset,
  suffix: computed(() => props.suffix),
  el: null,
}

onBeforeMount(() => {
  // 在 mounted 之后更新 el，这里先注册占位
  grid?.registerItem(state)
})

onMounted(() => {
  state.el = elRef.value
  // 重新注册以更新 el
  grid?.registerItem(state)
})

onBeforeUnmount(() => {
  grid?.unregisterItem(id)
})

const isVisible = computed(() => grid?.visibilityMap.value.get(id) ?? true)
const overflow = computed(() => grid?.overflow.value ?? false)

const itemStyle = computed<CSSProperties>(() => {
  const span = resolvedSpan.value
  const offset = resolvedOffset.value

  const style: CSSProperties = {
    gridColumn: `span ${span} / span ${span}`,
    marginLeft: offset > 0
      ? `calc(((100% + ${colGap.value}px) / ${cols.value}) * ${offset})`
      : undefined,
    display: isVisible.value ? "block" : "none",
  }

  if (props.suffix) {
    style.justifySelf = "end"
    style.gridColumnStart = `span ${span}`
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
  display: none;

  &--suffix {
    justify-self: end;
  }
}
</style>
