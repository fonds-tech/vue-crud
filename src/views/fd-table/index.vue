<template>
  <layout
    title="fd-table 表格示例"
    description="展示基础表格、操作列、自定义插槽等能力"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import BasicTable from "./components/BasicTable.vue"
import ActionTable from "./components/ActionTable.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础表格",
    badge: "基础",
    description: "边框 + 斑马纹 + 本地数据与分页区间展示。",
    component: BasicTable,
    tagType: "success",
  },
  {
    key: "action",
    title: "操作列与插槽",
    badge: "进阶",
    description: "内置操作列 + 自定义 slot 渲染 + 事件处理示例。",
    component: ActionTable,
    tagType: "warning",
  },
]
</script>
