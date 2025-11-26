<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      基础下拉
    </h4>
    <p class="demo-card__desc">
      使用静态选项，支持清空与多选。
    </p>

    <fd-select v-model="value" :options="options" clearable placeholder="请选择用户" style="width: 240px" />
    <div class="select-value">
      当前值：{{ value }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue"

defineOptions({
  name: "basic-select-demo",
})

const value = ref()
const options = [
  { label: "楚行云", value: "chuxingyun" },
  { label: "秦尘", value: "qincheng" },
  { label: "唐三", value: "tangsan" },
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
