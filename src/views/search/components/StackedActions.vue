<template>
  <div class="search-variant">
    <el-card class="variant-card">
      <fd-crud ref="crudRef" class="crud-shell">
        <fd-search ref="searchRef" />
      </fd-crud>
    </el-card>

    <el-card class="variant-card">
      <div class="panel-title">
        <h3>参数快照</h3>
        <span>实时同步</span>
      </div>
      <pre>{{ crudParams }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { SearchOptions } from "@/components/fd-search/type"
import { SearchMockService } from "../mockService"
import { useCrud, useSearch } from "@/hooks"
import { computed, onMounted } from "vue"

const crudRef = useCrud({
  service: new SearchMockService(),
  permission: { add: true, delete: true, update: true, page: true },
})

const stackedOptions: SearchOptions = {
  model: {
    keyword: "",
    status: "",
    owner: "",
  },
  grid: { cols: 4, colGap: 12, rowGap: 12, collapsedRows: 1 },
  items: [
    {
      field: "keyword",
      label: "关键词",
      component: { is: "el-input", props: { placeholder: "模糊搜索", clearable: true } },
    },
    {
      field: "status",
      label: "状态",
      component: {
        is: "el-select",
        props: { placeholder: "全部状态", clearable: true },
        options: [
          { label: "启用", value: 1 },
          { label: "禁用", value: 0 },
        ],
      },
    },
    {
      field: "owner",
      label: "负责人",
      component: { is: "el-input", props: { placeholder: "请输入姓名", clearable: true } },
    },
  ],
  action: {
    grid: { cols: 1, rowGap: 8, colGap: 0 },
    items: [
      { type: "search", text: "执行搜索", col: { span: 24 } },
      { type: "reset", text: "重置条件", col: { span: 24 } },
    ],
  },
}

const searchRef = useSearch(stackedOptions)
const crudParams = computed(() => crudRef.value?.params)

onMounted(() => {
  crudRef.value?.refresh()
})
</script>

<style scoped>
.search-variant {
  gap: 16px;
  display: flex;
  flex-direction: column;
}

.variant-card {
  border: none;
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);
}

.crud-shell {
  padding: 16px;
  background: var(--app-bg);
  border-radius: var(--radius-md);
}

.panel-title {
  color: var(--text-sub);
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  justify-content: space-between;
}

pre {
  color: #e5e7eb;
  margin: 0;
  padding: 16px;
  overflow: auto;
  background: #111827;
  max-height: 300px;
  font-family: "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
  border-radius: var(--radius-md);
}
</style>
