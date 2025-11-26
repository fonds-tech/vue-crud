<template>
  <layout
    title="搜索演示"
    description="fd-search 调试场景与布局"
    :components="componentCatalog"
  />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import CompactSearch from "./components/CompactSearch.vue"
import AdvancedSearch from "./components/AdvancedSearch.vue"
import StackedActions from "./components/StackedActions.vue"
import OverflowCollapse from "./components/OverflowCollapse.vue"

const componentCatalog: ComponentMeta[] = [
  {
    key: "advanced",
    title: "多字段高级搜索",
    badge: "运营场景",
    description: "包含级联、标签、滑块与开关，适合复杂筛选。",
    component: AdvancedSearch,
    tagType: "warning",
  },
  {
    key: "compact",
    title: "紧凑搜索栏",
    badge: "轻量页面",
    description: "仅保留常用字段，按钮靠右排列，更适合列表页顶部工具条。",
    component: CompactSearch,
    tagType: "warning",
  },
  {
    key: "stacked-actions",
    title: "纵向动作区域",
    badge: "上下排列",
    description: "将搜索/重置按钮堆叠展示，适合窄屏或需要突出动作的场景。",
    component: StackedActions,
    tagType: "warning",
  },
  {
    key: "overflow",
    title: "超行折叠示例",
    badge: "折叠演示",
    description: "字段超过三行，展示展开/折叠动作按钮。",
    component: OverflowCollapse,
    tagType: "warning",
  },
]
</script>
