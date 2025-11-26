<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      基础 CRUD
    </h4>
    <p class="demo-card__desc">
      组合 fd-search、fd-table、fd-detail、fd-upsert 展示完整流程。
    </p>

    <fd-crud ref="crudRef">
      <template #default>
        <fd-search ref="searchRef" />
        <fd-table ref="tableRef" />
        <fd-detail ref="detailRef" />
        <fd-upsert ref="upsertRef" />
      </template>
    </fd-crud>
  </section>
</template>

<script setup lang="ts">
import type { CrudRef } from "@/types"
import type { SearchOptions } from "@/components/fd-search/type"
import type { TableUseOptions } from "@/components/fd-table/type"
import type { DetailUseOptions } from "@/components/fd-detail/type"
import type { UpsertUseOptions } from "@/components/fd-upsert/type"
import { h, ref, onMounted } from "vue"

defineOptions({
  name: "basic-crud-demo",
})

const crudRef = ref<CrudRef>()
const searchRef = ref()
const tableRef = ref()
const detailRef = ref()
const upsertRef = ref()

const mockService = {
  async page() {
    return {
      list: [
        { id: 1, name: "楚行云", status: 1, account: "chuxingyun" },
        { id: 2, name: "秦尘", status: 0, account: "qincheng" },
      ],
      pagination: { total: 2, page: 1, size: 20 },
    }
  },
  async detail() {
    return { name: "楚行云", status: 1, account: "chuxingyun", remark: "基础 CRUD 示例数据" }
  },
  async add() {
    return true
  },
  async update() {
    return true
  },
  async delete() {
    return true
  },
}

const dict = {
  api: { page: "page", list: "page", detail: "detail", add: "add", update: "update", delete: "delete" },
  label: { list: "列表", detail: "详情", add: "新增", update: "编辑", delete: "删除", confirm: "确定", close: "关闭", tips: "提示", deleteConfirm: "确认删除？", deleteSuccess: "删除成功" },
  primaryId: "id",
}

const searchOptions: SearchOptions = {
  items: [
    { field: "name", label: "姓名", component: { is: "el-input", props: { placeholder: "输入姓名" } } },
    {
      field: "status",
      label: "状态",
      component: {
        is: "el-select",
        props: { placeholder: "状态" },
        slots: {
          default: () => [h("el-option", { label: "启用", value: 1 }), h("el-option", { label: "禁用", value: 0 })],
        },
      },
    },
  ],
}

const tableOptions: TableUseOptions = {
  columns: [
    { prop: "name", label: "姓名", minWidth: 120 },
    { prop: "account", label: "账号", minWidth: 120 },
    { prop: "status", label: "状态", dict: [{ label: "启用", value: 1, type: "success" }, { label: "禁用", value: 0, type: "danger" }] },
    { type: "action", actions: () => [{ text: "详情", type: "detail" }, { text: "编辑", type: "update" }, { text: "删除", type: "delete" }] },
  ],
}

const detailOptions: DetailUseOptions = {
  items: [
    { field: "name", label: "姓名" },
    { field: "account", label: "账号" },
    { field: "status", label: "状态", formatter: v => (v ? "启用" : "禁用") },
    { field: "remark", label: "备注", span: 2 },
  ],
}

const upsertOptions: UpsertUseOptions = {
  form: { labelWidth: "88px" },
  grid: { cols: 2 },
  items: [
    { field: "name", label: "姓名", required: true, component: { is: "el-input", props: { placeholder: "请输入姓名" } } },
    { field: "status", label: "状态", component: { is: "el-switch", props: { activeValue: 1, inactiveValue: 0 } } },
    { field: "account", label: "账号", required: true, component: { is: "el-input", props: { placeholder: "请输入账号" } } },
    { field: "remark", label: "备注", span: 2, component: { is: "el-input", props: { type: "textarea", rows: 3 } } },
  ],
}

onMounted(() => {
  crudRef.value?.use?.({
    dict,
    service: mockService as any,
    permission: { add: true, update: true, delete: true },
  })
  searchRef.value?.use?.(searchOptions)
  tableRef.value?.use?.(tableOptions)
  detailRef.value?.use?.(detailOptions)
  upsertRef.value?.use?.(upsertOptions)
  crudRef.value?.refresh()
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
