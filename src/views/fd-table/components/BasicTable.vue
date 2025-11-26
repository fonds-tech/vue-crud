<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      基础表格
    </h4>
    <p class="demo-card__desc">
      展示边框、斑马纹与分页区间信息，使用本地数据。
    </p>

    <fd-table ref="tableRef" />
  </section>
</template>

<script setup lang="ts">
import type { TableExpose } from "@/components/fd-table/type"
import { ref, onMounted } from "vue"

defineOptions({
  name: "basic-table-demo",
})

const tableRef = ref<TableExpose>()

const columns = [
  { prop: "name", label: "姓名", minWidth: 120 },
  { prop: "account", label: "账号", minWidth: 140 },
  { prop: "status", label: "状态", dict: [{ label: "启用", value: 1, type: "success" }, { label: "禁用", value: 0, type: "danger" }] },
  { prop: "createTime", label: "创建时间", minWidth: 160 },
]

const rows = [
  { id: 1, name: "楚行云", account: "chuxingyun", status: 1, createTime: "2021-01-01" },
  { id: 2, name: "秦尘", account: "qincheng", status: 0, createTime: "2021-02-11" },
  { id: 3, name: "叶凡", account: "yefan", status: 1, createTime: "2021-03-21" },
  { id: 4, name: "白小纯", account: "baixiaochun", status: 1, createTime: "2021-04-10" },
]

onMounted(() => {
  tableRef.value?.use({
    table: { border: true, stripe: true, rowKey: "id" },
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
