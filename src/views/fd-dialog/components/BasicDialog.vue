<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      基础弹窗
    </h4>
    <p class="demo-card__desc">
      使用 fd-dialog 包裹简单内容，支持外部属性透传。
    </p>

    <el-button type="primary" @click="open">
      打开弹窗
    </el-button>

    <fd-dialog ref="dialogRef" title="基础弹窗" width="520px">
      <p>这里是基础弹窗内容，可以通过 slot 传入任意结构。</p>
    </fd-dialog>
  </section>
</template>

<script setup lang="ts">
import type { DialogExpose } from "@/components/fd-dialog/type"
import { ref } from "vue"

defineOptions({
  name: "basic-dialog-demo",
})

const dialogRef = ref<DialogExpose>()

function open() {
  dialogRef.value?.open()
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
</style>
