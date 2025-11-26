<template>
  <layout
    title="Context Menu 演示"
    description="展示 fd-context-menu 在右键触发、组件模式下的典型用法。"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import BasicContextMenu from "./components/BasicContextMenu.vue"
import AdvancedContextMenu from "./components/AdvancedContextMenu.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "右键菜单",
    badge: "API",
    description: "在任意元素上右键弹出菜单，展示多级项、禁用项和 hover 高亮。",
    component: BasicContextMenu,
    tagType: "info",
  },
  {
    key: "advanced",
    title: "自定义内容",
    badge: "组件",
    description: "通过模板方式完全掌控菜单内容，可切换 slot 版本或列表版本。",
    component: AdvancedContextMenu,
    tagType: "info",
  },
]
</script>
