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
import { h, computed, onMounted } from "vue"

const crudRef = useCrud({
  service: new SearchMockService(),
  permission: { add: true, delete: true, update: true, page: true },
})

const advancedOptions: SearchOptions = {
  model: {
    keyword: "",
    status: "",
    createTime: [],
    department: [],
    tags: [],
    notify: false,
    salaryRange: [5, 20],
    approval: "all",
    priority: 3,
    remarks: "",
  },
  grid: { cols: 4, colGap: 20, rowGap: 20, collapsed: false, collapsedRows: 1 },
  items: [
    {
      field: "keyword",
      label: "关键词",
      component: {
        is: "el-input",
        props: { placeholder: "搜索姓名或邮箱", clearable: true },
      },
    },
    {
      field: "status",
      label: "状态",
      component: {
        is: "el-select",
        props: { clearable: true, placeholder: "全部状态" },
        options: [
          { label: "启用", value: 1 },
          { label: "禁用", value: 0 },
        ],
      },
    },
    {
      field: "department",
      label: "所属部门",
      component: {
        is: "el-cascader",
        props: {
          clearable: true,
          props: { multiple: true },
          options: [
            {
              label: "总部",
              value: "hq",
              children: [
                { label: "技术部", value: "tech" },
                { label: "产品部", value: "product" },
              ],
            },
            {
              label: "分部",
              value: "branch",
              children: [
                { label: "销售一部", value: "sales-1" },
                { label: "销售二部", value: "sales-2" },
              ],
            },
          ],
        },
      },
    },
    {
      field: "tags",
      label: "用户标签",
      component: {
        is: "el-select",
        props: { multiple: true, collapseTags: true, filterable: true },
        options: [
          { label: "高价值", value: "vip" },
          { label: "需跟进", value: "follow" },
          { label: "城市用户", value: "city" },
          { label: "新注册", value: "new" },
        ],
      },
    },
    {
      field: "createTime",
      label: "创建时间",
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
      span: 4,
    },
    {
      field: "notify",
      label: "需要通知",
      component: {
        is: "el-switch",
        props: { activeText: "是", inactiveText: "否" },
      },
    },
    {
      field: "salaryRange",
      label: "金额区间(万)",
      component: {
        is: "el-slider",
        props: { range: true, step: 1, min: 0, max: 50, showStops: true },
      },
      span: 4,
    },
    {
      field: "approval",
      label: "审批状态",
      component: {
        is: "el-radio-group",
        slots: {
          default: () => [
            h("el-radio", { label: "all" }, () => "全部"),
            h("el-radio", { label: "pending" }, () => "待审批"),
            h("el-radio", { label: "passed" }, () => "已通过"),
          ],
        },
      },
    },
    {
      field: "priority",
      label: "优先级",
      component: {
        is: "el-rate",
        props: { allowHalf: true, showScore: true },
      },
    },
    {
      field: "remarks",
      label: "备注",
      component: {
        is: "el-input",
        props: { type: "textarea", rows: 2, maxlength: 100, showWordLimit: true },
      },
      span: 4,
    },
  ],
  action: {
    grid: { cols: 2 },
    items: [
      { type: "search", text: "搜索" },
      { type: "reset", text: "重置" },
    ],
  },
  onSearch: (model, { next }) => {
    console.log("Search triggered:", model)
    next()
  },
  onReset: (model, { next }) => {
    console.log("Reset triggered")
    next()
  },
}

const searchRef = useSearch(advancedOptions)
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
