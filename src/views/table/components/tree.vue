<template>
  <fd-crud ref="crud">
    <fd-table ref="table" />
  </fd-crud>
</template>

<script setup lang="ts">
import { TableMockService } from "../mockService"
import { useCrud, useTable } from "@/hooks"

defineOptions({ name: "tree-table" })

const service = new TableMockService()

const crud = useCrud(
  {
    service: {
      page: service.treePage,
    },
  },
  crud => crud.refresh(),
)

const table = useTable({
  table: {
    rowKey: "id",
    defaultExpandAll: true,
    border: true,
    treeProps: { children: "children", hasChildren: "hasChildren" },
  },
  columns: [
    { prop: "name", label: "部门/职位", minWidth: 200, align: "left" },
    { prop: "leader", label: "负责人", width: 120 },
    { prop: "count", label: "人数", width: 100 },
  ],
})
</script>
