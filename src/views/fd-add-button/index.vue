<template>
  <layout
    title="fd-add-button 新增按钮示例"
    description="依赖 CRUD 权限的新增触发"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import BasicAdd from "./components/BasicAdd.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础新增",
    badge: "基础",
    description: "绑定 crud 权限与 rowAdd 调用。",
    component: BasicAdd,
    tagType: "success",
  },
]
</script>
