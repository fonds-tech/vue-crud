<template>
  <layout title="fd-detail 详情示例" description="展示两列布局、分组、插槽与自定义组件渲染" :components="componentCatalog" />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import GridDetail from "./components/GridDetail.vue"
import SlotDetail from "./components/SlotDetail.vue"
import BasicDetail from "./components/BasicDetail.vue"
import DynamicDetail from "./components/DynamicDetail.vue"
import ComponentDetail from "./components/ComponentDetail.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础详情",
    badge: "Basic",
    description: "最简单的两列布局，展示常规字段与 default action。",
    component: BasicDetail,
    componentName: "BasicDetail",
    tagType: "success",
  },
  {
    key: "slots",
    title: "分组与插槽",
    badge: "Advanced",
    description: "展示如何使用 Groups 分组、Label/Value 插槽以及自定义 Footer。",
    component: SlotDetail,
    componentName: "SlotDetail",
    tagType: "warning",
  },
  {
    key: "component",
    title: "组件渲染",
    badge: "Feature",
    description: "无需写插槽，通过 component 配置直接渲染 Element Plus 组件（如 Image, Rate）。",
    component: ComponentDetail,
    componentName: "ComponentDetail",
    tagType: "info",
  },
  {
    key: "grid",
    title: "多列布局",
    badge: "Layout",
    description: "演示 column=3 与 span 属性的配合，实现灵活的栅格布局。",
    component: GridDetail,
    componentName: "GridDetail",
    tagType: "info",
  },
  {
    key: "dynamic",
    title: "异步与动态",
    badge: "Async",
    description: "模拟异步加载数据 (onDetail)，并根据数据动态控制字段显隐。",
    component: DynamicDetail,
    componentName: "DynamicDetail",
    tagType: "danger",
  },
]
</script>
