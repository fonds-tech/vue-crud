<template>
  <layout
    title="CRUD 演示"
    description="不同的 CRUD 组合调试场景"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import ClassicCrud from "./components/ClassicCrud.vue"
import CompactCrud from "./components/CompactCrud.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "classic",
    title: "经典 CRUD 布局",
    badge: "综合示例",
    description: "包含搜索、表格与详情面板的完整演示。",
    component: ClassicCrud,
    tagType: "primary",
  },
  {
    key: "minimal",
    title: "紧凑表格模式",
    badge: "列表页",
    description: "搜索栏压缩为两列，仅展示核心字段与批量操作按钮。",
    component: CompactCrud,
    tagType: "primary",
  },
]
</script>
