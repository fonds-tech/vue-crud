<template>
  <!-- eslint-disable vue/no-unused-refs -->
  <fd-crud ref="crudRef">
    <fd-table ref="tableRef" />
    <fd-detail ref="detailRef">
      <template #tags="{ value }">
        <div style="display: flex; gap: 8px">
          <el-tag v-for="tag in value" :key="tag">
            {{ tag }}
          </el-tag>
        </div>
      </template>
    </fd-detail>
  </fd-crud>
</template>

<script setup lang="ts">
import type { TableColumn } from "@/components/table/type"
import type { DetailUseOptions } from "@/components/detail/types"
import { DetailMockService } from "../mockService"
import { useCrud, useTable, useDetail } from "@/hooks"

defineOptions({
  name: "component-detail-demo",
})

const detailOptions: DetailUseOptions = {
  dialog: { width: "600px", title: "组件渲染演示" },
  descriptions: { column: 1, border: true },
  items: [
    {
      prop: "avatar",
      label: "头像",
      component: {
        is: "el-avatar",
        props: data => ({ src: data.avatar, size: "large", shape: "circle" }),
      },
    },
    {
      prop: "website",
      label: "官网",
      component: {
        is: "el-link",
        props: data => ({ href: data.website, type: "primary", target: "_blank" }),
        slots: {
          default: () => "点击跳转 Element Plus",
        },
      },
    },
    {
      prop: "score",
      label: "评分",
      component: {
        is: "el-rate",
        props: data => ({ modelValue: Number(data.score), disabled: true, allowHalf: true, size: "small" }),
      },
    },
    {
      prop: "progress",
      label: "进度",
      component: {
        is: "el-progress",
        props: data => ({ textInside: true, strokeWidth: 20, percentage: data.progress }),
      },
    },
    {
      prop: "tags",
      label: "标签组",
      component: {
        slot: "tags",
      },
    },
  ],
}

const columns: TableColumn[] = [
  { prop: "id", label: "ID", width: 80 },
  { prop: "name", label: "名称" },
  { prop: "score", label: "评分" },
  { prop: "progress", label: "进度" },
  {
    type: "action",
    label: "操作",
    actions: [{ text: "详情", type: "detail" }],
  },
]

const crudRef = useCrud({
  service: new DetailMockService(),
}, crud => crud.refresh())

const tableRef = useTable({
  columns,
})

const detailRef = useDetail(detailOptions)
</script>
