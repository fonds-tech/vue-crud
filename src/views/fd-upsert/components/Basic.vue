<template>
  <fd-crud ref="crud">
    <fd-table ref="table" />
    <fd-upsert ref="upsert" />
  </fd-crud>
</template>

<script setup lang="ts">
import { UpsertMockService } from "../mockService"
import { useCrud, useTable, useUpsert } from "@/hooks"

defineOptions({ name: "basic-upsert" })

const crud = useCrud({
  service: new UpsertMockService(),
}, crud => crud.refresh())

const table = useTable({
  columns: [
    { prop: "name", label: "姓名", minWidth: 140 },
    {
      prop: "status",
      label: "状态",
      width: 100,
      dict: [
        { label: "启用", value: 1, type: "success" },
        { label: "停用", value: 0, type: "info" },
      ],
    },
    { prop: "remark", label: "备注", minWidth: 180 },
    {
      type: "action",
      label: "操作",
      width: 120,
      actions: [
        { text: "编辑", type: "update" },
      ],
    },
  ],
})

const upsert = useUpsert({
  form: { labelWidth: "88px" },
  grid: { cols: 2 },
  items: [
    { field: "name", label: "姓名", component: { is: "el-input", props: { placeholder: "请输入姓名" } } },
    { field: "status", label: "状态", component: { is: "el-switch", props: { activeValue: 1, inactiveValue: 0 } } },
    { field: "remark", label: "备注", span: 2, component: { is: "el-input", props: { type: "textarea", rows: 3 } } },
  ],
  onSubmit: async (data) => {
    console.log("submit", data)
    await crud.value?.refresh()
    return true
  },
})
</script>
