<template>
  <layout
    title="fd-form 表单示例"
    description="展示 fd-form 的多种布局与模式"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import HookForm from "./components/HookForm.vue"
import ModeForm from "./components/ModeForm.vue"
import TabsForm from "./components/TabsForm.vue"
import BasicForm from "./components/BasicForm.vue"
import StepsForm from "./components/StepsForm.vue"
import DynamicForm from "./components/DynamicForm.vue"
import WorkflowForm from "./components/WorkflowForm.vue"
import ComponentPlayground from "./components/ComponentPlayground.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础信息表单",
    badge: "标准布局",
    description: "1 列控件展示基础校验，适合入门场景。",
    component: BasicForm,
    componentName: "BasicForm",
    tagType: "success",
  },
  {
    key: "tabs",
    title: "Tabs 分段信息",
    badge: "Tabs + 折叠",
    description: "三大分组 + 折叠行演示，展示 help/extra/tooltip。",
    component: TabsForm,
    componentName: "TabsForm",
    tagType: "success",
  },
  {
    key: "workflow",
    title: "审批提交流程",
    badge: "工作流",
    description: "包含日期、标签、开关和滑块，模拟审批信息收集。",
    component: WorkflowForm,
    componentName: "WorkflowForm",
    tagType: "success",
  },
  {
    key: "dynamic",
    title: "动态联动表单",
    badge: "Action API",
    description: "使用 setOptions/hideItem/setRequired 实现客户类型联动。",
    component: DynamicForm,
    componentName: "DynamicForm",
    tagType: "success",
  },
  {
    key: "steps",
    title: "多步骤审批",
    badge: "Steps",
    description: "分步填写并联动步骤条，适合长流程审批。",
    component: StepsForm,
    componentName: "StepsForm",
    tagType: "success",
  },
  {
    key: "hook",
    title: "数据钩子转换",
    badge: "Hook",
    description: "演示 number/json/datetimeRange 等 hook 对齐后端结构。",
    component: HookForm,
    componentName: "HookForm",
    tagType: "success",
  },
  {
    key: "mode",
    title: "模式切换场景",
    badge: "Mode",
    description: "setMode + bindFields 复用表单，支持新增/编辑态切换。",
    component: ModeForm,
    componentName: "ModeForm",
    tagType: "success",
  },
  {
    key: "component",
    title: "组件配置全景",
    badge: "Component",
    description: "演示 component 对象 props/options/slots/on/style 的完整用法。",
    component: ComponentPlayground,
    componentName: "ComponentPlayground",
    tagType: "warning",
  },
]
</script>
