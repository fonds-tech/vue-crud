<template>
  <layout
    title="fd-cascader 级联选择示例"
    description="展示静态与懒加载两种用法"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import LazyCascader from "./components/LazyCascader.vue"
import BasicCascader from "./components/BasicCascader.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础级联",
    badge: "基础",
    description: "静态层级数据，支持清空与多选。",
    component: BasicCascader,
    tagType: "success",
  },
  {
    key: "lazy",
    title: "懒加载",
    badge: "进阶",
    description: "lazy-load 异步加载子节点。",
    component: LazyCascader,
    tagType: "warning",
  },
]
</script>
