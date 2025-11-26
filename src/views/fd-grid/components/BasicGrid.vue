<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      基础栅格
    </h4>
    <p class="demo-card__desc">
      演示 cols 与行/列间距，内容自适应等宽。
    </p>

    <fd-grid :cols="3" :row-gap="12" :col-gap="12">
      <fd-grid-item v-for="i in 6" :key="i">
        <div class="grid-box">
          单元 {{ i }}
        </div>
      </fd-grid-item>
    </fd-grid>
  </section>
</template>

<script setup lang="ts">
defineOptions({
  name: "basic-grid-demo",
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
