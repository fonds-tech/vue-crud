<template>
  <layout
    title="fd-search 搜索示例"
    description="展示 fd-search 不同布局与动作区域"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import BasicSearch from "./components/BasicSearch.vue"
import AdvancedSearch from "./components/AdvancedSearch.vue"
import CustomSlotSearch from "./components/CustomSlotSearch.vue"
import OverflowCollapse from "./components/OverflowCollapse.vue"

const componentCatalog: ComponentMeta[] = [
  // 1. 基础演示
  {
    key: "basic",
    title: "基础用法",
    badge: "Basic",
    description: "最常用的标准布局：表单项自动网格排列，操作按钮位于右侧。涵盖输入框、下拉框、日期范围等基础控件。",
    component: BasicSearch,
    componentName: "BasicSearch",
    tagType: "success",
  },
  {
    key: "overflow",
    title: "折叠展开",
    badge: "Feature",
    description: "当筛选条件过多时自动折叠，保持界面整洁。支持自定义默认展示行数（collapsedRows）和展开/折叠状态。",
    component: OverflowCollapse,
    componentName: "OverflowCollapse",
    tagType: "warning",
  },
  // 4. 高级应用
  {
    key: "advanced",
    title: "复杂组件与钩子",
    badge: "Advanced",
    description: "集成级联选择、滑块、评分等复杂组件。演示 onSearch/onReset 生命周期钩子，用于处理异步逻辑或参数转换。",
    component: AdvancedSearch,
    componentName: "AdvancedSearch",
    tagType: "danger",
  },
  // 5. 深度定制
  {
    key: "custom-slot",
    title: "插槽与外部控制",
    badge: "Custom",
    description: "高阶用法：演示表单项插槽 (Slot)、动作区插槽、属性动态计算 (Dynamic Props) 以及通过 Expose API 进行外部控制。",
    component: CustomSlotSearch,
    componentName: "CustomSlotSearch",
    tagType: "danger",
  },
]
</script>
