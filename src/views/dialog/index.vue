<template>
  <layout
    title="fd-dialog 弹窗演示"
    description="结合源码特性展示多种使用姿势：表单、API 控制、长内容滚动等。"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import ScrollDialog from "./components/ScrollDialog.vue"
import BasicFormDialog from "./components/BasicFormDialog.vue"
import FullscreenDialog from "./components/FullscreenDialog.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "配置化表单弹窗",
    badge: "Form + Hooks",
    description: "结合 fd-form 展示校验、提交与关闭后的 resetFields 流程。",
    component: BasicFormDialog,
    tagType: "primary",
  },
  {
    key: "fullscreen",
    title: "全屏与方法调用",
    badge: "公开 API",
    description: "通过 open/close/fullscreen 方法控制弹窗状态，并查看 expose 出来的实时状态。",
    component: FullscreenDialog,
    tagType: "primary",
  },
  {
    key: "scroll",
    title: "长内容滚动示例",
    badge: "height + scrollbar",
    description: "设置 height、top、center 等属性，展示时间轴日志的滚动体验。",
    component: ScrollDialog,
    tagType: "primary",
  },
]
</script>
