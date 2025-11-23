<template>
  <div class="demo-page">
    <h1 class="demo-title">
      CRUD DEMO
    </h1>

    <fd-crud ref="crud">
      <template #default>
        <fd-search ref="search" />

        <fd-table ref="table">
          <template #toolbar>
            <fd-add-button />
            <fd-delete-button />
            <div class="demo-toolbar__spacer"></div>
            <el-button type="primary" @click="handleExport">
              <el-icon><download /></el-icon>
              导出
            </el-button>
          </template>
        </fd-table>

        <fd-detail ref="detail" />
      </template>
    </fd-crud>
  </div>
</template>

<script setup lang="ts">
import type { SearchOptions } from "@/components/fd-search/type"
import type { TableUseOptions } from "@/components/fd-table/type"
import type { DetailUseOptions } from "@/components/fd-detail/type"
import { h } from "vue"
import { Download } from "@element-plus/icons-vue"
import { TestService } from "@/utils/test"
import { useCrud, useTable, useDetail, useSearch } from "@/hooks"

const crud = useCrud(
  {
    service: new TestService(),
    permission: { add: true, delete: true, update: true, detail: true },
  },
  instance => instance.refresh(),
)

const searchOptions: SearchOptions = {
  model: {
    keyword: "",
    status: "",
    occupation: "",
  },
  row: { gutter: 16, collapsedRows: 2 },
  col: { span: 8 },
  items: [
    {
      field: "keyword",
      label: "关键词",
      component: {
        is: "el-input",
        props: { placeholder: "输入姓名或手机号", clearable: true },
      },
    },
    {
      field: "status",
      label: "状态",
      component: {
        is: "el-select",
        props: { placeholder: "全部状态", clearable: true },
        slots: {
          default: () => [
            h("el-option", { label: "启用", value: 1 }),
            h("el-option", { label: "禁用", value: 0 }),
          ],
        },
      },
    },
    {
      field: "occupation",
      label: "岗位",
      component: {
        is: "el-select",
        props: { placeholder: "选择岗位", clearable: true },
        slots: {
          default: () => [
            h("el-option", { label: "研发", value: 1 }),
            h("el-option", { label: "产品", value: 2 }),
            h("el-option", { label: "运营", value: 3 }),
          ],
        },
      },
    },
  ],
  action: {
    row: { gutter: 12, justify: "end" },
    col: { span: 6 },
    items: [
      { type: "search", text: "搜索" },
      { type: "reset", text: "重置" },
      {
        component: {
          is: "el-button",
          props: { text: true, type: "primary" },
          slots: {
            default: () => "清空条件",
          },
          on: {
            click: () => crud.value?.setParams({}),
          },
        },
      },
    ],
  },
}

const tableOptions: TableUseOptions = {
  table: {
    border: true,
    stripe: true,
  },
  columns: [
    { prop: "name", label: "姓名", minWidth: 140 },
    { prop: "account", label: "账号", minWidth: 140 },
    { prop: "createTime", label: "创建日期", minWidth: 160 },
    {
      prop: "status",
      label: "状态",
      dict: [
        { label: "启用", value: 1, type: "success" },
        { label: "禁用", value: 0, type: "danger" },
      ],
    },
    { prop: "wages", label: "薪资", minWidth: 120 },
    { prop: "phone", label: "手机号", minWidth: 160 },
    {
      type: "action",
      actions: () => [
        { text: "详情", type: "detail" },
        { text: "编辑", type: "update" },
        { text: "删除", type: "delete" },
      ],
    },
  ],
}

const detailOptions: DetailUseOptions = {
  items: [
    { label: "姓名", field: "name", span: 2 },
    { label: "账号", field: "account", span: 2 },
    { label: "薪资", field: "wages", span: 2 },
    { label: "手机号", field: "phone", span: 2 },
    { label: "入职时间", field: "createTime", span: 2 },
    {
      label: "状态",
      field: "status",
      component: {
        is: () => "el-tag",
        props: (data: any) => ({ type: data.status ? "success" : "danger" }),
        slots: {
          default: (data: any) => () => (data.status ? "启用" : "禁用"),
        },
      },
    },
  ],
  groups: [
    { name: 1, title: "基础信息" },
  ],
}

const search = useSearch(searchOptions)
const table = useTable(tableOptions)
const detail = useDetail(detailOptions)

function handleExport() {
  console.log("导出当前筛选结果:", search.value?.model)
  console.log("当前表格选中:", table.value?.selection)
}
</script>

<style scoped>
.demo-page {
  gap: 16px;
  display: flex;
  padding: 24px;
  flex-direction: column;
}

.demo-title {
  margin: 0;
  font-size: 28px;
  text-align: center;
  font-weight: 600;
}

.demo-toolbar__spacer {
  flex: 1;
}
</style>
