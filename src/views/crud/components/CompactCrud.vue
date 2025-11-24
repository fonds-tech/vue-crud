<template>
  <el-card class="crud-card">
    <fd-crud ref="crud">
      <template #default>
        <fd-search ref="search" />

        <fd-table ref="table">
          <template #toolbar>
            <fd-add-button />
            <div class="toolbar-spacer"></div>
            <el-button type="primary" text @click="handleExport">
              <el-icon><download /></el-icon>
              导出
            </el-button>
          </template>
        </fd-table>
      </template>
    </fd-crud>
  </el-card>
</template>

<script setup lang="ts">
import type { SearchOptions } from "@/components/fd-search/type"
import type { TableUseOptions } from "@/components/fd-table/type"
import { Download } from "@element-plus/icons-vue"
import { onMounted } from "vue"
import { TestService } from "@/utils/test"
import { useCrud, useTable, useSearch } from "@/hooks"

const crud = useCrud({
  service: new TestService(),
  permission: { add: true, delete: true, update: true, page: true },
})

const searchOptions: SearchOptions = {
  model: {
    keyword: "",
    status: "",
  },
  row: { gutter: 12, collapsedRows: 1 },
  col: { span: 12 },
  items: [
    {
      field: "keyword",
      label: "关键词",
      component: { is: "el-input", props: { placeholder: "模糊搜索", clearable: true } },
    },
    {
      field: "status",
      label: "状态",
      component: {
        is: "el-select",
        props: { clearable: true, placeholder: "全部" },
        options: [
          { label: "启用", value: 1 },
          { label: "禁用", value: 0 },
        ],
      },
    },
  ],
  action: {
    row: { gutter: 8, justify: "end" },
    col: { span: 6 },
    items: [
      { type: "search", text: "查询" },
      { type: "reset", text: "清空" },
    ],
  },
}

const tableOptions: TableUseOptions = {
  table: {
    border: false,
    stripe: true,
    size: "small",
  },
  columns: [
    { prop: "name", label: "姓名" },
    { prop: "account", label: "账号" },
    { prop: "status", label: "状态" },
    { prop: "createTime", label: "创建日期" },
    {
      type: "action",
      width: 160,
      actions: () => [
        { text: "详情", type: "detail" },
        { text: "编辑", type: "update" },
      ],
    },
  ],
}

const search = useSearch(searchOptions)
const table = useTable(tableOptions)

onMounted(() => {
  crud.value?.refresh()
})

function handleExport() {
  console.log("导出当前筛选结果:", search.value?.model)
  console.log("当前表格选中:", table.value?.selection)
}
</script>

<style scoped>
.crud-card {
  border: none;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
  border-radius: 20px;
}

.toolbar-spacer {
  flex: 1;
}
</style>
