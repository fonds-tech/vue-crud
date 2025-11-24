<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-content">
        <h2>表单演示</h2>
        <p>不同的 fd-form 配置与布局演示</p>
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
        <el-tag effect="light" type="success" round>
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
import BasicForm from "./components/BasicForm.vue"
import WorkflowForm from "./components/WorkflowForm.vue"
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
    title: "基础信息表单",
    badge: "标准布局",
    description: "4 列布局，适合通用信息采集。",
    component: BasicForm,
  },
  {
    key: "workflow",
    title: "审批提交流程",
    badge: "工作流",
    description: "包含日期、标签、开关和滑块，模拟审批信息收集。",
    component: WorkflowForm,
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
  gap: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 20px;
  justify-content: space-between;
}

.header-content h2 {
  color: var(--text-title);
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.header-content p {
  color: var(--text-sub);
  margin: 0;
  font-size: 14px;
}

/* Modern Tabs */
.tabs-group {
  gap: 2px;
  border: 1px solid var(--divider-color);
  display: flex;
  padding: 3px;
  background: var(--hover-bg);
  border-radius: 8px;
}

.tab-item {
  color: var(--text-sub);
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  font-size: 13px;
  background: transparent;
  transition: all 0.15s ease;
  font-weight: 500;
  border-radius: 6px;
}

.tab-item:hover {
  color: var(--text-main);
  background: rgba(0, 0, 0, 0.02);
}

.tab-item.active {
  color: var(--text-title);
  background: var(--card-bg);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-weight: 600;
}

/* Preview Card */
.preview-card {
  border: 1px solid var(--card-border);
  overflow: hidden;
  background: var(--card-bg);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);
}

.preview-info {
  display: flex;
  padding: 16px 24px;
  background: var(--card-bg);
  align-items: center;
  border-bottom: 1px solid var(--divider-color);
  justify-content: space-between;
}

.info-text h3 {
  color: var(--text-title);
  margin: 0 0 2px 0;
  font-size: 15px;
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
