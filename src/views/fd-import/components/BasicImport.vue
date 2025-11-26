<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      基础导入
    </h4>
    <p class="demo-card__desc">
      展示上传入口与模板下载按钮，使用模拟接口。
    </p>

    <fd-crud ref="crudRef">
      <fd-import
        title="导入数据"
        :upload="handleUpload"
        :confirm="handleConfirm"
        :template="mockTemplate"
      />
    </fd-crud>
  </section>
</template>

<script setup lang="ts">
import type { CrudRef } from "@/types"
import { ref, onMounted } from "vue"

defineOptions({
  name: "basic-import-demo",
})

const crudRef = ref<CrudRef>()

onMounted(() => {
  crudRef.value?.use?.({
    permission: { add: true },
    dict: {
      label: {
        confirm: "确定",
        close: "关闭",
      },
    } as any,
    service: {} as any,
  })
})

function mockTemplate() {
  return Promise.resolve({ url: "https://example.com/template.xlsx" })
}

function handleUpload(payload: FormData) {
  console.log("upload payload", payload.get("fileData"))
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve({ success: true })
    }, 500)
  })
}

function handleConfirm() {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(true)
    }, 300)
  })
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
