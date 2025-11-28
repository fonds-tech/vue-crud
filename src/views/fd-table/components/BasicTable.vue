<template>
  <fd-crud ref="crud">
    <fd-table ref="table" />
  </fd-crud>
</template>

<script setup lang="ts">
import type { TableDict } from "@/components/fd-table/type"
import { TableMockService } from "../mockService"
import { useCrud, useTable } from "@/hooks"

defineOptions({ name: "basic-table" })

const crud = useCrud({
  service: new TableMockService(),
}, crud => crud.refresh())

const statusDict: TableDict[] = [
  { label: "启用", value: 1, type: "success" },
  { label: "禁用", value: 0, type: "danger" },
]

const table = useTable(
  {
    table: { border: true, stripe: true, rowKey: "id" },
    columns: [
      { prop: "name", label: "姓名", minWidth: 120 },
      { prop: "account", label: "账号", minWidth: 140 },
      { prop: "status", label: "状态", dict: statusDict },
      { prop: "createTime", label: "创建时间", minWidth: 160 },
    ],
  },
)
</script>
