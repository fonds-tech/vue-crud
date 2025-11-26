<template>
  <layout
    title="fd-select 选择器示例"
    description="展示静态选项与远程搜索两种用法"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import BasicSelect from "./components/BasicSelect.vue"
import RemoteSelect from "./components/RemoteSelect.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础下拉",
    badge: "基础",
    description: "静态选项，支持清空与多选。",
    component: BasicSelect,
    tagType: "success",
  },
  {
    key: "remote",
    title: "远程搜索",
    badge: "进阶",
    description: "模拟接口搜索，演示 loading 与防抖。",
    component: RemoteSelect,
    tagType: "warning",
  },
]
</script>
