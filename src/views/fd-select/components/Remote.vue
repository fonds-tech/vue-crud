<template>
  <div class="demo-grid">
    <!-- 示例 1: 基础远程搜索 -->
    <div class="demo-item">
      <h3 class="demo-title">1. 远程搜索 (API + Debounce)</h3>
      <p class="demo-desc">输入关键词触发搜索，默认 300ms 防抖。尝试输入 "user"。</p>
      <div class="demo-control">
        <fd-select
          v-model="remoteValue"
          :api="fetchUserList"
          search-field="keyword"
          placeholder="输入关键词搜索用户"
          style="width: 100%"
          clearable
        />
      </div>
      <div class="demo-result">
        <span class="result-label">选中值:</span>
        <span>{{ remoteValue || '-' }}</span>
      </div>
    </div>

    <!-- 示例 2: 带额外参数 -->
    <div class="demo-item">
      <h3 class="demo-title">2. 带动态参数 (Params)</h3>
      <p class="demo-desc">切换部门参数会触发自动重新查询。</p>
      <div class="demo-control">
        <div class="control-row">
          <el-radio-group v-model="currentDept">
            <el-radio-button label="dev">研发部</el-radio-button>
            <el-radio-button label="sales">销售部</el-radio-button>
          </el-radio-group>

          <fd-select
            v-model="deptUserValue"
            :api="fetchUserByDept"
            :params="deptParams"
            placeholder="搜索该部门员工"
            style="width: 220px"
          />
        </div>
      </div>
      <div class="demo-result">
        <span class="result-label">选中部门:</span>
        <el-tag size="small" type="info">{{ currentDept }}</el-tag>
        <span class="result-label" style="margin-left: 12px">选中员工:</span>
        <span>{{ deptUserValue || '-' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FdSelect from "@/components/fd-select/index.vue"
import { ref, computed } from "vue"

interface UserOption { label: string, value: string, dept: string }

// --- 模拟数据 ---
const ALL_USERS: UserOption[] = [
  { label: "User A (Dev)", value: "a", dept: "dev" },
  { label: "User B (Dev)", value: "b", dept: "dev" },
  { label: "User C (Sales)", value: "c", dept: "sales" },
  { label: "User D (Sales)", value: "d", dept: "sales" },
  { label: "User E (Dev)", value: "e", dept: "dev" },
]

// --- 示例 1 逻辑 ---
const remoteValue = ref("")

// 模拟 API 请求，返回 Promise<UserOption[]>
function fetchUserList(params: Record<string, any>): Promise<UserOption[]> {
  console.log("Searching with:", params)
  return new Promise<UserOption[]>((resolve) => {
    setTimeout(() => {
      const keyword = (params.keyword || "").toLowerCase()
      const results = ALL_USERS.filter(u =>
        u.label.toLowerCase().includes(keyword),
      )
      resolve(results)
    }, 500) // 模拟网络延迟
  })
}

// --- 示例 2 逻辑 ---
const currentDept = ref("dev")
const deptUserValue = ref("")

// 动态参数
const deptParams = computed(() => ({
  dept: currentDept.value,
}))

function fetchUserByDept(params: Record<string, any>): Promise<UserOption[]> {
  return new Promise<UserOption[]>((resolve) => {
    setTimeout(() => {
      const { keyword, dept } = params
      const k = (keyword || "").toLowerCase()
      const results = ALL_USERS.filter(u =>
        u.dept === dept && u.label.toLowerCase().includes(k),
      )
      resolve(results)
    }, 300)
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

.demo-control {
  margin-bottom: 16px;
}

.control-row {
  gap: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.demo-result {
  gap: 8px;
  color: var(--el-text-color-secondary);
  display: flex;
  font-size: 13px;
  border-top: 1px dashed var(--el-border-color-lighter);
  margin-top: auto;
  align-items: center;
  padding-top: 16px;
}

.result-label {
  color: var(--el-text-color-regular);
}
</style>
