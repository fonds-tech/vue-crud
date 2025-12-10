<template>
  <layout title="fd-table 表格示例" description="展示基础表格、操作列、自定义插槽等能力" :components="componentCatalog" />
</template>

<script setup lang="ts">
import type { ComponentMeta } from "../layout.vue"
import Layout from "../layout.vue"
import TreeTable from "./components/TreeTable.vue"
import BasicTable from "./components/BasicTable.vue"
import ActionTable from "./components/ActionTable.vue"
import ExpandTable from "./components/ExpandTable.vue"
import ComplexTable from "./components/ComplexTable.vue"
import SelectionTable from "./components/SelectionTable.vue"

const componentCatalog: ComponentMeta[] = [
  // 1. 基础演示
  {
    key: "basic",
    title: "基础表格",
    badge: "Basic",
    description: "标准表格布局：包含边框、斑马纹样式，演示基础的数据展示与分页功能。自动处理分页参数与数据加载。",
    component: BasicTable,
    componentName: "BasicTable",
    tagType: "success",
  },
  // 2. 进阶特性
  {
    key: "action",
    title: "操作列与插槽",
    badge: "Feature",
    description: "演示表格操作列配置，支持内置按钮类型 (如详情、删除) 与自定义插槽 (Slot) 渲染，以及行级事件处理。",
    component: ActionTable,
    componentName: "ActionTable",
    tagType: "warning",
  },
  {
    key: "selection",
    title: "多选与批量操作",
    badge: "Selection",
    description: "演示多选列 (type='selection') 的配置与使用。通过 crud.selection 获取选中行，实现批量删除等操作。",
    component: SelectionTable,
    componentName: "SelectionTable",
    tagType: "info",
  },
  {
    key: "expand",
    title: "展开行详情",
    badge: "Expand",
    description: "演示展开行 (type='expand') 的使用。在展开区域中可以放置详情信息、嵌套表格或其他任意组件。",
    component: ExpandTable,
    componentName: "ExpandTable",
    tagType: "info",
  },
  {
    key: "tree",
    title: "树形数据",
    badge: "Tree",
    description: "演示树形数据的展示。通过配置 rowKey 和 treeProps，支持层级数据的折叠与展开，适合组织架构等场景。",
    component: TreeTable,
    componentName: "TreeTable",
    tagType: "warning",
  },
  {
    key: "complex",
    title: "复杂综合表格",
    badge: "Complex",
    description: "综合演示：固定列 (Fixed Columns) 应对宽表，后端排序 (Custom Sort)，以及自定义单元格组件 (进度条、金额)。",
    component: ComplexTable,
    componentName: "ComplexTable",
    tagType: "danger",
  },
]
</script>
