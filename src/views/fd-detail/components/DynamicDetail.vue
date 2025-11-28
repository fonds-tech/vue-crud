<template>
  <!-- eslint-disable vue/no-unused-refs -->
  <fd-crud ref="crudRef">
    <fd-table ref="tableRef" />
    <fd-detail ref="detailRef" />
  </fd-crud>
</template>

<script setup lang="ts">
import type { TableColumn } from "@/components/fd-table/type"
import type { DetailUseOptions } from "@/components/fd-detail/type"
import { ElMessage } from "element-plus"
import { DetailMockService } from "../mockService"
import { useCrud, useTable, useDetail } from "@/hooks"

defineOptions({
  name: "dynamic-detail-demo",
})

function mockApi(id: string) {
  return new Promise<any>((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        title: "动态数据演示",
        type: "text", // 切换为 'image' 可展示图片字段
        content: "这是一段文本内容...",
        imageUrl: "https://element-plus.org/images/element-plus-logo.svg",
        showExtra: true,
        extraInfo: "这是动态显示的额外信息",
      })
    }, 1000)
  })
}

const detailOptions: DetailUseOptions = {
  dialog: { title: "异步详情加载" },
  items: [
    { field: "id", label: "ID" },
    { field: "title", label: "标题" },
    {
      field: "type",
      label: "类型",
      formatter: val => (val === "text" ? "文本" : "图片"),
    },
    {
      field: "content",
      label: "内容",
      span: 2,
      hidden: data => data.type !== "text",
    },
    {
      field: "imageUrl",
      label: "预览图",
      span: 2,
      hidden: data => data.type !== "image",
      component: {
        is: "el-image",
        props: data => ({ src: data.imageUrl, style: { width: "100px" } }),
      },
    },
    {
      field: "extraInfo",
      label: "额外信息",
      span: 2,
      hidden: data => !data.showExtra,
    },
  ],
  onDetail: async (row, { done }) => {
    try {
      const res = await mockApi(row.id)
      done(res)
    }
    catch {
      ElMessage.error("加载失败")
    }
  },
}

const columns: TableColumn[] = [
  { prop: "id", label: "ID", width: 80 },
  { prop: "name", label: "名称" }, // Use generic name from service for table
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
