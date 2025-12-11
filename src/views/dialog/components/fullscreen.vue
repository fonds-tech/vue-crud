<template>
  <div class="dialog-example">
    <el-button type="primary" :icon="Monitor" @click="open"> 全屏预览 </el-button>
    <span class="operation-tip">点击预览演示弹窗全屏切换与响应式布局</span>

    <fd-dialog ref="dialogRef" title="全屏弹窗示例" :fullscreen="fullscreen" height="60vh">
      <div class="scroll-content">
        <p v-for="i in 20" :key="i">滚动内容 {{ i }}</p>
      </div>
      <template #footer>
        <div class="footer-actions">
          <el-button @click="toggle"> 切换全屏 </el-button>
          <el-button type="primary" @click="close"> 关闭 </el-button>
        </div>
      </template>
    </fd-dialog>
  </div>
</template>

<script setup lang="ts">
import type { DialogExpose } from "@/components/dialog/types"
import { ref } from "vue"
import { Monitor } from "@element-plus/icons-vue"

defineOptions({
  name: "fullscreen-dialog-demo",
})

const dialogRef = ref<DialogExpose>()
const fullscreen = ref(false)

function open() {
  dialogRef.value?.open()
}

function close() {
  dialogRef.value?.close()
}

function toggle() {
  fullscreen.value = !fullscreen.value
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

.footer-actions {
  gap: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
