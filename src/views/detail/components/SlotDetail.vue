<template>
  <!-- eslint-disable vue/no-unused-refs -->
  <fd-crud ref="crudRef">
    <fd-table ref="tableRef" />
    <fd-detail ref="detailRef">
      <template #status="{ value }">
        <el-tag :type="value ? 'success' : 'danger'">
          {{ value ? "启用" : "禁用" }}
        </el-tag>
      </template>
      <template #group-extra="{ group }">
        <el-tag effect="plain" size="small">
          {{ group.title }}
        </el-tag>
      </template>
      <template #footer>
        <div class="slot-footer">
          <el-button @click="close">
            取消
          </el-button>
          <el-button type="primary" @click="close">
            知道了
          </el-button>
        </div>
      </template>
    </fd-detail>
  </fd-crud>
</template>

<script setup lang="ts">
import type { TableColumn } from "@/components/table/type"
import type { DetailUseOptions } from "@/components/detail/types"
import { DetailMockService } from "../mockService"
import { useCrud, useTable, useDetail } from "@/hooks"

defineOptions({
  name: "slot-detail-demo",
})

const options: DetailUseOptions = {
  dialog: { width: "780px", title: "设备详情" },
  descriptions: { column: 2 },
  groups: [
    { name: "basic", title: "基础信息", descriptions: { slots: { title: () => "基础信息" } } },
    { name: "meta", title: "扩展属性", descriptions: { slots: { title: () => "扩展属性" } } },
  ],
  items: [
    { prop: "name", label: "名称", group: "basic" },
    { prop: "account", label: "账号", group: "basic" },
    { prop: "status", label: "状态", component: { slot: "status" }, group: "basic" },
    { prop: "manager", label: "负责人", group: "basic" },
    { prop: "remark", label: "备注", span: 2, group: "meta" },
    {
      prop: "tags",
      label: "标签",
      span: 2,
      group: "meta",
      formatter: (value?: string[]) => (value ?? []).join(" / "),
    },
  ],
  slots: () => ({
    // 分组标题附加信息
    title: "group-extra",
  }),
}

const columns: TableColumn[] = [
  { prop: "name", label: "名称" },
  { prop: "account", label: "账号" },
  {
    prop: "status",
    label: "状态",
    formatter: (row: any) => (row.status ? "启用" : "禁用"),
  },
  {
    type: "action",
    label: "操作",
    actions: [{ text: "详情", type: "detail" }],
  },
]

const crudRef = useCrud({
  service: new DetailMockService(),
}, crud => crud.refresh())

const tableRef = useTable({
  columns,
})

const detailRef = useDetail(options)

function close() {
  detailRef.value?.close()
}
</script>

<style scoped lang="scss">
.slot-footer {
  gap: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
