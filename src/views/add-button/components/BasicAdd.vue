<template>
  <section class="demo-card">
    <h4 class="demo-card__title">基础新增按钮</h4>
    <p class="demo-card__desc">依赖 crud 权限，点击触发 rowAdd。</p>

    <fd-crud ref="crudRef">
      <fd-add-button />
    </fd-crud>
  </section>
</template>

<script setup lang="ts">
import { useCrud } from "@/hooks"

defineOptions({
  name: "basic-add-button-demo",
})

const crudRef = useCrud({
  permission: { add: true },
  dict: { label: { add: "新增" } } as any,
  // 模拟 service，避免真实请求
  service: {
    async page() {
      return { list: [], pagination: { total: 0, page: 1, size: 20 } }
    },
  },
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
