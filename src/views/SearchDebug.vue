<template>
  <div class="debug-page">
    <h2>FdSearch & CRUD Integration Debug</h2>

    <el-card>
      <fd-crud ref="crudRef">
        <fd-search ref="searchRef" />
      </fd-crud>
    </el-card>

    <div style="margin-top: 20px;">
      <h3>Current Params (in CRUD):</h3>
      <pre>{{ crudParams }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCrud, useSearch } from "@/hooks"
import { computed, onMounted } from "vue"

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
  },
  // 使用新的 row/col 配置
  row: { gutter: 20, collapsed: false, collapsedRows: 1 },
  col: { span: 12 },
  items: [
    {
      field: "keyword",
      label: "关键词",
      component: { is: "el-input", props: { placeholder: "搜索姓名", clearable: true } },
    },
    {
      field: "status",
      label: "状态",
      component: {
        is: "el-select",
        props: { clearable: true },
        options: [
          { label: "启用", value: 1 },
          { label: "禁用", value: 0 },
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
          valueFormat: "YYYY-MM-DD",
        },
      },
      col: { span: 12 }, // 宽列
    },
    {
      field: "extra",
      label: "额外条件",
      component: { is: "el-input" },
      // 默认超过1行会被折叠 (因为 collapsedRows: 1)
    },
  ],
  action: {
    col: { span: 24 },
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
.debug-page {
  margin: 0 auto;
  padding: 24px;
  max-width: 1200px;
}
</style>
