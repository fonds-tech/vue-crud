<template>
  <layout
    title="fd-crud 容器示例"
    description="组合 search/table/detail/upsert 的完整流程"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import ClassicCrud from "./components/ClassicCrud.vue"
import CompactCrud from "./components/CompactCrud.vue"
import BasicCrudDemo from "./components/BasicCrudDemo.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础 CRUD",
    badge: "基础",
    description: "完整组合示例，包含搜索、表格、详情与新增编辑。",
    component: BasicCrudDemo,
    tagType: "success",
  },
  {
    key: "classic",
    title: "经典布局",
    badge: "示例",
    description: "原有经典 CRUD 示例，包含工具栏与表单/详情。",
    component: ClassicCrud,
    tagType: "warning",
  },
  {
    key: "compact",
    title: "紧凑布局",
    badge: "示例",
    description: "紧凑型 CRUD 布局示例。",
    component: CompactCrud,
    tagType: "warning",
  },
]
</script>
