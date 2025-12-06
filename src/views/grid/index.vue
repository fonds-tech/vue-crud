<template>
  <layout
    title="fd-grid 栅格示例"
    description="展示栅格列数、间距、响应式与折叠能力"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import GapGrid from "./components/GapGrid.vue"
import BasicGrid from "./components/BasicGrid.vue"
import NestedGrid from "./components/NestedGrid.vue"
import SuffixGrid from "./components/SuffixGrid.vue"
import ComplexLayout from "./components/ComplexLayout.vue"
import ResponsiveGrid from "./components/ResponsiveGrid.vue"
import SpanOffsetGrid from "./components/SpanOffsetGrid.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础栅格",
    badge: "基础",
    description: "固定 cols 与行/列间距，等宽网格。",
    component: BasicGrid,
    componentName: "BasicGrid",
    tagType: "success",
  },
  {
    key: "gap",
    title: "动态间距",
    badge: "交互",
    description: "动态调整 row-gap 和 col-gap，观察布局变化。",
    component: GapGrid,
    componentName: "GapGrid",
    tagType: "warning",
  },
  {
    key: "span-offset",
    title: "跨列与偏移",
    badge: "布局",
    description: "使用 span 跨越多列，使用 offset 进行布局偏移。",
    component: SpanOffsetGrid,
    componentName: "SpanOffsetGrid",
    tagType: "info",
  },
  {
    key: "nested",
    title: "栅格嵌套",
    badge: "组合",
    description: "在 fd-grid-item 中嵌套另一个 fd-grid，实现复杂的局部布局。",
    component: NestedGrid,
    componentName: "NestedGrid",
    tagType: "danger",
  },
  {
    key: "responsive",
    title: "响应式与折叠",
    badge: "进阶",
    description: "断点 cols + collapsedRows 行数控制。",
    component: ResponsiveGrid,
    componentName: "ResponsiveGrid",
    tagType: "warning",
  },
  {
    key: "complex",
    title: "复杂仪表盘布局",
    badge: "实战",
    description: "结合响应式、Span 与 Gap，构建类似 Dashboard 的多卡片布局。",
    component: ComplexLayout,
    componentName: "ComplexLayout",
    tagType: "primary",
  },
  {
    key: "suffix",
    title: "高级搜索布局",
    badge: "实战",
    description: "结合 Suffix 属性实现操作区始终置底右对齐的高级筛选场景。",
    component: SuffixGrid,
    componentName: "SuffixGrid",
    tagType: "primary",
  },
]
</script>
