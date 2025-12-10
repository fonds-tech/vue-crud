<template>
  <div class="demo-grid">
    <div class="demo-item">
      <h3 class="demo-title">1. 动态加载 (Lazy Load)</h3>
      <p class="demo-desc">通过配置 <code>lazy: true</code> 和 <code>lazyLoad</code> 函数，实现子节点的按需异步加载。</p>
      <div class="demo-control">
        <fd-cascader v-model="value" :props="props" placeholder="请选择 (动态加载)" style="width: 100%" clearable />
      </div>
      <div class="demo-result">
        <span class="result-label">选中路径:</span>
        <span>{{ value || "-" }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CascaderProps } from "element-plus"
import { ref } from "vue"

const value = ref([])

let id = 0

const props: CascaderProps = {
  lazy: true,
  lazyLoad(node, resolve) {
    const { level } = node
    setTimeout(() => {
      const nodes = Array.from({ length: level + 1 }).map(() => ({
        value: ++id,
        label: `选项${id}`,
        leaf: level >= 2,
      }))
      // 模拟节点加载
      resolve(nodes)
    }, 500)
  },
}
</script>

<style scoped>
.demo-grid {
  gap: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
}

.demo-item {
  border: 1px solid var(--el-border-color-lighter);
  display: flex;
  padding: 24px;
  border-radius: 8px;
  flex-direction: column;
  background-color: var(--el-bg-color);
}

.demo-title {
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.demo-desc {
  color: var(--el-text-color-secondary);
  margin: 0 0 20px 0;
  font-size: 14px;
  line-height: 1.5;
}

.demo-desc code {
  color: var(--el-color-primary);
  padding: 2px 4px;
  font-family: monospace;
  border-radius: 4px;
  background-color: var(--el-fill-color);
}

.demo-control {
  margin-bottom: 16px;
}

.demo-result {
  gap: 8px;
  color: var(--el-text-color-regular);
  display: flex;
  padding: 12px;
  font-size: 12px;
  margin-top: auto;
  align-items: center;
  font-family: monospace;
  border-radius: 4px;
  background-color: var(--el-fill-color-lighter);
}

.result-label {
  color: var(--el-text-color-primary);
  font-weight: 600;
}
</style>
