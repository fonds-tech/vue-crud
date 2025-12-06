<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      删除按钮 + 选中校验
    </h4>
    <p class="demo-card__desc">
      当未选择行时禁用；点击调用 rowDelete。
    </p>

    <fd-crud ref="crudRef">
      <el-space>
        <fd-delete-button />
        <el-button size="small" @click="toggleSelect">
          切换选中状态
        </el-button>
      </el-space>
    </fd-crud>
  </section>
</template>

<script setup lang="ts">
import { useCrud } from "@/hooks"

defineOptions({
  name: "delete-with-selection-demo",
})

const mockRow = { id: 1, name: "待删除项" }
const crudRef = useCrud({
  permission: { delete: true },
  dict: { label: { delete: "删除", deleteConfirm: "确认删除？", confirm: "确认", close: "取消", tips: "提示", deleteSuccess: "删除成功" } } as any,
  service: {
    async page() {
      return { list: [mockRow], pagination: { total: 1, page: 1, size: 20 } }
    },
    delete: async () => Promise.resolve(true),
    _permission: { delete: true },
  } as any,
})

function toggleSelect() {
  const crud = crudRef.value
  if (!crud)
    return
  crud.selection = crud.selection.length ? [] : [mockRow]
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
