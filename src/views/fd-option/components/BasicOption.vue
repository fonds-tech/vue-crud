<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      基础选项渲染
    </h4>
    <p class="demo-card__desc">
      fd-option 用于快速渲染 el-select 选项。
    </p>

    <el-select v-model="value" placeholder="请选择" clearable style="width: 220px">
      <fd-option :options="options" />
    </el-select>
    <div class="select-value">
      当前值：{{ value }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue"

defineOptions({
  name: "basic-option-demo",
})

const value = ref()
const options = [
  { label: "选项 A", value: "a" },
  { label: "选项 B", value: "b" },
  { label: "选项 C", value: "c" },
]
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

.select-value {
  color: var(--text-sub);
  margin-top: 8px;
}
</style>
