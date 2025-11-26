<template>
  <layout
    title="fd-option 选项渲染示例"
    description="快速渲染 el-select 选项，支持动态数据"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import BasicOption from "./components/BasicOption.vue"
import RemoteOption from "./components/RemoteOption.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础选项",
    badge: "基础",
    description: "静态 options 渲染。",
    component: BasicOption,
    tagType: "success",
  },
  {
    key: "remote",
    title: "远程选项",
    badge: "进阶",
    description: "模拟异步加载选项并渲染。",
    component: RemoteOption,
    tagType: "warning",
  },
]
</script>
