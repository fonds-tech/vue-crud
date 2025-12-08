<template>
  <!-- eslint-disable vue/no-unused-refs -->
  <fd-crud ref="crudRef">
    <fd-table ref="tableRef" />
    <fd-detail ref="detailRef" />
  </fd-crud>
</template>

<script setup lang="ts">
import type { TableColumn } from "@/components/table/types"
import type { DetailUseOptions } from "@/components/detail/types"
import { DetailMockService } from "../mockService"
import { useCrud, useTable, useDetail } from "@/hooks"

defineOptions({
  name: "grid-detail-demo",
})

const detailOptions: DetailUseOptions = {
  dialog: { width: "800px", title: "多列栅格布局" },
  descriptions: {
    column: 3, // 默认 3 列
    border: true,
    direction: "vertical", // 标签在上方
  },
  items: [
    { prop: "name", label: "计划标题", span: 3 }, // 占满一行
    { prop: "department", label: "部门" },
    { prop: "manager", label: "负责人" },
    { prop: "priority", label: "优先级" },
    { prop: "startDate", label: "开始日期" },
    { prop: "endDate", label: "结束日期" },
    { prop: "budget", label: "预算" },
    { prop: "description", label: "详细描述", span: 3 }, // 占满
    { prop: "auditUser", label: "审核人", span: 2 }, // 占 2/3
    { prop: "auditTime", label: "审核时间", span: 1 },
  ],
}

const columns: TableColumn[] = [
  { prop: "name", label: "计划标题", minWidth: 150 },
  { prop: "department", label: "部门" },
  { prop: "manager", label: "负责人" },
  { prop: "priority", label: "优先级" },
  {
    type: "action",
    label: "操作",
    actions: [{ text: "详情", type: "detail" }],
  },
]

const crudRef = useCrud({
  service: new DetailMockService(),
}, crud => crud.refresh())

const tableRef = useTable({
  columns,
})

const detailRef = useDetail(detailOptions)
</script>
