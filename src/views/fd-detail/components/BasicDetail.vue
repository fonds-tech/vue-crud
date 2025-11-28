<template>
  <!-- eslint-disable vue/no-unused-refs -->
  <fd-crud ref="crudRef">
    <fd-table ref="tableRef" />
    <fd-detail ref="detailRef" />
  </fd-crud>
</template>

<script setup lang="ts">
import { DetailMockService } from "../mockService"
import { useCrud, useTable, useDetail } from "@/hooks"

defineOptions({
  name: "basic-detail-demo",
})

const crudRef = useCrud({
  service: new DetailMockService(),
}, crud => crud.refresh())

const tableRef = useTable({
  columns: [
    {
      prop: "avatar",
      label: "头像",
      width: 80,
      component: {
        is: "el-avatar",
        props: (scope: any) => ({ src: scope.row.avatar, size: "small" }),
      },
    },
    { prop: "name", label: "姓名", minWidth: 140 },
    { prop: "account", label: "账号", minWidth: 120 },
    {
      prop: "priority",
      label: "优先级",
      width: 100,
      dict: [
        { label: "High", value: "High", type: "danger" },
        { label: "Medium", value: "Medium", type: "warning" },
        { label: "Low", value: "Low", type: "info" },
      ],
    },
    {
      prop: "progress",
      label: "进度",
      minWidth: 180,
      component: {
        is: "el-progress",
        props: (scope: any) => ({ percentage: scope.row.progress, strokeWidth: 10 }),
      },
    },
    {
      prop: "score",
      label: "评分",
      minWidth: 160,
      component: {
        is: "el-rate",
        props: (scope: any) => ({ modelValue: Number(scope.row.score), disabled: true, size: "small" }),
      },
    },
    {
      prop: "website",
      label: "个人主页",
      minWidth: 180,
      component: {
        is: "el-link",
        props: (scope: any) => ({ type: "primary", href: scope.row.website, target: "_blank" }),
        slots: { default: () => "点击访问" },
      },
    },
    {
      prop: "status",
      label: "状态",
      width: 80,
      dict: [
        { label: "启用", value: 1, type: "success" },
        { label: "禁用", value: 0, type: "danger" },
      ],
    },
    { prop: "createTime", label: "创建时间", minWidth: 160 },
    {
      type: "action",
      label: "操作",
      width: 100,
      fixed: "right",
      actions: [
        { text: "详情", type: "detail" },
      ],
    },
  ],
})

const priorityDict = [
  { label: "High", value: "High", type: "danger" },
  { label: "Medium", value: "Medium", type: "warning" },
  { label: "Low", value: "Low", type: "info" },
]

function priorityLabel(value: string) {
  return priorityDict.find(item => item.value === value)?.label ?? value ?? ""
}

function priorityType(value: string) {
  return priorityDict.find(item => item.value === value)?.type
}

const detailRef = useDetail({
  dialog: { width: "800px" },
  descriptions: { column: 2 },
  items: [
    {
      field: "avatar",
      label: "头像",
      component: {
        is: "el-avatar",
        props: (data: any) => ({ src: data.avatar, size: 64, shape: "circle" }),
      },
    },
    { field: "name", label: "姓名" },
    { field: "account", label: "账号" },
    {
      field: "priority",
      label: "优先级",
      component: {
        is: "el-tag",
        props: (data: any) => ({ type: priorityType(data.priority) }),
        slots: (data: any) => ({ default: () => priorityLabel(data.priority) }),
      },
    },
    {
      field: "progress",
      label: "进度",
      component: {
        is: "el-progress",
        props: (data: any) => ({ percentage: data.progress, strokeWidth: 10 }),
      },
    },
    {
      field: "score",
      label: "评分",
      component: {
        is: "el-rate",
        props: (data: any) => ({ modelValue: Number(data.score), disabled: true, size: "small" }),
      },
    },
    {
      field: "website",
      label: "个人主页",
      component: {
        is: "el-link",
        props: (data: any) => ({ type: "primary", href: data.website, target: "_blank" }),
        slots: { default: () => "点击访问" },
      },
    },
    { field: "status", label: "状态", formatter: (value: number) => (value ? "启用" : "禁用") },
    { field: "createTime", label: "创建时间" },
    { field: "remark", label: "备注", span: 2 },
  ],
})
</script>
