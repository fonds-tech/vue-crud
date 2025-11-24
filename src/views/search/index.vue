<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-content">
        <h2>搜索演示</h2>
        <p>fd-search 调试场景与布局</p>
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
        <el-tag effect="light" type="warning" round>
          {{ activeComponent.badge }}
        </el-tag>
      </div>

      <div class="preview-body">
        <component :is="activeComponent.component" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CompactSearch from "./components/CompactSearch.vue"
import AdvancedSearch from "./components/AdvancedSearch.vue"
import StackedActions from "./components/StackedActions.vue"
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
    key: "advanced",
    title: "多字段高级搜索",
    badge: "运营场景",
    description: "包含级联、标签、滑块与开关，适合复杂筛选。",
    component: AdvancedSearch,
  },
  {
    key: "compact",
    title: "紧凑搜索栏",
    badge: "轻量页面",
    description: "仅保留常用字段，按钮靠右排列，更适合列表页顶部工具条。",
    component: CompactSearch,
  },
  {
    key: "stacked-actions",
    title: "纵向动作区域",
    badge: "上下排列",
    description: "将搜索/重置按钮堆叠展示，适合窄屏或需要突出动作的场景。",
    component: StackedActions,
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
  align-items: center;
  margin-bottom: 24px;
  justify-content: space-between;
}

.header-content h2 {
  color: var(--text-title);
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
}

.header-content p {
  color: var(--text-sub);
  margin: 0;
  font-size: 14px;
}

/* Modern Tabs */
.tabs-group {
  gap: 4px;
  display: flex;
  padding: 4px;
  background: var(--hover-bg);
  border-radius: 10px;
}

.tab-item {
  color: var(--text-sub);
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  font-size: 14px;
  background: transparent;
  transition: all 0.2s ease;
  font-weight: 500;
  border-radius: 8px;
}

.tab-item:hover {
  color: var(--text-main);
  background: rgba(128, 128, 128, 0.1);
}

.tab-item.active {
  color: var(--active-text);
  background: var(--card-bg);
  box-shadow: var(--shadow-sm);
  font-weight: 600;
}

/* Preview Card */
.preview-card {
  border: 1px solid var(--card-border);
  overflow: hidden;
  background: var(--card-bg);
  box-shadow: var(--shadow-md);
  border-radius: 16px;
}

.preview-info {
  display: flex;
  padding: 20px 24px;
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

.preview-body {
  padding: 24px;
  background: var(--card-bg);
  min-height: 400px;
}
</style>
