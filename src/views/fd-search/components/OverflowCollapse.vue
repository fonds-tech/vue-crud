<template>
  <div class="search-variant">
    <el-card class="variant-card">
      <fd-crud ref="crudRef" class="crud-shell">
        <fd-search ref="searchRef" />
      </fd-crud>
    </el-card>

    <el-card class="variant-card">
      <pre>{{ crudParams }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { SearchOptions } from "@/components/fd-search/type"
import { computed } from "vue"
import { SearchMockService } from "../mockService"
import { useCrud, useSearch } from "@/hooks"

const crudRef = useCrud(
  {
    service: new SearchMockService(),
    permission: { add: true, delete: true, update: true, page: true },
  },
  (crud) => {
    crud.refresh()
  },
)

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
    executor: "",
    priority: "",
    city: "",
    source: "",
    stage: "",
    risk: "",
    channel: "",
    campaign: "",
  },
  grid: { cols: 4, colGap: 12, rowGap: 12, collapsed: true, collapsedRows: 3 },
  items: [
    { field: "keyword", label: "关键词", component: { is: "el-input", props: { placeholder: "模糊检索", clearable: true } } },
    { field: "status", label: "状态", component: { is: "el-select", props: { placeholder: "全部", clearable: true }, options: [{ label: "启用", value: 1 }, { label: "禁用", value: 0 }] } },
    { field: "owner", label: "负责人", component: { is: "el-input", props: { placeholder: "姓名", clearable: true } } },
    { field: "department", label: "部门", component: { is: "el-select", props: { placeholder: "选择部门", clearable: true }, options: [{ label: "技术部", value: "tech" }, { label: "产品部", value: "product" }, { label: "运营部", value: "ops" }] } },
    { field: "tags", label: "标签", component: { is: "el-select", props: { multiple: true, collapseTags: true, placeholder: "选择标签" }, options: [{ label: "重点", value: "important" }, { label: "体验", value: "ux" }, { label: "优化", value: "opt" }] } },
    { field: "level", label: "级别", component: { is: "el-select", props: { placeholder: "全部级别", clearable: true }, options: [{ label: "L1", value: "L1" }, { label: "L2", value: "L2" }, { label: "L3", value: "L3" }] } },
    { field: "executor", label: "执行人", component: { is: "el-input", props: { placeholder: "执行负责人", clearable: true } } },
    { field: "priority", label: "优先级", component: { is: "el-select", props: { placeholder: "优先级", clearable: true }, options: [{ label: "高", value: "high" }, { label: "中", value: "medium" }, { label: "低", value: "low" }] } },
    { field: "city", label: "城市", component: { is: "el-select", props: { placeholder: "选择城市", clearable: true }, options: [{ label: "上海", value: "sh" }, { label: "北京", value: "bj" }, { label: "深圳", value: "sz" }] } },
    { field: "source", label: "来源", component: { is: "el-select", props: { placeholder: "线索来源", clearable: true }, options: [{ label: "广告", value: "ad" }, { label: "官网", value: "site" }, { label: "转介绍", value: "ref" }] } },
    { field: "stage", label: "阶段", component: { is: "el-select", props: { placeholder: "选择阶段", clearable: true }, options: [{ label: "立项", value: "init" }, { label: "设计", value: "design" }, { label: "开发", value: "dev" }, { label: "验收", value: "qa" }] } },
    { field: "risk", label: "风险等级", component: { is: "el-select", props: { placeholder: "风险等级", clearable: true }, options: [{ label: "低风险", value: "low" }, { label: "中风险", value: "medium" }, { label: "高风险", value: "high" }] } },
    { field: "channel", label: "投放渠道", component: { is: "el-select", props: { placeholder: "选择渠道", clearable: true }, options: [{ label: "线上", value: "online" }, { label: "线下", value: "offline" }, { label: "合作伙伴", value: "partner" }] } },
    { field: "campaign", label: "活动名称", component: { is: "el-input", props: { placeholder: "如：双 11 大促", clearable: true } } },
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
    grid: { cols: 1, colGap: 0, rowGap: 12 },
    items: [
      { type: "search", text: "搜索" },
      { type: "reset", text: "重置" },
      { type: "collapse" },
    ],
  },
}

const searchRef = useSearch(options)
const crudParams = computed(() => crudRef.value?.params)
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

.variant-meta {
  margin-bottom: 12px;

  &__scene {
    color: var(--text-main);
    margin: 0;
    font-weight: 600;
  }

  &__tips {
    color: var(--text-sub);
    margin: 4px 0 0;
    font-size: 12px;
  }
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
