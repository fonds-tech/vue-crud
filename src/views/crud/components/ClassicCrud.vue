<template>
  <el-card class="crud-card">
    <fd-crud ref="crud">
      <template #default>
        <fd-search ref="search" />

        <fd-table ref="table">
          <template #toolbar>
            <fd-add-button />
            <fd-delete-button />
            <fd-import
              class="toolbar-import"
              title="批量导入"
              :upload="handleMockUpload"
              :confirm="handleImportConfirm"
              :template="createImportTemplate"
              tip="支持 Excel/CSV 文件，一次上传 1 个文件。"
            >
              <template #result="{ data }">
                <el-alert
                  class="import-alert"
                  type="success"
                  :title="`解析成功 ${data.success ?? 0} 条，失败 ${data.fail ?? 0} 条`"
                  :closable="false"
                >
                  <p>文件编号：{{ data.fileKey }}</p>
                  <p>可点击“确认导入”写入数据并自动刷新列表。</p>
                </el-alert>
              </template>
            </fd-import>
            <div class="toolbar-spacer"></div>
            <el-button type="primary" @click="handleExport">
              <el-icon><download /></el-icon>
              导出
            </el-button>
          </template>
        </fd-table>

        <fd-detail ref="detail" />
      </template>
    </fd-crud>
  </el-card>
</template>

<script setup lang="ts">
import type { SearchOptions } from "@/components/fd-search/type"
import type { TableUseOptions } from "@/components/fd-table/type"
import type { DetailUseOptions } from "@/components/fd-detail/type"
import { Download } from "@element-plus/icons-vue"
import { TestService } from "@/utils/test"
import { h, onMounted } from "vue"
import { useCrud, useTable, useDetail, useSearch } from "@/hooks"

const crud = useCrud(
  {
    service: new TestService(),
    permission: { add: true, delete: true, update: true, detail: true },
  },
)

const searchOptions: SearchOptions = {
  model: {
    keyword: "",
    status: "",
    occupation: "",
  },
  grid: { cols: 4, colGap: 12, rowGap: 12, collapsedRows: 2 },
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
    grid: { cols: 2, colGap: 12, rowGap: 12 },
    items: [
      { type: "search", text: "搜索" },
      { type: "reset", text: "重置" },
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

onMounted(() => {
  crud.value?.refresh()
})

function handleExport() {
  console.log("导出当前筛选结果:", search.value?.model)
  console.log("当前表格选中:", table.value?.selection)
}

async function handleMockUpload() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          fileKey: `mock-${Date.now()}`,
          success: 8,
          fail: 2,
          message: "解析完成，请确认导入。",
        },
      })
    }, 1000)
  })
}

async function handleImportConfirm(payload: Record<string, any> | null) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("确认导入数据:", payload)
      resolve(payload)
    }, 800)
  })
}

async function createImportTemplate() {
  const csv = "name,phone,status\n张三,13800000000,启用\n李四,13900000000,禁用"
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return { url }
}
</script>

<style scoped>
.crud-card {
  border: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);
}

.toolbar-spacer {
  flex: 1;
}

.toolbar-import {
  margin-left: 12px;
}

.import-alert {
  margin-top: 12px;
}
</style>
