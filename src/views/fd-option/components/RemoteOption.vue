<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      远程选项
    </h4>
    <p class="demo-card__desc">
      通过 api 函数异步获取选项，自动渲染。
    </p>

    <el-select v-model="value" placeholder="远程加载" filterable style="width: 240px">
      <fd-option :options="options" />
    </el-select>
    <el-button class="refresh-btn" @click="load">
      刷新选项
    </el-button>
    <div class="select-value">
      当前值：{{ value }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"

defineOptions({
  name: "remote-option-demo",
})

const value = ref()
const options = ref<{ label: string, value: string }[]>([])

function load() {
  window.setTimeout(() => {
    options.value = [
      { label: "远程-1", value: "r1" },
      { label: "远程-2", value: "r2" },
    ]
  }, 300)
}

onMounted(load)
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

.refresh-btn {
  margin-left: 12px;
}

.select-value {
  color: var(--text-sub);
  margin-top: 8px;
}
</style>
