<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      基础级联
    </h4>
    <p class="demo-card__desc">
      静态层级数据，多选与清空支持。
    </p>

    <fd-cascader
      v-model="value"
      :options="options"
      clearable
      placeholder="选择地区"
      style="width: 260px"
    />
    <div class="select-value">
      当前值：{{ value }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue"

defineOptions({
  name: "basic-cascader-demo",
})

const value = ref<string[]>([])

const options = [
  {
    label: "华北",
    value: "north",
    children: [
      { label: "北京", value: "beijing" },
      { label: "天津", value: "tianjin" },
    ],
  },
  {
    label: "华东",
    value: "east",
    children: [
      { label: "上海", value: "shanghai" },
      { label: "浙江", value: "zhejiang" },
    ],
  },
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
