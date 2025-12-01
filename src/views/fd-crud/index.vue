<template>
  <layout
    title="fd-crud 综合示例"
    description="展示 Search + Table + Detail + Upsert 的完整集成方案。"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Basic from "./components/Basic.vue"
import Layout from "../layout.vue"
import Advanced from "./components/Advanced.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础集成",
    badge: "Basic",
    description: "标准的 CRUD 流程，包含完整的搜索、列表、新增、编辑、详情、删除功能。",
    component: Basic,
    componentName: "Basic",
    tagType: "success",
  },
  {
    key: "advanced",
    title: "高级特性",
    badge: "Advanced",
    description: "展示批量操作、导入导出 (Import/Export) 组件以及自定义工具栏按钮的集成。",
    component: Advanced,
    componentName: "Advanced",
    tagType: "warning",
  },
]
</script>
