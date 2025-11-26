<template>
  <layout
    title="fd-import 导入示例"
    description="展示上传、模板下载与确认流程"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import BasicImport from "./components/BasicImport.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础导入",
    badge: "基础",
    description: "模拟上传 + 模板下载 + 确认回调。",
    component: BasicImport,
    tagType: "success",
  },
]
</script>
