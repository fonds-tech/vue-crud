<template>
  <fd-crud ref="crud">
    <fd-table ref="table">
      <template #expand="{ row }">
        <div class="expand-content">
          <el-descriptions title="详细信息" :column="2" border>
            <el-descriptions-item label="ID">
              {{ row.id }}
            </el-descriptions-item>
            <el-descriptions-item label="姓名">
              {{ row.name }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ row.email }}
            </el-descriptions-item>
            <el-descriptions-item label="地址">
              {{ row.address }}
            </el-descriptions-item>
            <el-descriptions-item label="备注">
              这是一段演示文本，展示展开行可以包含任意复杂内容，甚至是嵌套表格。
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </template>
    </fd-table>
  </fd-crud>
</template>

<script setup lang="ts">
import { TableMockService } from "../mockService"
import { useCrud, useTable } from "@/hooks"

defineOptions({ name: "expand-table" })

const crud = useCrud({
  service: new TableMockService(),
}, crud => crud.refresh())

const table = useTable({
  table: { border: true },
  columns: [
    { type: "expand", width: 50 },
    { prop: "name", label: "姓名", width: 120 },
    { prop: "department", label: "部门", width: 120 },
    { prop: "role", label: "角色", width: 120, dict: [
      { value: 0, label: "Developer", type: "default" },
      { value: 1, label: "Designer", type: "success" },
      { value: 2, label: "Manager", type: "warning" },
      { value: 3, label: "Tester", type: "info" },
    ] },
    { prop: "createTime", label: "创建时间", minWidth: 160 },
  ],
})
</script>

<style scoped lang="scss">
.expand-content {
  padding: 20px;
  background-color: var(--el-fill-color-lighter);
}
</style>
