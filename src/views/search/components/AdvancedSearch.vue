<template>
  <div class="search-variant">
    <el-card>
      <fd-crud ref="crudRef">
        <fd-search ref="searchRef" />
      </fd-crud>
    </el-card>

    <el-card>
      <pre class="variant-snapshot">{{ crudParams }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { SearchOptions } from "@/components/search/types"
import { h, computed } from "vue"
import { SearchMockService } from "../mockService"
import { useCrud, useSearch } from "@/hooks"

const crudRef = useCrud(
  {
    service: new SearchMockService(),
    permission: { add: true, delete: true, update: true, page: true },
    onRefresh: (params, { next }) => {
      console.log("AdvancedSearch onRefresh params:", params)
      // 调用 next 才会真正触发 service.page 并关闭 loading
      return next(params)
    },
  },
  (crud) => {
    crud.refresh()
  },
)

const advancedOptions: SearchOptions = {
  grid: { cols: 3 },
  items: [
    {
      prop: "keyword",
      label: "关键词",
      component: {
        is: "el-input",
        props: { placeholder: "搜索姓名或邮箱", clearable: true },
      },
    },
    {
      prop: "status",
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
      prop: "department",
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
      prop: "tags",
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
      prop: "createTime",
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
      prop: "notify",
      label: "需要通知",
      component: {
        is: "el-switch",
        props: { activeText: "是", inactiveText: "否" },
      },
    },
    {
      prop: "salaryRange",
      label: "金额区间(万)",
      component: {
        is: "el-slider",
        props: { range: true, step: 1, min: 0, max: 50, showStops: true },
      },
      span: 4,
    },
    {
      prop: "approval",
      label: "审批状态",
      component: {
        is: "el-radio-group",
        slots: {
          default: () => [h("el-radio", { label: "all" }, () => "全部"), h("el-radio", { label: "pending" }, () => "待审批"), h("el-radio", { label: "passed" }, () => "已通过")],
        },
      },
    },
    {
      prop: "priority",
      label: "优先级",
      component: {
        is: "el-rate",
        props: { allowHalf: true, showScore: true },
      },
    },
    {
      prop: "remarks",
      label: "备注",
      component: {
        is: "el-input",
        props: { type: "textarea", rows: 2, maxlength: 100, showWordLimit: true },
      },
      span: 4,
    },
  ],
  action: {
    grid: { cols: 1 },
    items: [
      { type: "search", text: "搜索" },
      { type: "reset", text: "重置" },
    ],
  },
  onSearch: (model, { next }) => {
    // 模拟：将数组格式的日期范围拆分为后端需要的 start/end 字段
    const params = { ...model }
    if (Array.isArray(params.createTime)) {
      const [start, end] = params.createTime
      params.startTime = start
      params.endTime = end
      delete params.createTime
    }
    console.log("Advanced Search Params:", params)
    next(params)
  },
  onReset: (_model, { next }) => {
    console.log("Advanced Search Reset")
    // 重置时可以强制带上默认的排序或状态
    next({ sort: "desc" })
  },
}

const searchRef = useSearch(advancedOptions)
const crudParams = computed(() => crudRef.value?.params)
</script>

<style scoped lang="scss">
.search-variant {
  gap: 16px;
  display: flex;
  flex-direction: column;

  .variant-snapshot {
    color: #e5e7eb;
    margin: 0;
    padding: 16px;
    overflow: auto;
    background: #111827;
    max-height: 300px;
    font-family: "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    border-radius: var(--radius-md);
  }
}
</style>
