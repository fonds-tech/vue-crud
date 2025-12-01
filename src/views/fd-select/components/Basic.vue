<template>
  <div class="demo-grid">
    <!-- 示例 1: 基础单选 -->
    <div class="demo-item">
      <h3 class="demo-title">1. 基础单选 (Static Options)</h3>
      <div class="demo-control">
        <fd-select
          v-model="value1"
          :options="options"
          placeholder="请选择一项"
          style="width: 100%"
        />
      </div>
      <div class="demo-result">
        <span class="result-label">选中值:</span>
        <span>{{ value1 || '-' }}</span>
      </div>
    </div>

    <!-- 示例 2: 自定义字段名 -->
    <div class="demo-item">
      <h3 class="demo-title">2. 自定义字段 (Custom Keys)</h3>
      <div class="demo-control">
        <fd-select
          v-model="value2"
          :options="customOptions"
          label-key="userName"
          value-key="userId"
          placeholder="选择用户"
          style="width: 100%"
        />
      </div>
      <div class="demo-result">
        <span class="result-label">选中值:</span>
        <span>{{ value2 ?? '-' }}</span>
      </div>
    </div>

    <!-- 示例 3: 多选模式 -->
    <div class="demo-item">
      <h3 class="demo-title">3. 多选模式 (Multiple)</h3>
      <div class="demo-control">
        <fd-select
          v-model="value3"
          :options="options"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择多项"
          style="width: 100%"
        />
      </div>
      <div class="demo-result">
        <span class="result-label">选中值:</span>
        <span>{{ value3.length ? value3.join(', ') : '-' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FdSelect from "@/components/fd-select/index.vue"
import { ref } from "vue"

// 基础数据源
const options = [
  { label: "黄金糕", value: "Option1" },
  { label: "双皮奶", value: "Option2" },
  { label: "蚵仔煎", value: "Option3" },
  { label: "龙须面", value: "Option4" },
  { label: "北京烤鸭", value: "Option5" },
]

// 自定义字段数据源
const customOptions = [
  { userName: "张三", userId: 1001 },
  { userName: "李四", userId: 1002 },
  { userName: "王五", userId: 1003 },
]

const value1 = ref("")
const value2 = ref<number>()
const value3 = ref([])
</script>

<style scoped>
.demo-grid {
  gap: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.demo-item {
  border: 1px solid var(--el-border-color-lighter);
  display: flex;
  padding: 20px;
  border-radius: 8px;
  flex-direction: column;
  background-color: #fff;
}

.demo-title {
  color: var(--el-text-color-primary);
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.demo-control {
  margin-bottom: 12px;
}

.demo-result {
  gap: 8px;
  color: var(--el-text-color-secondary);
  display: flex;
  font-size: 13px;
  border-top: 1px dashed var(--el-border-color-lighter);
  margin-top: auto;
  align-items: center;
  padding-top: 12px;
}

.result-label {
  color: var(--el-text-color-regular);
}
</style>
