<template>
  <layout title="fd-context-menu 右键菜单示例" description="展示基础右键菜单与多级自定义项" :components="componentCatalog" />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import BasicContextMenu from "./components/BasicContextMenu.vue"
import AdvancedContextMenu from "./components/AdvancedContextMenu.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础右键菜单",
    badge: "基础",
    description: "右键触发 + 关闭行为演示。",
    component: BasicContextMenu,
    tagType: "success",
  },
  {
    key: "advanced",
    title: "多级自定义项",
    badge: "进阶",
    description: "多级菜单、禁用、回调关闭控制。",
    component: AdvancedContextMenu,
    tagType: "warning",
  },
]
</script>
