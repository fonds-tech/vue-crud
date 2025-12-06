<template>
  <fd-crud ref="crud">
    <fd-table ref="table" @sort-change="handleSortChange">
      <!-- 自定义进度条列 -->
      <template #progress="{ row }">
        <el-progress :percentage="row.progress" :status="row.progress > 80 ? 'success' : row.progress < 50 ? 'exception' : ''" />
      </template>

      <!-- 自定义金额列 -->
      <template #amount="{ row }">
        <span style="color: #67c23a; font-weight: bold">¥ {{ Number(row.amount).toLocaleString() }}</span>
      </template>
    </fd-table>
  </fd-crud>
</template>

<script setup lang="ts">
import { TableMockService } from "../mockService"
import { useCrud, useTable } from "@/hooks"

defineOptions({ name: "complex-table" })

const crud = useCrud({
  service: new TableMockService(),
}, crud => crud.refresh())

const table = useTable({
  table: {
    border: true,
    stripe: true,
    height: 400, // Fixed height for scroll
  },
  columns: [
    { prop: "id", label: "ID", width: 80, fixed: "left", sortable: "custom" },
    { prop: "name", label: "姓名", width: 120, fixed: "left" },
    { prop: "amount", label: "金额", width: 150, sortable: "custom", component: { slot: "amount" } },
    { prop: "progress", label: "进度", width: 200, component: { slot: "progress" } },
    { prop: "department", label: "部门", width: 120 },
    { prop: "role", label: "角色", width: 120, dict: [
      { value: 0, label: "Developer", type: "default" },
      { value: 1, label: "Designer", type: "success" },
      { value: 2, label: "Manager", type: "warning" },
      { value: 3, label: "Tester", type: "info" },
    ] },
    { prop: "phone", label: "手机号", width: 150 },
    { prop: "email", label: "邮箱", width: 200 },
    { prop: "address", label: "地址", minWidth: 300 },
    {
      type: "action",
      label: "操作",
      width: 150,
      fixed: "right",
      actions: [
        { text: "查看", type: "detail" },
        { text: "编辑", type: "update" },
      ],
    },
  ],
})

function handleSortChange({ prop, order }: { prop: string, order: string }) {
  crud.value?.setParams({ sortProp: prop, sortOrder: order })
  crud.value?.refresh()
}
</script>
