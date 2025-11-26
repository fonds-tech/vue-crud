<template>
  <layout
    title="fd-detail 详情示例"
    description="展示两列布局、分组、插槽与自定义组件渲染"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import SlotDetail from "./components/SlotDetail.vue"
import BasicDetail from "./components/BasicDetail.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础详情",
    badge: "基础",
    description: "两列布局 + formatter + 默认动作按钮。",
    component: BasicDetail,
    tagType: "success",
  },
  {
    key: "slots",
    title: "分组与插槽",
    badge: "进阶",
    description: "分组标题、状态标签插槽、自定义 footer 按钮。",
    component: SlotDetail,
    tagType: "warning",
  },
]
</script>
