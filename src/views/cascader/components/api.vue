<template>
  <div class="demo-grid">
    <div class="demo-item">
      <h3 class="demo-title">1. API 获取全量数据</h3>
      <p class="demo-desc">
        通过 <code>api</code> 属性传入一个返回 Promise 的函数，组件挂载时自动获取全量层级数据。<br />
        适用于数据量较小、层级固定的场景。
      </p>
      <div class="demo-control">
        <div class="control-row">
          <el-radio-group v-model="currentRegion" size="small">
            <el-radio-button label="china">中国</el-radio-button>
            <el-radio-button label="usa">美国</el-radio-button>
          </el-radio-group>
        </div>

        <div class="control-row" style="margin-top: 12px">
          <fd-cascader v-model="value" :api="mockFetchApi" :params="queryParams" placeholder="请选择城市" style="width: 100%" clearable />
        </div>
      </div>
      <div class="demo-result">
        <span class="result-label">选中值:</span>
        <span>{{ value || "-" }}</span>
        <span class="result-label" style="margin-left: 16px">API 参数:</span>
        <span>{{ JSON.stringify(queryParams) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"

const value = ref([])
const currentRegion = ref("china")

const queryParams = computed(() => ({
  region: currentRegion.value,
}))

const MOCK_DATA_CHINA = [
  {
    value: "zhejiang",
    label: "浙江",
    children: [
      { value: "hangzhou", label: "杭州" },
      { value: "ningbo", label: "宁波" },
    ],
  },
  {
    value: "jiangsu",
    label: "江苏",
    children: [
      { value: "nanjing", label: "南京" },
      { value: "suzhou", label: "苏州" },
    ],
  },
]

const MOCK_DATA_USA = [
  {
    value: "california",
    label: "California",
    children: [
      { value: "los_angeles", label: "Los Angeles" },
      { value: "san_francisco", label: "San Francisco" },
    ],
  },
  {
    value: "new_york",
    label: "New York",
    children: [
      { value: "nyc", label: "New York City" },
      { value: "buffalo", label: "Buffalo" },
    ],
  },
]

// 模拟 API 请求
function mockFetchApi(params: Record<string, any>): Promise<any[]> {
  console.log("[CascaderAPI] Request:", params)
  return new Promise((resolve) => {
    setTimeout(() => {
      const { region } = params
      if (region === "usa") {
        resolve(MOCK_DATA_USA)
      }
      else {
        resolve(MOCK_DATA_CHINA)
      }
    }, 1600)
  })
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

.control-row {
  gap: 12px;
  display: flex;
  align-items: center;
}

.demo-result {
  gap: 8px;
  color: var(--el-text-color-regular);
  display: flex;
  padding: 12px;
  flex-wrap: wrap;
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
