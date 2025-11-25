<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-content">
        <h2>Context Menu 演示</h2>
        <p>展示 fd-context-menu 在右键触发、组件模式下的典型用法。</p>
      </div>

      <div class="tabs-group">
        <button
          v-for="component in componentCatalog"
          :key="component.key"
          class="tab-item"
          :class="{ active: component.key === activeComponentKey }"
          @click="activeComponentKey = component.key"
        >
          {{ component.title }}
        </button>
      </div>
    </header>

    <div class="preview-card">
      <div class="preview-info">
        <div class="info-text">
          <h3>{{ activeComponent.title }}</h3>
          <p>{{ activeComponent.description }}</p>
        </div>
        <el-tag effect="plain" type="info" round class="meta-tag">
          {{ activeComponent.badge }}
        </el-tag>
      </div>

      <div class="preview-body dot-pattern">
        <component :is="activeComponent.component" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BasicContextMenu from "./components/BasicContextMenu.vue"
import AdvancedContextMenu from "./components/AdvancedContextMenu.vue"
import { ref, computed } from "vue"

interface ComponentMeta {
  key: string
  title: string
  badge: string
  description: string
  component: any
}

const componentCatalog: ComponentMeta[] = [
  {
    key: "basic",
    title: "右键菜单",
    badge: "API",
    description: "在任意元素上右键弹出菜单，展示多级项、禁用项和 hover 高亮。",
    component: BasicContextMenu,
  },
  {
    key: "advanced",
    title: "自定义内容",
    badge: "组件",
    description: "通过模板方式完全掌控菜单内容，可切换 slot 版本或列表版本。",
    component: AdvancedContextMenu,
  },
]

const activeComponentKey = ref(componentCatalog[0].key)
const activeComponent = computed(() => componentCatalog.find(item => item.key === activeComponentKey.value) ?? componentCatalog[0])
</script>

<style scoped>
.page-container {
  max-width: 100%;
}

.page-header {
  gap: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  margin-bottom: 24px;
  justify-content: space-between;
}

.header-content h2 {
  margin: 0 0 6px 0;
  font-size: 28px;
  background: var(--primary-gradient);
  font-weight: 800;
  letter-spacing: -0.03em;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-content p {
  color: var(--text-sub);
  margin: 0;
  font-size: 14px;
}

.tabs-group {
  gap: 2px;
  display: flex;
  padding: 4px;
  background: var(--divider-color);
  border-radius: var(--radius-md);
}

.tab-item {
  color: var(--text-sub);
  border: none;
  cursor: pointer;
  padding: 6px 16px;
  font-size: 13px;
  background: transparent;
  transition: all 0.2s ease;
  font-weight: 500;
  border-radius: 6px;
}

.tab-item:hover {
  color: var(--text-title);
}

.tab-item.active {
  color: var(--text-title);
  background: var(--card-bg);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  font-weight: 600;
}

.preview-card {
  border: 1px solid var(--card-border);
  display: flex;
  overflow: hidden;
  background: var(--card-bg);
  box-shadow: var(--shadow-md);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-radius: var(--radius-xl);
  flex-direction: column;
}

.preview-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md), var(--shadow-glow);
  border-color: rgba(59, 130, 246, 0.3);
}

.preview-info {
  display: flex;
  padding: 20px 32px;
  background: var(--card-bg);
  align-items: center;
  border-bottom: 1px solid var(--divider-color);
  justify-content: space-between;
}

.info-text h3 {
  color: var(--text-title);
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.info-text p {
  color: var(--text-sub);
  margin: 0;
  font-size: 13px;
}

.meta-tag {
  color: #3b82f6;
  border: none;
  background: rgba(59, 130, 246, 0.1);
  font-weight: 600;
}

.preview-body {
  padding: 32px;
  min-height: 520px;
}
</style>
