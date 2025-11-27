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
import CompactSearch from "./components/CompactSearch.vue"
import AdvancedSearch from "./components/AdvancedSearch.vue"
import StackedActions from "./components/StackedActions.vue"
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
  // 2. 布局变体
  {
    key: "compact",
    title: "紧凑布局",
    badge: "Layout",
    description: "适用于顶部工具栏或低高度场景。通过调整 Grid 间距和列数，使界面更紧凑，操作区可自定义添加额外按钮。",
    component: CompactSearch,
    componentName: "CompactSearch",
    tagType: "info",
  },
  {
    key: "stacked-actions",
    title: "纵向动作栏",
    badge: "Layout",
    description: "将操作按钮区独立为一整行或纵向排列。适用于移动端适配、侧边栏搜索或需要强调操作按钮的场景。",
    component: StackedActions,
    componentName: "StackedActions",
    tagType: "info",
  },
  // 3. 交互特性
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
