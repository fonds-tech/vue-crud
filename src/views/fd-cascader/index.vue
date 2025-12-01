<template>
  <layout
    title="fd-cascader 级联选择"
    description="基于 Element Plus Cascader 封装，支持静态数据、API 全量加载与 Lazy 异步加载子节点。"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Api from "./components/Api.vue"
import Lazy from "./components/Lazy.vue"
import Basic from "./components/Basic.vue"
import Layout from "../layout.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础用法",
    badge: "Basic",
    description: "展示基础的级联选择、悬停展开、多选模式及搜索功能。",
    component: Basic,
    componentName: "Basic",
    tagType: "success",
  },
  {
    key: "api",
    title: "API 加载",
    badge: "API",
    description: "使用 api 属性一次性获取全量层级数据，支持参数联动。",
    component: Api,
    componentName: "Api",
    tagType: "danger",
  },
  {
    key: "lazy",
    title: "动态加载",
    badge: "Lazy",
    description: "配合 lazy 属性实现子节点的按需异步加载，适用于大数据量层级。",
    component: Lazy,
    componentName: "Lazy",
    tagType: "warning",
  },
]
</script>
