<template>
  <div class="demo-grid">
    <!-- 示例 1: 模拟 API 方法 + 动态参数 -->
    <div class="demo-item">
      <h3 class="demo-title">1. 模拟 API 方法 (Function Mode)</h3>
      <p class="demo-desc">
        使用本地函数模拟后端接口，演示 <code>params</code> 参数传递与自动重新请求。<br>
        尝试切换<b>用户角色</b>，列表将自动刷新。
      </p>

      <div class="demo-control">
        <div class="control-row">
          <span class="label">角色筛选:</span>
          <el-radio-group v-model="currentRole" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="admin">管理员</el-radio-button>
            <el-radio-button label="user">普通用户</el-radio-button>
          </el-radio-group>
        </div>

        <div class="control-row" style="margin-top: 12px">
          <fd-select
            v-model="value1"
            :api="mockUserApi"
            :params="queryParams"
            label-key="name"
            value-key="id"
            placeholder="请选择用户"
            style="width: 100%"
            clearable
          />
        </div>
      </div>

      <div class="demo-result">
        <span class="result-label">当前选中:</span>
        <span>{{ value1 || '-' }}</span>
        <span class="result-label" style="margin-left: 16px">请求参数:</span>
        <span>{{ JSON.stringify(queryParams) }}</span>
      </div>
    </div>

    <!-- 示例 2: 模拟复杂数据结构 -->
    <div class="demo-item">
      <h3 class="demo-title">2. 复杂数据处理</h3>
      <p class="demo-desc">
        模拟带延迟的搜索接口，并在模拟数据中包含额外信息（如头像、部门）。
      </p>
      <div class="demo-control">
        <fd-select
          v-model="value2"
          :api="mockUserApi"
          :params="{ role: 'all' }"
          label-key="name"
          value-key="id"
          placeholder="搜索用户 (支持防抖)"
          style="width: 100%"
        >
          <template #default="{ options }">
            <fd-option
              v-for="item in options"
              :key="item.id"
              :label="item.name"
              :value="item.id"
              style="height: 56px"
            >
              <div class="user-option">
                <span class="user-avatar">{{ item.name[0] }}</span>
                <div class="user-info">
                  <div class="user-name">
                    {{ item.name }}
                    <el-tag size="small" effect="plain" style="transform: scale(0.8)">
                      {{ item.role }}
                    </el-tag>
                  </div>
                  <div class="user-email">{{ item.email }}</div>
                </div>
              </div>
            </fd-option>
          </template>
        </fd-select>
      </div>
      <div class="demo-result">
        <span class="result-label">选中ID:</span>
        <span>{{ value2 || '-' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FdOption from "@/components/fd-option/index.vue"
import FdSelect from "@/components/fd-select/index.vue"
import { ref, computed } from "vue"

// --- Mock Data & API ---

const MOCK_DB = [
  { id: 101, name: "Alice Admin", role: "admin", email: "alice@example.com" },
  { id: 102, name: "Bob User", role: "user", email: "bob@example.com" },
  { id: 103, name: "Charlie User", role: "user", email: "charlie@example.com" },
  { id: 104, name: "David Admin", role: "admin", email: "david@example.com" },
  { id: 105, name: "Eve User", role: "user", email: "eve@example.com" },
]

// 模拟后端接口方法
function mockUserApi(params: Record<string, any>): Promise<any[]> {
  console.log("[MockAPI] Request:", params)
  return new Promise((resolve) => {
    setTimeout(() => {
      const { role, keyword } = params
      let result = MOCK_DB

      // 模拟后端筛选逻辑
      if (role && role !== "all") {
        result = result.filter(u => u.role === role)
      }
      if (keyword) {
        const k = keyword.toLowerCase()
        result = result.filter(u => u.name.toLowerCase().includes(k) || u.email.toLowerCase().includes(k))
      }

      console.log("[MockAPI] Response:", result)
      resolve(result)
    }, 1500) // 模拟 500ms 网络延迟
  })
}

// --- Demo Logic ---

const value1 = ref("")
const value2 = ref("")
const currentRole = ref("all")

// 动态生成参数
const queryParams = computed(() => ({
  role: currentRole.value,
  source: "demo_page", // 演示透传额外参数
}))
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

.label {
  color: var(--el-text-color-regular);
  font-size: 14px;
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

.user-option {
  gap: 10px;
  height: 100%;
  display: flex;
  align-items: center;
  line-height: normal;
}

.user-avatar {
  color: var(--el-color-primary);
  width: 28px;
  height: 28px;
  display: flex;
  font-size: 14px;
  align-items: center;
  font-weight: bold;
  border-radius: 50%;
  justify-content: center;
  background-color: var(--el-fill-color-light);
}

.user-info {
  display: flex;
  line-height: 1.2;
  flex-direction: column;
}

.user-name {
  gap: 6px;
  color: var(--el-text-color-primary);
  display: flex;
  font-size: 13px;
  align-items: center;
  font-weight: 500;
}

.user-email {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
