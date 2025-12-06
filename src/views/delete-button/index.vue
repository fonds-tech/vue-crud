<template>
  <layout
    title="fd-delete-button 删除按钮示例"
    description="校验选中态的删除触发"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import DeleteWithSelection from "./components/DeleteWithSelection.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "selection",
    title: "选中校验",
    badge: "基础",
    description: "根据 selection 禁用/启用，触发 rowDelete。",
    component: DeleteWithSelection,
    tagType: "success",
  },
]
</script>
