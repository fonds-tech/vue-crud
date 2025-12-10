<template>
  <div class="dialog-example">
    <el-button type="primary" :icon="Promotion" @click="open"> 发起任务 </el-button>
    <span class="operation-tip">点击发起数据迁移任务演示基础弹窗交互</span>

    <fd-dialog ref="dialogRef" title="基础弹窗" width="520px">
      <div class="basic-dialog__content">
        <el-alert title="确认操作" description="请仔细核对以下信息，确认无误后点击提交。" type="warning" show-icon :closable="false" class="mb-4" />

        <el-descriptions :column="1" border>
          <el-descriptions-item label="任务名称"> 数据迁移任务 #2024-001 </el-descriptions-item>
          <el-descriptions-item label="执行人"> Admin </el-descriptions-item>
          <el-descriptions-item label="预计耗时"> 约 15 分钟 </el-descriptions-item>
          <el-descriptions-item label="备注"> 该操作不可逆，请谨慎操作。 </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="close"> 取消 </el-button>
        <el-button type="primary" @click="confirm"> 确定 </el-button>
      </template>
    </fd-dialog>
  </div>
</template>

<script setup lang="ts">
import type { DialogExpose } from "@/components/dialog/types"
import { ref } from "vue"
import { Promotion } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"

defineOptions({
  name: "basic-dialog-demo",
})

const dialogRef = ref<DialogExpose>()

function open() {
  dialogRef.value?.open()
}

function close() {
  dialogRef.value?.close()
}

function confirm() {
  ElMessage.success("操作已确认")
  dialogRef.value?.close()
}
</script>

<style scoped lang="scss">
.dialog-example {
  gap: 12px;
  display: flex;
  align-items: center;
}

.operation-tip {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.basic-dialog__content {
  gap: 16px;
  display: flex;
  flex-direction: column;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
