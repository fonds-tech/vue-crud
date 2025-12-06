<template>
  <fd-crud ref="crudRef">
    <fd-table ref="tableRef">
      <template #status="{ row }">
        <el-tag :type="row.status ? 'success' : 'danger'" size="small">
          {{ row.status ? "启用" : "禁用" }}
        </el-tag>
      </template>
      <template #actionSlots="{ row }">
        <el-link type="primary" @click="handleView(row)">
          查看
        </el-link>
        <el-link type="warning" @click="handleEdit(row)">
          编辑
        </el-link>
      </template>
    </fd-table>
  </fd-crud>
</template>

<script setup lang="ts">
import type { TableAction, TableColumn } from "@/components/table/type"
import { ElMessage } from "element-plus"
import { TableMockService } from "../mockService"
import { useCrud, useTable } from "@/hooks"

defineOptions({
  name: "action-table",
})

const crudRef = useCrud({
  service: new TableMockService(),
}, crud => crud.refresh())

const actionColumn: TableColumn = {
  type: "action",
  label: "操作",
  width: 200,
  actions: _scope =>
    [
      { text: "内置详情", type: "detail" } as TableAction,
      { text: "自定义", component: { slot: "actionSlots" } },
    ],
}

const columns: TableColumn[] = [
  { prop: "name", label: "姓名", minWidth: 120 },
  { prop: "account", label: "账号", minWidth: 120 },
  { prop: "status", label: "状态", component: { slot: "status" } },
  actionColumn,
]

const tableRef = useTable(
  {
    table: { border: true, size: "small", rowKey: "id" },
    columns,
  },
)

function handleView(row: any) {
  ElMessage.info(`查看：${row.name}`)
}

function handleEdit(row: any) {
  ElMessage.success(`编辑：${row.account}`)
}
</script>
