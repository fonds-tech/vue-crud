<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      基础详情
    </h4>
    <p class="demo-card__desc">
      两列布局，展示常规字段与默认格式化。
    </p>

    <el-button type="primary" @click="openDetail">
      查看详情
    </el-button>

    <fd-detail ref="detailRef" />
  </section>
</template>

<script setup lang="ts">
import type { DetailRef } from "@/components/fd-detail/type"
import { ref, onMounted } from "vue"

defineOptions({
  name: "basic-detail-demo",
})

const detailRef = ref<DetailRef>()

const items = [
  { field: "name", label: "姓名" },
  { field: "account", label: "账号" },
  { field: "status", label: "状态", formatter: (value: number) => (value ? "启用" : "禁用") },
  { field: "createTime", label: "创建时间" },
  { field: "remark", label: "备注", span: 2 },
]

const mockData = {
  name: "楚行云",
  account: "chuxingyun",
  status: 1,
  createTime: "2021-01-01",
  remark: "这是一个基础详情示例，展示默认两列布局。",
}

onMounted(() => {
  detailRef.value?.use({
    items,
    dialog: { width: "720px" },
    descriptions: { column: 2 },
  })
})

function openDetail() {
  detailRef.value?.setData(mockData)
  detailRef.value?.detail(mockData)
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
