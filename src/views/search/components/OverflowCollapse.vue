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

const options: SearchOptions = {
  model: {
    keyword: "",
    status: "",
    owner: "",
    department: "",
    tags: [],
    level: "",
    createTime: [],
    remark: "",
  },
  grid: { cols: 4, colGap: 12, rowGap: 12, collapsed: true, collapsedRows: 2 },
  items: [
    { field: "keyword", label: "关键词", component: { is: "el-input", props: { placeholder: "模糊检索", clearable: true } } },
    { field: "status", label: "状态", component: { is: "el-select", props: { placeholder: "全部", clearable: true }, options: [{ label: "启用", value: 1 }, { label: "禁用", value: 0 }] } },
    { field: "owner", label: "负责人", component: { is: "el-input", props: { placeholder: "姓名", clearable: true } } },
    { field: "department", label: "部门", component: { is: "el-select", props: { placeholder: "选择部门", clearable: true }, options: [{ label: "技术部", value: "tech" }, { label: "产品部", value: "product" }, { label: "运营部", value: "ops" }] } },
    { field: "tags", label: "标签", component: { is: "el-select", props: { multiple: true, collapseTags: true, placeholder: "选择标签" }, options: [{ label: "重点", value: "important" }, { label: "体验", value: "ux" }, { label: "优化", value: "opt" }] } },
    { field: "level", label: "级别", component: { is: "el-select", props: { placeholder: "全部级别", clearable: true }, options: [{ label: "L1", value: "L1" }, { label: "L2", value: "L2" }, { label: "L3", value: "L3" }] } },
    {
      field: "createTime",
      label: "创建日期",
      span: 2,
      component: {
        is: "el-date-picker",
        props: {
          type: "daterange",
          unlinkPanels: true,
          rangeSeparator: "至",
          startPlaceholder: "开始日期",
          endPlaceholder: "结束日期",
          valueFormat: "YYYY-MM-DD",
        },
      },
    },
    {
      field: "remark",
      label: "备注",
      span: 4,
      component: {
        is: "el-input",
        props: { type: "textarea", rows: 2, placeholder: "输入备注信息" },
      },
    },
  ],
  action: {
    grid: { cols: 1, colGap: 0, rowGap: 8 },
    items: [
      { type: "search", text: "搜索" },
      { type: "reset", text: "重置" },
      { type: "collapse" },
    ],
  },
}

const searchRef = useSearch(options)
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
  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.08);
  border-radius: 20px;
}

.crud-shell {
  padding: 16px;
  background: #f8fafc;
  border-radius: 16px;
}

.panel-title {
  color: #909399;
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
  border-radius: 14px;
}
</style>
