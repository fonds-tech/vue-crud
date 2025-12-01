<template>
  <div class="demo-grid">
    <!-- 示例 1: 基础用法 -->
    <div class="demo-item">
      <h3 class="demo-title">1. 基础用法 (Click Trigger)</h3>
      <p class="demo-desc">默认点击展开子菜单。</p>
      <div class="demo-control">
        <fd-cascader
          v-model="value1"
          :options="options"
          placeholder="请选择地区"
          style="width: 100%"
        />
      </div>
      <div class="demo-result">
        <span class="result-label">选中值:</span>
        <span>{{ value1 || '-' }}</span>
      </div>
    </div>

    <!-- 示例 2: 悬停展开 -->
    <div class="demo-item">
      <h3 class="demo-title">2. 悬停展开 (Hover Trigger)</h3>
      <p class="demo-desc">鼠标悬停即可展开子菜单。</p>
      <div class="demo-control">
        <fd-cascader
          v-model="value2"
          :options="options"
          :props="{ expandTrigger: 'hover' }"
          placeholder="请选择地区"
          style="width: 100%"
        />
      </div>
      <div class="demo-result">
        <span class="result-label">选中值:</span>
        <span>{{ value2 || '-' }}</span>
      </div>
    </div>

    <!-- 示例 3: 多选模式 -->
    <div class="demo-item">
      <h3 class="demo-title">3. 多选模式 (Multiple)</h3>
      <p class="demo-desc">开启 multiple 属性，支持选择多个节点。</p>
      <div class="demo-control">
        <fd-cascader
          v-model="value3"
          :options="options"
          :props="{ multiple: true }"
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择多个地区"
          style="width: 100%"
          clearable
        />
      </div>
      <div class="demo-result">
        <span class="result-label">选中数量:</span>
        <span>{{ value3.length }}</span>
      </div>
    </div>

    <!-- 示例 4: 可搜索 -->
    <div class="demo-item">
      <h3 class="demo-title">4. 可搜索 (Filterable)</h3>
      <p class="demo-desc">开启 filterable 属性，支持关键词搜索。</p>
      <div class="demo-control">
        <fd-cascader
          v-model="value4"
          :options="options"
          filterable
          placeholder="试试搜索 '杭州'"
          style="width: 100%"
        />
      </div>
      <div class="demo-result">
        <span class="result-label">选中值:</span>
        <span>{{ value4 || '-' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

const value1 = ref([])
const value2 = ref([])
const value3 = ref([])
const value4 = ref([])

const options = [
  {
    value: "zhejiang",
    label: "浙江",
    children: [
      {
        value: "hangzhou",
        label: "杭州",
        children: [
          { value: "xihu", label: "西湖" },
          { value: "binjiang", label: "滨江" },
        ],
      },
      {
        value: "ningbo",
        label: "宁波",
        children: [
          { value: "jiangbei", label: "江北" },
          { value: "yinzhou", label: "鄞州" },
        ],
      },
    ],
  },
  {
    value: "jiangsu",
    label: "江苏",
    children: [
      {
        value: "nanjing",
        label: "南京",
        children: [
          { value: "zhonghuamen", label: "中华门" },
        ],
      },
    ],
  },
]
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
