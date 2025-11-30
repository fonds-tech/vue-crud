<template>
  <layout
    title="fd-upsert 新增/编辑示例"
    description="展示 fd-upsert 的打开、提交与模式切换"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Basic from "./components/Basic.vue"
import Layout from "../layout.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "新增/编辑",
    badge: "基础",
    description: "open 模式切换 + onSubmit 回调示例。",
    component: Basic,
    tagType: "success",
  },
]
</script>
