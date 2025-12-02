<template>
  <fd-crud ref="crud">
    <fd-search ref="search" />
    <fd-table ref="table">
      <template #toolbar>
        <fd-add-button />
        <fd-delete-button />
        <fd-import />
        <fd-export />
      </template>
    </fd-table>
    <fd-detail ref="detail" />
    <fd-upsert ref="upsert" />
  </fd-crud>
</template>

<script setup lang="ts">
import type { TableDict } from "@/components/fd-table/type"
import { CrudMockService } from "../mockService"
import { useCrud, useTable, useDetail, useSearch, useUpsert } from "@/hooks"

defineOptions({ name: "basic-crud" })

const service = new CrudMockService()

const crud = useCrud({
  service,
  permission: { add: true, update: true, delete: true, detail: true, import: true, export: true }, // 启用所有权限
}, crud => crud.refresh())

// 字典定义
const occupationDict: TableDict[] = [
  { label: "研发", value: 1, type: "primary" },
  { label: "产品", value: 2, type: "success" },
  { label: "运营", value: 3, type: "warning" },
  { label: "销售", value: 4, type: "danger" },
  { label: "客服", value: 5, type: "info" },
]

const statusDict: TableDict[] = [
  { label: "启用", value: 1, type: "success" },
  { label: "禁用", value: 0, type: "danger" },
]

// 搜索配置
const search = useSearch({
  grid: { cols: 3 },
  items: [
    {
      field: "keyword",
      label: "关键词",
      component: { is: "el-input", props: { placeholder: "姓名/账号/手机号" } },
    },
    {
      field: "occupation",
      label: "岗位",
      component: {
        is: "el-select",
        props: { placeholder: "全部岗位", clearable: true },
        options: occupationDict,
      },
    },
    {
      field: "status",
      label: "状态",
      component: {
        is: "el-select",
        props: { placeholder: "全部状态", clearable: true },
        options: statusDict,
      },
    },
    {
      field: "account",
      label: "账号",
      component: { is: "el-input", props: { placeholder: "账号" } },
    },
    {
      field: "phone",
      label: "手机号",
      component: { is: "el-input", props: { placeholder: "手机号" } },
    },
    {
      field: "createTimeRange",
      label: "入职时间",
      component: {
        is: "el-date-picker",
        props: {
          type: "daterange",
          rangeSeparator: "至",
          startPlaceholder: "开始日期",
          endPlaceholder: "结束日期",
          valueFormat: "YYYY-MM-DD",
        },
      },
    },
  ],
})

// 表格配置
const table = useTable({
  columns: [
    { type: "selection" },
    { prop: "name", label: "姓名", help: "这是姓名", minWidth: 100 },
    { prop: "account", label: "账号", minWidth: 120 },
    { prop: "phone", label: "手机号", minWidth: 140 },
    { prop: "occupation", label: "岗位", dict: occupationDict, width: 100 },
    { prop: "wages", label: "薪资", help: "这是薪资", sortable: "custom", minWidth: 100, formatter: (row: any) => row.wages != null ? `¥${Number(row.wages).toLocaleString()}` : "-" },
    { prop: "status", label: "状态", dict: statusDict, width: 80 },
    { prop: "createTime", label: "入职时间", minWidth: 120 },
    {
      type: "action",
      label: "操作",
      width: 150,
      fixed: "right",
      actions: [
        { text: "详情", type: "detail" },
        { text: "编辑", type: "update" },
        { text: "删除", type: "delete" },
      ],
    },
  ],
})

// 详情配置
const detail = useDetail({
  items: [
    { field: "name", label: "姓名" },
    { field: "account", label: "账号" },
    { field: "phone", label: "手机号" },
    { field: "occupation", label: "岗位", dict: occupationDict },
    { field: "wages", label: "薪资" },
    { field: "status", label: "状态", dict: statusDict },
    { field: "createTime", label: "入职时间" },
    { field: "remark", label: "备注", span: 2 },
  ],
})

// 新增/编辑配置
const upsert = useUpsert({
  form: { labelWidth: "100px" },
  items: [
    { prop: "name", label: "姓名", required: true, component: { is: "el-input" } },
    { prop: "account", label: "账号", required: true, component: { is: "el-input" } },
    {
      prop: "phone",
      label: "手机号",
      required: true,
      component: { is: "el-input" },
      rules: [{ pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" }],
    },
    {
      prop: "occupation",
      label: "岗位",
      required: true,
      component: { is: "el-select", props: { style: "width: 100%" }, options: occupationDict },
    },
    {
      prop: "wages",
      label: "薪资",
      component: { is: "el-input-number", props: { min: 0, style: "width: 100%" } },
    },
    {
      prop: "status",
      label: "状态",
      component: { is: "el-switch", props: { activeValue: 1, inactiveValue: 0 } },
      value: 1, // 默认值
    },
    {
      prop: "remark",
      label: "备注",
      span: 2,
      component: { is: "el-input", props: { type: "textarea", rows: 3 } },
    },
  ],
})
</script>
