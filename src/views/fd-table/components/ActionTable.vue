<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      操作列与自定义单元格
    </h4>
    <p class="demo-card__desc">
      演示操作列、具名插槽渲染和自定义事件处理。
    </p>

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
  </section>
</template>

<script setup lang="ts">
import type { TableAction, TableColumn, TableExpose } from "@/components/fd-table/type"
import { ElMessage } from "element-plus"
import { ref, onMounted } from "vue"

defineOptions({
  name: "action-table-demo",
})

const tableRef = ref<TableExpose>()

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

const rows = [
  { id: 1, name: "韩立", account: "hanli", status: 1 },
  { id: 2, name: "唐三", account: "tangsan", status: 0 },
  { id: 3, name: "王林", account: "wanglin", status: 1 },
]

function handleView(row: any) {
  ElMessage.info(`查看：${row.name}`)
}

function handleEdit(row: any) {
  ElMessage.success(`编辑：${row.account}`)
}

onMounted(() => {
  tableRef.value?.use({
    table: { border: true, size: "small", rowKey: "id" },
    columns,
  })
  tableRef.value?.setData(rows)
})
</script>

<style scoped lang="scss">
.demo-card {
  border: 1px solid var(--card-border);
  padding: 16px;
  background: var(--card-bg);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);

  &__title {
    margin: 0 0 4px 0;
  }

  &__desc {
    color: var(--text-sub);
    margin: 0 0 12px 0;
  }
}
</style>
