<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      基础新增/编辑
    </h4>
    <p class="demo-card__desc">
      展示 fd-upsert 打开、提交与模式切换。
    </p>

    <el-space>
      <el-button type="primary" @click="openCreate">
        打开新增
      </el-button>
      <el-button @click="openEdit">
        打开编辑
      </el-button>
    </el-space>

    <fd-upsert ref="upsertRef" />
  </section>
</template>

<script setup lang="ts">
import type { UpsertRef } from "@/components/fd-upsert/type"
import { ref, onMounted } from "vue"

defineOptions({
  name: "basic-upsert-demo",
})

const upsertRef = ref<UpsertRef>()

const items = [
  { field: "name", label: "姓名", component: { is: "el-input", props: { placeholder: "请输入姓名" } } },
  { field: "status", label: "状态", component: { is: "el-switch", props: { activeValue: 1, inactiveValue: 0 } } },
  { field: "remark", label: "备注", span: 2, component: { is: "el-input", props: { type: "textarea", rows: 3 } } },
]

onMounted(() => {
  upsertRef.value?.use({
    form: { labelWidth: "88px" },
    grid: { cols: 2 },
    items,
    onSubmit: async (data) => {
      console.log("submit", data)
      return true
    },
  })
})

function openCreate() {
  upsertRef.value?.open({ mode: "create" })
}

function openEdit() {
  upsertRef.value?.open({ mode: "update", row: { name: "已存在用户", status: 1, remark: "编辑模式示例" } })
}
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
