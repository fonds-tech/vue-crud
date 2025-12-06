<template>
  <div class="search-variant">
    <el-card>
      <fd-crud ref="crud">
        <fd-search ref="search" />
      </fd-crud>
    </el-card>

    <el-card>
      <pre class="variant-snapshot">{{ crudParams }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { SearchMockService } from "../mockService"
import { useCrud, useSearch } from "@/hooks"

const crud = useCrud({ service: new SearchMockService() }, crud => crud.refresh())

const search = useSearch({
  items: [
    {
      prop: "keyword",
      label: "关键词",
      component: {
        is: "el-input",
        props: { placeholder: "输入关键词", clearable: true },
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
      prop: "owner",
      label: "负责人",
      component: {
        is: "el-input",
        props: { placeholder: "输入负责人", clearable: true },
      },
    },
    {
      prop: "type",
      label: "类型",
      component: {
        is: "el-select",
        props: { clearable: true, placeholder: "选择类型" },
        options: [
          { label: "内部", value: "internal" },
          { label: "外部", value: "external" },
        ],
      },
    },
    {
      prop: "notify",
      label: "需要通知",
      component: {
        is: "el-select",
        props: { clearable: true, placeholder: "是否通知" },
        options: [
          { label: "是", value: true },
          { label: "否", value: false },
        ],
      },
    },
    {
      prop: "createRange",
      label: "创建日期",
      component: {
        is: "el-date-picker",
        props: {
          type: "daterange",
          unlinkPanels: true,
          rangeSeparator: "至",
          startPlaceholder: "开始日期",
          endPlaceholder: "结束日期",
          valueFormat: "YYYY-MM-DD",
          clearable: true,
        },
      },
    },
  ],
})

const crudParams = computed(() => crud.value?.params)
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
