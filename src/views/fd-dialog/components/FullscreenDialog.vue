<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      全屏与滚动内容
    </h4>
    <p class="demo-card__desc">
      展示全屏切换、长内容滚动与自定义 footer。
    </p>

    <el-button type="primary" @click="open">
      打开全屏弹窗
    </el-button>

    <fd-dialog ref="dialogRef" title="全屏弹窗示例" :fullscreen="fullscreen" height="60vh">
      <div class="scroll-content">
        <p v-for="i in 20" :key="i">
          滚动内容 {{ i }}
        </p>
      </div>
      <template #footer>
        <div class="footer-actions">
          <el-button @click="toggle">
            切换全屏
          </el-button>
          <el-button type="primary" @click="close">
            关闭
          </el-button>
        </div>
      </template>
    </fd-dialog>
  </section>
</template>

<script setup lang="ts">
import type { DialogExpose } from "@/components/fd-dialog/type"
import { ref } from "vue"

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
.demo-card {
  border: 1px solid var(--card-border);
  padding: 16px;
  background: var(--card-bg);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);

  &__title {
    margin: 0 0 4px 0;
  }

  &__desc {
    color: var(--text-sub);
    margin: 0 0 12px 0;
  }
}

.scroll-content {
  overflow: auto;
  max-height: 320px;
}

.footer-actions {
  gap: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
