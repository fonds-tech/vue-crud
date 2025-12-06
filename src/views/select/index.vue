<template>
  <layout
    title="fd-select 下拉选择"
    description="基于 Element Plus Select 封装，内置远程搜索、参数联动、自动防抖与数据回填机制"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Api from "./components/Api.vue"
import Basic from "./components/Basic.vue"
import Layout from "../layout.vue"
import Remote from "./components/Remote.vue"
import Advanced from "./components/Advanced.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础用法",
    badge: "Basic",
    description: "包含基础单选、自定义字段映射 (label-key/value-key) 以及多选模式 (Multiple)。",
    component: Basic,
    componentName: "Basic",
    tagType: "success",
  },
  {
    key: "remote",
    title: "远程搜索",
    badge: "Remote",
    description: "演示 API 远程搜索功能，包含防抖控制 (debounce) 与动态参数联动 (Params)。",
    component: Remote,
    componentName: "Remote",
    tagType: "warning",
  },
  {
    key: "api",
    title: "API 配置",
    badge: "New",
    description: "直接传入 API URL 字符串实现数据加载，支持自定义 Method、DataKey 与 SearchField。",
    component: Api,
    componentName: "Api",
    tagType: "danger",
  },
  {
    key: "advanced",
    title: "高级特性",
    badge: "Advanced",
    description: "展示自定义插槽 (Slots)、完整对象回传 (Event) 以及手动方法调用 (Expose)。",
    component: Advanced,
    componentName: "Advanced",
    tagType: "info",
  },
]
</script>
