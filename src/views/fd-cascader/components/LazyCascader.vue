<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      懒加载级联
    </h4>
    <p class="demo-card__desc">
      使用 lazy 加载子节点，模拟异步请求。
    </p>

    <fd-cascader
      v-model="value"
      :options="rootOptions"
      lazy
      :lazy-load="lazyLoad"
      clearable
      placeholder="选择节点"
      style="width: 260px"
    />
    <div class="select-value">
      当前值：{{ value }}
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CascaderOption } from "element-plus/es/components/cascader-panel"
import { ref } from "vue"

defineOptions({
  name: "lazy-cascader-demo",
})

const value = ref<string[]>([])

const rootOptions: CascaderOption[] = [
  { label: "父级 A", value: "a", leaf: false },
  { label: "父级 B", value: "b", leaf: false },
]

function lazyLoad(node: CascaderOption, resolve: (data: CascaderOption[]) => void) {
  const base = node.value as string
  window.setTimeout(() => {
    resolve([
      { label: `${base}-子节点1`, value: `${base}-1`, leaf: true },
      { label: `${base}-子节点2`, value: `${base}-2`, leaf: true },
    ])
  }, 400)
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

.select-value {
  color: var(--text-sub);
  margin-top: 8px;
}
</style>
