<template>
  <div class="demo-grid">
    <!-- 示例 1: 自定义插槽 -->
    <div class="demo-item">
      <h3 class="demo-title">1. 自定义选项模板 (Slots)</h3>
      <p class="demo-desc">使用默认插槽自定义下拉列表的 Option 内容。</p>
      <div class="demo-control">
        <fd-select
          v-model="valueSlot"
          :options="users"
          placeholder="请选择"
          style="width: 100%"
        >
          <template #default="{ options }">
            <fd-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div class="custom-option">
                <span class="option-label">{{ item.label }}</span>
                <span class="option-desc">{{ item.desc }}</span>
              </div>
            </fd-option>
          </template>
        </fd-select>
      </div>
    </div>

    <!-- 示例 2: 获取完整对象 -->
    <div class="demo-item">
      <h3 class="demo-title">2. 获取选中项完整对象</h3>
      <p class="demo-desc">监听 change 事件，第二个参数即为选中项原始数据。</p>
      <div class="demo-control">
        <fd-select
          v-model="valueEvent"
          :options="users"
          placeholder="请选择一项"
          style="width: 100%"
          @change="handleChange"
        />
      </div>
      <div class="demo-result">
        {{ selectedObject ? JSON.stringify(selectedObject, null, 2) : '// 暂无选择数据' }}
      </div>
    </div>

    <!-- 示例 3: 手动控制刷新 -->
    <div class="demo-item">
      <h3 class="demo-title">3. 手动刷新列表 (Expose)</h3>
      <p class="demo-desc">通过 ref 调用组件内部 refresh 方法，适用于外部触发更新。</p>
      <div class="demo-control">
        <div class="flex-row" style="margin-bottom: 12px">
          <el-button size="small" @click="refreshList">点击刷新</el-button>
          <span style="font-size: 12px; color: var(--el-text-color-secondary)">
            Updated: {{ lastRefreshTime }}
          </span>
        </div>
        <fd-select
          ref="selectRef"
          v-model="valueManual"
          :api="fetchTimeApi"
          placeholder="列表由 API 生成"
          style="width: 100%"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FdOption from "@/components/fd-option"
import FdSelect from "@/components/fd-select"
import { ref } from "vue"
import { ElMessage } from "element-plus"

const users = [
  { label: "Vue.js", value: "vue", desc: "渐进式 JavaScript 框架" },
  { label: "React", value: "react", desc: "用于构建用户界面的库" },
  { label: "Angular", value: "angular", desc: "现代 Web 开发平台" },
]

// --- 示例 1 ---
const valueSlot = ref("")

// --- 示例 2 ---
const valueEvent = ref("")
const selectedObject = ref<any>(null)

function handleChange(val: any, payload: any) {
  console.log("Change:", val, payload)
  selectedObject.value = payload
  ElMessage.success(`选中了: ${payload?.label}`)
}

// --- 示例 3 ---
const valueManual = ref("")
const selectRef = ref()
const lastRefreshTime = ref("-")

function fetchTimeApi() {
  lastRefreshTime.value = new Date().toLocaleTimeString()
  return Promise.resolve([
    { label: `Item generated at ${Date.now()}`, value: 1 },
    { label: "Static Item", value: 2 },
  ])
}

function refreshList() {
  selectRef.value?.refresh()
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

.demo-control {
  margin-bottom: 16px;
}

.demo-result {
  color: var(--el-text-color-regular);
  padding: 12px;
  font-size: 12px;
  margin-top: auto;
  font-family: monospace;
  border-radius: 4px;
  background-color: var(--el-fill-color-lighter);
}

.custom-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.option-label {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.option-desc {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.flex-row {
  gap: 12px;
  display: flex;
  align-items: center;
}
</style>
