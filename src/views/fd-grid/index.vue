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
import BasicGrid from "./components/BasicGrid.vue"
import ResponsiveGrid from "./components/ResponsiveGrid.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础栅格",
    badge: "基础",
    description: "固定 cols 与行/列间距，等宽网格。",
    component: BasicGrid,
    tagType: "success",
  },
  {
    key: "responsive",
    title: "响应式与折叠",
    badge: "进阶",
    description: "断点 cols + collapsedRows 行数控制。",
    component: ResponsiveGrid,
    tagType: "warning",
  },
]
</script>
