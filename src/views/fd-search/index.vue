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
import OverflowCollapse from "./components/OverflowCollapse.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "基础搜索",
    badge: "入门",
    description: "通用列表场景：输入/选择/日期组合，涵盖关键词、状态、类型、日期、通知、优先级等常见字段。",
    component: BasicSearch,
    tagType: "success",
  },
  {
    key: "advanced",
    title: "多字段高级搜索",
    badge: "运营场景",
    description: "复杂筛选：级联、标签、多选、开关、滑块、评分等复合控件，演示 onSearch/onReset 钩子。",
    component: AdvancedSearch,
    tagType: "warning",
  },
  {
    key: "compact",
    title: "紧凑搜索栏",
    badge: "轻量页面",
    description: "工具栏式：字段精简、按钮靠右，适合列表页顶部轻量搜索。",
    component: CompactSearch,
    tagType: "warning",
  },
  {
    key: "stacked-actions",
    title: "纵向动作区域",
    badge: "上下排列",
    description: "按钮纵向排列：动作独立一列，适合窄屏或需要突出搜索/重置的场景。",
    component: StackedActions,
    tagType: "warning",
  },
  {
    key: "overflow",
    title: "超行折叠示例",
    badge: "折叠演示",
    description: "折叠/展开：字段超出行数自动折叠，演示 collapsed/collapsedRows 配置。",
    component: OverflowCollapse,
    tagType: "warning",
  },
]
</script>
