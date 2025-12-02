<template>
  <div class="demo-container">
    <fd-crud ref="crud">
      <fd-search ref="search" />

      <fd-table ref="table">
        <!-- 自定义工具栏 -->
        <template #toolbar>
          <fd-add-button />
          <fd-delete-button /> <!-- 批量删除按钮 -->
          <fd-import
            :api="importApi"
            temp-url="https://example.com/template.xlsx"
            @success="handleImportSuccess"
          />
          <fd-export
            :api="exportApi"
            file-name="员工数据"
          />

          <div style="flex: 1"></div>

          <el-button type="primary" plain @click="handleCustomAction">
            自定义操作
          </el-button>
        </template>
      </fd-table>

      <fd-detail ref="detail" />
      <fd-upsert ref="upsert" />
    </fd-crud>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"
import { CrudMockService } from "../mockService"
import { useCrud, useTable, useDetail, useSearch, useUpsert } from "@/hooks"

defineOptions({ name: "advanced-crud" })

const service = new CrudMockService()

const crud = useCrud({
  service,
  permission: { add: true, update: true, delete: true, detail: true },
}, crud => crud.refresh())

// 模拟导入导出 API
function importApi(data: FormData) {
  const file = data.get("fileData") as File
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Importing file:", file?.name)
      resolve({ success: true, msg: "导入成功" })
    }, 1000)
  })
}

function exportApi(params: any) {
  return new Promise((resolve) => {
    console.log("Exporting with params:", params)
    setTimeout(() => {
      resolve(new Blob(["mock data"], { type: "text/plain" }))
    }, 1000)
  })
}

function handleImportSuccess() {
  crud.value?.refresh()
  ElMessage.success("导入成功，列表已刷新")
}

function handleCustomAction() {
  ElMessage.info("触发了自定义工具栏按钮")
}

// 搜索配置
const search = useSearch({
  grid: { cols: 4 },
  items: [
    { field: "keyword", label: "关键词", component: { is: "el-input", props: { placeholder: "搜索..." } } },
  ],
})

// 表格配置
const table = useTable({
  selection: true, // 开启多选，配合 fd-delete-button
  columns: [
    { prop: "name", label: "姓名" },
    { prop: "account", label: "账号" },
    { prop: "occupation", label: "岗位", formatter: (row: any) => ["研发", "产品", "运营", "销售", "客服"][row.occupation - 1] || "未知" },
    { prop: "createTime", label: "入职时间" },
    {
      type: "action",
      label: "操作",
      width: 150,
      actions: [
        { text: "详情", type: "detail" },
        { text: "编辑", type: "update" },
      ],
    },
  ],
})

// 详情 & Upsert 配置 (简化版)
const detail = useDetail({ items: [{ field: "name", label: "姓名" }, { field: "remark", label: "备注" }] })
const upsert = useUpsert({ items: [{ prop: "name", label: "姓名", component: { is: "el-input" } }] })
</script>

<style scoped>
.demo-container {
  border: 1px solid var(--el-border-color-lighter);
  padding: 20px;
  border-radius: 8px;
  background-color: var(--el-bg-color);
}
</style>
