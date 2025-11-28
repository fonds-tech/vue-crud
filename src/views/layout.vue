<template>
  <div class="layout">
    <header class="layout__header">
      <div class="layout__header-content">
        <h2 class="layout__title">
          {{ title }}
        </h2>
        <p class="layout__description">
          {{ description }}
        </p>
      </div>

      <div class="layout__tabs">
        <button
          v-for="component in components"
          :key="component.key"
          class="layout__tab"
          :class="{ 'layout__tab--active': component.key === activeComponentKey }"
          @click="activeComponentKey = component.key"
        >
          {{ component.title }}
        </button>
      </div>
    </header>

    <div class="layout__preview">
      <div class="layout__preview-info">
        <div class="layout__info-text">
          <h3 class="layout__preview-title">
            {{ activeComponent.title }}
            <span v-if="activeComponent.componentName" class="layout__component-name">
              - {{ activeComponent.componentName }}
            </span>
          </h3>
          <p class="layout__preview-description">
            {{ activeComponent.description }}
          </p>
        </div>
        <el-tag effect="plain" :type="activeComponent.tagType || 'primary'" round class="layout__meta-tag">
          {{ activeComponent.badge }}
        </el-tag>
      </div>

      <div class="layout__preview-body dot-pattern">
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
  componentName?: string
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

<style scoped lang="scss">
.layout {
  gap: 20px;
  flex: 1;
  display: flex;
  overflow: hidden;
  flex-direction: column;

  &__header {
    gap: 20px;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
  }

  &__header-content {
    h2 {
      margin: 0 0 6px 0;
      font-size: 28px;
      background: var(--primary-gradient);
      font-weight: 800;
      letter-spacing: -0.03em;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p {
      color: var(--text-sub);
      margin: 0;
      font-size: 14px;
    }
  }

  &__title {
    font: inherit;
  }

  &__description {
    font: inherit;
  }

  &__tabs {
    gap: 2px;
    display: flex;
    padding: 4px;
    background: var(--divider-color);
    border-radius: var(--radius-md);
  }

  &__tab {
    color: var(--text-sub);
    border: none;
    cursor: pointer;
    padding: 6px 16px;
    font-size: 13px;
    background: transparent;
    transition: all 0.2s ease;
    font-weight: 500;
    border-radius: 6px;

    &:hover {
      color: var(--text-title);
    }

    &--active {
      color: var(--text-title);
      background: var(--card-bg);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
      font-weight: 600;
    }
  }

  &__preview {
    flex: 1;
    border: 1px solid var(--card-border);
    display: flex;
    padding: 20px;
    overflow: hidden;
    background: var(--card-bg);
    box-shadow: var(--shadow-md);
    box-sizing: border-box;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    border-radius: var(--radius-xl);
    flex-direction: column;

    &:hover {
      box-shadow: var(--shadow-md), var(--shadow-glow);
      border-color: rgba(59, 130, 246, 0.3);
    }
  }

  &__preview-info {
    display: flex;
    background: var(--card-bg);
    align-items: center;
    justify-content: space-between;
  }

  &__info-text {
    h3 {
      color: var(--text-title);
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
    }

    p {
      color: var(--text-sub);
      margin: 0;
      font-size: 13px;
    }
  }

  &__preview-title {
    font: inherit;
  }

  &__preview-description {
    font: inherit;
  }

  &__component-name {
    color: var(--text-sub);
    font-size: 0.9em;
    font-weight: bold;
  }

  &__meta-tag {
    border: none;
    font-weight: 600;

    &.el-tag--primary,
    &.el-tag--info {
      color: #3b82f6;
      background: rgba(59, 130, 246, 0.1);
    }

    &.el-tag--success {
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }

    &.el-tag--warning {
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
    }
  }

  &__preview-body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
}
</style>
