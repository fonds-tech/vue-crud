<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-content">
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>

      <div class="tabs-group">
        <button
          v-for="component in components"
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
        <el-tag effect="plain" :type="activeComponent.tagType || 'primary'" round class="meta-tag">
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
import type { Component } from "vue"
import { ref, computed } from "vue"

export interface ComponentMeta {
  key: string
  title: string
  badge: string
  description: string
  component: Component
  tagType?: "primary" | "success" | "info" | "warning" | "danger"
}

const props = defineProps<{
  title: string
  description: string
  components: ComponentMeta[]
}>()

const activeComponentKey = ref(props.components[0]?.key)
const activeComponent = computed(() => props.components.find(item => item.key === activeComponentKey.value) ?? props.components[0])
</script>

<style scoped>
.page-container {
  display: flex;
  max-width: 100%;
  flex-direction: column;
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
  flex: 1;
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
  border: none;
  font-weight: 600;
}

.meta-tag.el-tag--primary,
.meta-tag.el-tag--info {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.meta-tag.el-tag--success {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.meta-tag.el-tag--warning {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.preview-body {
  padding: 32px;
  min-height: 520px;
}
</style>
