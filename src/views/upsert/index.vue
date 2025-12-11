<template>
  <layout title="fd-upsert 新增/编辑示例" description="展示 fd-upsert 的打开、提交与模式切换" :components="componentCatalog" />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Basic from "./components/basic.vue"
import Steps from "./components/steps.vue"
import Layout from "../layout.vue"
import Confirm from "./components/confirm.vue"
import Prefill from "./components/prefill.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "新增/编辑",
    badge: "基础",
    description: "open 模式切换 + onSubmit 回调示例。",
    component: Basic,
    tagType: "success",
  },
  {
    key: "steps",
    title: "多步骤流程",
    badge: "进阶",
    description: "steps 组件引导 + 自定义上/下步按钮，提交前可分步校验。",
    component: Steps,
    tagType: "warning",
  },
  {
    key: "detail-prefill",
    title: "详情预填与只读字段",
    badge: "进阶",
    description: "onDetail 自定义预填，账号字段编辑态只读，配合 setProps 控制。",
    component: Prefill,
    tagType: "info",
  },
  {
    key: "confirm",
    title: "二次确认提交",
    badge: "安全",
    description: "提交前弹出确认框，再调用 ctx.next 与服务端交互。",
    component: Confirm,
    tagType: "danger",
  },
]
</script>
