<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      响应式与折叠
    </h4>
    <p class="demo-card__desc">
      使用 collapse 控制最大行数，cols 配合断点变化。
    </p>

    <fd-grid :cols="{ xs: 1, sm: 2, md: 3 }" :gap="12" :collapse="2">
      <fd-grid-item v-for="i in 8" :key="i">
        <div class="grid-box">
          内容 {{ i }}
        </div>
      </fd-grid-item>
    </fd-grid>
  </section>
</template>

<script setup lang="ts">
defineOptions({
  name: "responsive-grid-demo",
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

.grid-box {
  border: 1px dashed var(--card-border);
  padding: 12px;
  background: var(--el-fill-color-lighter);
  text-align: center;
  border-radius: 8px;
}
</style>
