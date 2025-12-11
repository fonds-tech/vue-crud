<template>
  <div class="context-card">
    <div class="card-header">
      <div>
        <p class="card-eyebrow">Right Click Demo</p>
        <h3>基础右键菜单</h3>
      </div>
      <el-tag type="primary" effect="light"> ContextMenu.open </el-tag>
    </div>

    <p class="card-desc">在任意区域触发右键事件后调用 <code>ContextMenu.open(event, options)</code> 即可渲染菜单。 下面的面板内置 hover 高亮和多级菜单示例。</p>

    <div class="interactive-area" @contextmenu.prevent="handleContextMenu">
      <p>在此区域点击右键打开菜单</p>
      <small>可尝试选择不同操作或展开子菜单</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContextMenuItem } from "@/components/context-menu/types"
import { ElMessage } from "element-plus"
import { contextMenu } from "@/components/context-menu"

const menuActions: ContextMenuItem[] = [
  {
    label: "查看详情",
    callback: () => ElMessage.success("查看详情") && undefined,
  },
  {
    label: "复制 ID",
    callback: () => ElMessage.success("ID 已复制（示例）") && undefined,
  },
  {
    label: "更多操作",
    children: [
      { label: "导出", callback: () => ElMessage.success("导出成功（示例）") && undefined },
      { label: "下线", disabled: true },
      {
        label: "子级菜单",
        children: [{ label: "移动到其他组" }, { label: "归档" }],
      },
    ],
  },
]

function handleContextMenu(event: MouseEvent) {
  contextMenu.open(event, {
    list: menuActions,
    hover: {
      target: "interactive-area",
    },
  })
}
</script>

<style scoped>
.context-card {
  border: none;
  padding: 24px;
  background: var(--el-bg-color);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  border-radius: 18px;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
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
  margin: 0 0 16px;
  line-height: 1.6;
}

.interactive-area {
  gap: 6px;
  color: var(--text-sub);
  border: 1px dashed rgba(37, 99, 235, 0.4);
  display: flex;
  background: rgba(59, 130, 246, 0.05);
  min-height: 160px;
  text-align: center;
  align-items: center;
  border-radius: 16px;
  flex-direction: column;
  justify-content: center;
}

.interactive-area p {
  color: var(--text-title);
  margin: 0;
  font-weight: 600;
}

.interactive-area small {
  color: var(--text-sub);
}
</style>
