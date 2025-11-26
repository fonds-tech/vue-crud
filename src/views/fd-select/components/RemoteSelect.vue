<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      远程搜索
    </h4>
    <p class="demo-card__desc">
      模拟接口搜索，展示 loading 与防抖。
    </p>

    <fd-select
      v-model="value"
      :api="mockApi"
      :params="resolveParams"
      :debounce="300"
      filterable
      clearable
      placeholder="输入关键字搜索"
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
  name: "remote-select-demo",
})

const value = ref()

const mockOptions = [
  { label: "楚行云", value: "chuxingyun" },
  { label: "秦尘", value: "qincheng" },
  { label: "唐三", value: "tangsan" },
  { label: "叶凡", value: "yefan" },
]

function mockApi(params: Record<string, any>) {
  const keyword = params.keyword?.toLowerCase?.() ?? ""
  return new Promise((resolve) => {
    window.setTimeout(() => {
      if (!keyword) {
        resolve(mockOptions)
      }
      else {
        resolve(mockOptions.filter(item => item.label.toLowerCase().includes(keyword)))
      }
    }, 400)
  })
}

function resolveParams(payload: Record<string, any>) {
  return payload
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
