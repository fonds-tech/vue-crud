<template>
  <layout title="fd-form 表单示例" description="展示 fd-form 的多种布局与模式" :components="componentCatalog" />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import HookForm from "./components/Hook.vue"
import ModeForm from "./components/Mode.vue"
import TabsForm from "./components/Tabs.vue"
import BasicForm from "./components/Basic.vue"
import StepsForm from "./components/Steps.vue"
import DynamicForm from "./components/Dynamic.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础信息表单",
    badge: "标准布局",
    description: "1 列控件展示基础校验，适合入门场景。",
    component: BasicForm,
    componentName: "Basic",
    tagType: "success",
  },
  {
    key: "tabs",
    title: "Tabs 分段信息",
    badge: "Tabs + 折叠",
    description: "三大分组 + 折叠行演示，展示 help/extra/tooltip。",
    component: TabsForm,
    componentName: "Tabs",
    tagType: "success",
  },
  {
    key: "steps",
    title: "多步骤审批",
    badge: "Steps",
    description: "分步填写并联动步骤条，适合长流程审批。",
    component: StepsForm,
    componentName: "Steps",
    tagType: "success",
  },
  {
    key: "dynamic",
    title: "动态联动表单",
    badge: "Action API",
    description: "使用 setOptions/hideItem/setRequired 实现客户类型联动。",
    component: DynamicForm,
    componentName: "Dynamic",
    tagType: "success",
  },
  {
    key: "hook",
    title: "数据钩子转换",
    badge: "Hook",
    description: "演示 number/json/datetimeRange 等 hook 对齐后端结构。",
    component: HookForm,
    componentName: "Hook",
    tagType: "success",
  },
  {
    key: "mode",
    title: "模式切换场景",
    badge: "Mode",
    description: "setMode + bindFields 复用表单，支持新增/编辑态切换。",
    component: ModeForm,
    componentName: "Mode",
    tagType: "success",
  },
]
</script>
