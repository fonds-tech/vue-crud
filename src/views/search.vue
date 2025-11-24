<template>
  <div class="search-page">
    <div class="search-layout">
      <el-card class="search-panel">
        <div class="panel-title">
          <h2>搜索表单</h2>
          <span>fd-search / fd-crud</span>
        </div>
        <fd-crud ref="crudRef" class="crud-shell">
          <fd-search ref="searchRef" />
        </fd-crud>
      </el-card>
    </div>

    <el-card class="params-panel">
      <div class="panel-title">
        <h2>参数快照</h2>
        <span>实时 JSON</span>
      </div>
      <pre>{{ crudParams }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useCrud, useSearch } from "@/hooks"
import { h, computed, onMounted } from "vue"

// 模拟数据
const MOCK_DATA = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  status: i % 2, // 0 or 1
  createTime: `2023-01-${String(i + 1).padStart(2, "0")}`,
  type: i % 3,
}))

// 模拟 Service
class MockService {
  page(params: any) {
    console.log("MockService.page called with:", params)
    return new Promise((resolve) => {
      setTimeout(() => {
        let list = [...MOCK_DATA]

        // 模拟后端搜索过滤
        if (params.keyword) {
          list = list.filter(item => item.name.includes(params.keyword))
        }
        if (params.status !== undefined && params.status !== "") {
          list = list.filter(item => item.status === Number(params.status))
        }
        if (params.createTime && params.createTime.length === 2) {
          // Simple date range check mock
          const start = params.createTime[0]
          const end = params.createTime[1]
          list = list.filter(item => item.createTime >= start && item.createTime <= end)
        }

        resolve({
          list,
          total: list.length,
          pagination: {
            page: params.page || 1,
            size: params.size || 20,
            total: list.length,
          },
        })
      }, 500)
    })
  }

  add() { return Promise.resolve() }
  update() { return Promise.resolve() }
  delete() { return Promise.resolve() }
  info() { return Promise.resolve() }
}

// 初始化 CRUD
const crudRef = useCrud({
  service: new MockService(),
  permission: { add: true, delete: true, update: true, page: true }, // Enable all
})

// 暴露给模板显示当前参数
const crudParams = computed(() => crudRef.value?.params)

// 初始化搜索
const searchRef = useSearch({
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
  row: { gutter: 20, collapsed: false, collapsedRows: 1 },
  col: { span: 12 },
  items: [
    {
      field: "keyword",
      label: "关键词",
      component: {
        is: "el-input",
        props: { placeholder: "搜索姓名或邮箱", clearable: true, prefixIcon: "el-icon-search" },
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
        props: { multiple: true, collapseTags: true, filterable: true, placeholder: "选择多个标签" },
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
      col: { span: 24 },
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
      col: { span: 24 },
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
      col: { span: 24 },
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
})

// 自动刷新
onMounted(() => {
  crudRef.value?.refresh()
})
</script>

<style scoped>
.search-page {
  gap: 24px;
  display: flex;
  flex-direction: column;
}

.page-header {
  gap: 12px;
  display: flex;
  padding: 18px 24px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
  align-items: center;
  border-radius: 16px;
  justify-content: space-between;
}

.page-header h1 {
  margin: 0;
}

.page-header p {
  color: #606266;
  margin: 4px 0 0;
}

.search-layout {
  display: flex;
  flex-direction: column;
}

.search-panel,
.params-panel {
  border: none;
  box-shadow: 0 15px 38px rgba(15, 23, 42, 0.1);
  border-radius: 20px;
}

.panel-title {
  color: #909399;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  justify-content: space-between;
}

.panel-title h2 {
  color: #1f2d3d;
  margin: 0;
  font-size: 20px;
}

.crud-shell {
  padding: 16px;
  background: #f8fafc;
  border-radius: 16px;
}

.params-panel pre {
  color: #e5e7eb;
  margin: 0;
  padding: 16px;
  overflow: auto;
  background: #111827;
  max-height: 320px;
  font-family: "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
  border-radius: 14px;
}

@media (max-width: 960px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
