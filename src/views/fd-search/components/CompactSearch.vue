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
    owner: "",
    status: "",
  },
  grid: { cols: 4, colGap: 12, rowGap: 12 },
  items: [
    {
      field: "keyword",
      label: "关键词",
      component: {
        is: "el-input",
        props: { placeholder: "输入关键词", clearable: true },
      },
    },
    {
      field: "owner",
      label: "负责人",
      component: {
        is: "el-input",
        props: { placeholder: "模糊查询", clearable: true },
      },
    },
    {
      field: "status",
      label: "状态",
      component: {
        is: "el-select",
        props: { clearable: true, placeholder: "全部" },
        options: [
          { label: "进行中", value: 1 },
          { label: "已完成", value: 2 },
          { label: "已关闭", value: 3 },
        ],
      },
    },
  ],
  action: {
    grid: { cols: 24, colGap: 8, rowGap: 8 },
    items: [
      { type: "search", text: "查询" },
      { type: "reset", text: "清空" },
      {
        component: {
          is: "el-button",
          props: { type: "primary", link: true },
          slots: {
            default: () => "保存条件",
          },
          on: {
            click: () => console.log("保存当前条件"),
          },
        },
      },
    ],
  },
}

const searchRef = useSearch(options)
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
