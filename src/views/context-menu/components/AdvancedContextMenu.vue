<template>
  <div class="context-card">
    <div class="card-header">
      <div>
        <p class="card-eyebrow">Component Mode</p>
        <h3>受控 + 插槽自定义</h3>
      </div>
      <el-tag type="success" effect="light"> fd-context-menu </el-tag>
    </div>

    <p class="card-desc">当需要完全自定义内容时，可在模板中放置 <code>&lt;fd-context-menu&gt;</code> 并通过状态控制显隐。 点击下方按钮体验：</p>

    <el-space>
      <el-button type="primary" @click="openMenu($event)"> 自定义菜单 </el-button>
      <el-button @click="openMenu($event, true)"> 默认样式菜单 </el-button>
    </el-space>

    <fd-context-menu v-if="state.event" :show="state.show" :event="state.event" :options="state.options">
      <div class="custom-menu">
        <h4>快速动作</h4>
        <div class="menu-item primary" @click="copyLink">复制链接</div>
        <div class="menu-item danger" @click="removeItem">删除</div>
        <el-divider />
        <p class="custom-menu__tip">你可以在这里渲染任何内容，例如表单或统计信息。</p>
      </div>
    </fd-context-menu>
  </div>
</template>

<script setup lang="ts">
import type { ContextMenuOptions } from "@/components/context-menu/types"
import { ElMessage } from "element-plus"
import { watch, reactive } from "vue"

const state = reactive<{ show: boolean, event: MouseEvent | null, options: ContextMenuOptions }>({
  show: false,
  event: null,
  options: {},
})

function openMenu(event: MouseEvent, useList = false) {
  state.event = event
  state.show = true
  state.options = useList
    ? {
        list: [
          { label: "复制链接", callback: closeMenu },
          { label: "删除", callback: closeMenu },
        ],
      }
    : {
        class: "custom-menu-wrapper",
      }
}

function closeMenu() {
  state.show = false
}

function copyLink() {
  ElMessage.success("复制链接（示例）")
  closeMenu()
}

function removeItem() {
  ElMessage.success("删除成功（示例）")
  closeMenu()
}

watch(
  () => state.show,
  (value) => {
    if (!value) {
      state.event = null
    }
  },
)
</script>

<style scoped>
.context-card {
  gap: 16px;
  border: none;
  display: flex;
  padding: 24px;
  background: var(--card-bg);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  justify-content: space-between;
}

.card-eyebrow {
  color: var(--text-sub);
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.card-desc {
  color: var(--text-sub);
  margin: 0;
}

.custom-menu-wrapper {
  padding: 0;
}

.custom-menu {
  gap: 8px;
  display: flex;
  padding: 16px;
  min-width: 200px;
  flex-direction: column;
}

.custom-menu h4 {
  margin: 0;
  font-size: 14px;
}

.custom-menu__tip {
  color: var(--text-sub);
  margin: 0;
  font-size: 12px;
}
.menu-item {
  cursor: pointer;
  padding: 8px 12px;
  font-size: 14px;
  transition: all 0.2s;
  user-select: none;
  border-radius: 6px;
}

.menu-item:hover {
  background-color: var(--el-fill-color-light);
}

.menu-item.primary {
  color: var(--el-color-primary);
}

.menu-item.danger {
  color: var(--el-color-danger);
}
</style>
