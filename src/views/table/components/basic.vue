<template>
  <fd-crud ref="crud">
    <fd-table ref="table" />
  </fd-crud>
</template>

<script setup lang="ts">
import type { TableDict } from "@/components/table/types"
import { TableMockService } from "../mockService"
import { useCrud, useTable } from "@/hooks"

defineOptions({ name: "basic-table" })

const crud = useCrud(
  {
    service: new TableMockService(),
  },
  crud => crud.refresh(),
)

const statusDict: TableDict[] = [
  { label: "启用", value: 1, type: "success" },
  { label: "禁用", value: 0, type: "danger" },
]

const table = useTable({
  name: "basic-table",
  table: { border: true, stripe: true, rowKey: "id" },
  columns: [
    { prop: "name", label: "姓名", minWidth: 120 },
    { prop: "account", label: "账号", minWidth: 140 },
    { prop: "status", label: "状态", dict: statusDict },
    { prop: "role", label: "角色", minWidth: 100 },
    { prop: "department", label: "部门", minWidth: 120 },
    { prop: "email", label: "邮箱", minWidth: 180, show: true },
    { prop: "phone", label: "手机号", minWidth: 140, show: true },
    { prop: "address", label: "地址", minWidth: 200, show: true },
    { prop: "amount", label: "额度", minWidth: 100 },
    { prop: "progress", label: "进度(%)", minWidth: 100 },
    { prop: "createTime", label: "创建时间", minWidth: 160 },
    {
      type: "action",
      label: "操作",
      fixed: "right",
      actions: [
        { text: "编辑", type: "detail" },
        { text: "删除", type: "delete" },
      ],
    },
  ],
})
</script>
