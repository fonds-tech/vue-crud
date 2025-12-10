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
            <span v-if="activeComponent.componentName" class="layout__component-name"> - {{ activeComponent.componentName }} </span>
          </h3>
          <p class="layout__preview-description">
            {{ activeComponent.description }}
          </p>
        </div>
        <div class="layout__badge">
          {{ activeComponent.badge }}
        </div>
      </div>

      <div class="layout__preview-body">
        <el-scrollbar v-if="useScrollbar">
          <div class="layout__preview-scrollbar">
            <component :is="activeComponent.component" />
          </div>
        </el-scrollbar>
        <div v-else class="layout__preview-scrollbar layout__preview-scrollbar--native">
          <component :is="activeComponent.component" />
        </div>
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
  tagType?: string // Deprecated, kept for compatibility but unused visually
}

const props = withDefaults(
  defineProps<{
    title: string
    description: string
    components: ComponentMeta[]
    /**
     * 是否使用 el-scrollbar 包裹内容，关闭时使用原生滚动
     */
    useScrollbar?: boolean
  }>(),
  {
    useScrollbar: true,
  },
)

const activeComponentKey = ref(props.components[0]?.key)
const activeComponent = computed(() => props.components.find(item => item.key === activeComponentKey.value) ?? props.components[0])
</script>

<style scoped lang="scss">
.layout {
  gap: 12px;
  height: 100%;
  display: flex;
  padding: 12px;
  overflow: hidden;
  flex-direction: column;

  &__header {
    gap: 24px;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
  }

  &__header-content {
    h2 {
      color: var(--text-main);
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    p {
      color: var(--text-secondary);
      margin: 0;
      font-size: 14px;
    }
  }

  &__tabs {
    gap: 4px;
    border: 1px solid var(--border-color);
    display: flex;
    padding: 4px;
    background: var(--bg-surface);
    border-radius: var(--radius-md);
  }

  &__tab {
    color: var(--text-secondary);
    border: none;
    cursor: pointer;
    padding: 6px 16px;
    font-size: 13px;
    background: transparent;
    transition: all 0.2s;
    font-weight: 500;
    border-radius: 4px;

    &:hover:not(.layout__tab--active) {
      color: var(--text-main);
      background-color: var(--bg-app);
    }

    &--active {
      color: var(--color-primary);
      font-weight: 500;
      background-color: var(--color-primary-light);
    }
  }

  &__preview {
    flex: 1;
    border: 1px solid var(--border-color);
    display: flex;
    overflow: hidden;
    background: var(--bg-surface);
    box-shadow: var(--shadow-sm);
    border-radius: var(--radius-lg);
    flex-direction: column;
  }

  &__preview-info {
    margin: 0 12px;
    display: flex;
    padding: 12px 0;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    justify-content: space-between;
    background-color: var(--bg-surface);
  }

  &__info-text {
    h3 {
      color: var(--text-main);
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
    }

    p {
      color: var(--text-muted);
      margin: 0;
      font-size: 13px;
    }
  }

  &__component-name {
    padding: 2px 6px;
    font-family: monospace;
  }

  &__badge {
    color: var(--color-primary);
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 20px;
    background-color: var(--color-primary-light);
  }

  &__preview-body {
    flex: 1;
    overflow: hidden;
    position: relative;
    background-color: var(--bg-surface);
  }

  &__preview-scrollbar {
    flex: 1;
    display: flex;
    padding: 12px;
    flex-direction: column;
  }

  &__preview-scrollbar--native {
    height: 100%;
    overflow: auto;
  }
}

/* Deep selector for scrollbar content padding */
:deep(.layout__scrollbar-view) {
  padding: 12px;
  box-sizing: border-box;
  min-height: 100%;
}
</style>
