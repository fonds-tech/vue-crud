<template>
  <layout
    title="fd-dialog 弹窗示例"
    description="展示基础弹窗、全屏切换与滚动内容"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import BasicDialog from "./components/BasicDialog.vue"
import ScrollDialog from "./components/ScrollDialog.vue"
import BasicFormDialog from "./components/BasicFormDialog.vue"
import FullscreenDialog from "./components/FullscreenDialog.vue"
import FullscreenDialogLegacy from "./components/FullscreenDialogLegacy.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础弹窗",
    badge: "基础",
    description: "fd-dialog 透传属性，基础打开/关闭。",
    component: BasicDialog,
    tagType: "success",
  },
  {
    key: "fullscreen-simple",
    title: "全屏与滚动",
    badge: "进阶",
    description: "自定义 footer + 全屏切换 + 长内容滚动。",
    component: FullscreenDialog,
    tagType: "warning",
  },
  {
    key: "form-dialog",
    title: "表单弹窗",
    badge: "表单",
    description: "结合 fd-form 的校验与提交流程。",
    component: BasicFormDialog,
    tagType: "primary",
  },
  {
    key: "fullscreen-api",
    title: "API 控制全屏",
    badge: "API",
    description: "open/close/fullscreen 方法与可见性状态展示。",
    component: FullscreenDialogLegacy,
    tagType: "primary",
  },
  {
    key: "scroll",
    title: "滚动长内容",
    badge: "滚动",
    description: "演示自定义高度与时间轴内容滚动。",
    component: ScrollDialog,
    tagType: "info",
  },
]
</script>
