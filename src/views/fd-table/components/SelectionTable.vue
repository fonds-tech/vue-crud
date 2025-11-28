<template>
  <fd-crud ref="crud">
    <fd-table ref="table">
      <template #toolbar>
        <el-button
          type="primary"
          :disabled="!selection.length"
          @click="handleBatchDelete"
        >
          批量删除 ({{ selection.length }})
        </el-button>
        <el-button @click="toggleAll">
          切换全选
        </el-button>
        <span v-if="selection.length" class="selection-text">
          选中: {{ selection.map(item => item.id).join(", ") }}
        </span>
      </template>
    </fd-table>
  </fd-crud>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { TableMockService } from "../mockService"
import { useCrud, useTable } from "@/hooks"
import { ElMessage, ElMessageBox } from "element-plus"

defineOptions({ name: "selection-table" })

const crud = useCrud({
  service: new TableMockService(),
}, crud => crud.refresh())

const table = useTable({
  table: { border: true, rowKey: "id" },
  columns: [
    { type: "selection", width: 50, fixed: "left" },
    { prop: "name", label: "姓名", width: 120 },
    { prop: "account", label: "账号", width: 120 },
    { prop: "email", label: "邮箱", minWidth: 180 },
    { prop: "createTime", label: "注册时间", width: 160 },
  ],
})

const selection = computed(() => crud.value?.selection || [])

function handleBatchDelete() {
  ElMessageBox.confirm(`确认删除选中的 ${selection.value.length} 条数据吗？`, "提示", {
    type: "warning",
  }).then(() => {
    ElMessage.success("模拟删除成功")
    table.value?.clearSelection()
  })
}

function toggleAll() {
  table.value?.selectAll()
}
</script>

<style scoped lang="scss">
.selection-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-left: 12px;
}
</style>
