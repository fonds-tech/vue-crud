<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-content">
        <h2>CRUD 演示</h2>
        <p>不同的 CRUD 组合调试场景</p>
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
import ClassicCrud from "./components/ClassicCrud.vue"
import CompactCrud from "./components/CompactCrud.vue"
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
    key: "classic",
    title: "经典 CRUD 布局",
    badge: "综合示例",
    description: "包含搜索、表格与详情面板的完整演示。",
    component: ClassicCrud,
  },
  {
    key: "minimal",
    title: "紧凑表格模式",
    badge: "列表页",
    description: "搜索栏压缩为两列，仅展示核心字段与批量操作按钮。",
    component: CompactCrud,
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
  margin-bottom: 32px;
  justify-content: space-between;
}

.header-content h2 {
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-style: italic;
  font-weight: 900;
  text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

:global(html.dark) .header-content h2 {
  color: #fff;
  text-shadow: 0 0 15px var(--color-primary);
}

.header-content p {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 0.9rem;
  font-family: "Inter", monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* Segmented Control Tabs - Tech Style */
.tabs-group {
  gap: 8px;
  border: 1px solid var(--color-border);
  display: flex;
  padding: 4px;
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
  background: rgba(0, 0, 0, 0.05);
}

:global(html.dark) .tabs-group {
  background: rgba(255, 255, 255, 0.02);
  border-color: var(--color-border-subtle);
}

.tab-item {
  color: var(--color-text-secondary);
  border: 1px solid transparent;
  cursor: pointer;
  padding: 8px 20px;
  position: relative;
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  font-size: 0.85rem;
  background: transparent;
  transition: all 0.2s ease;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.tab-item:hover {
  color: var(--color-text-primary);
  transform: skewX(-10deg);
  background: var(--color-bg-surface-hover);
}

.tab-item.active {
  color: #fff;
  z-index: 1;
  background: var(--color-primary);
  box-shadow: 0 0 15px var(--color-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  border-color: var(--color-accent);
}

/* Preview Card - Main HUD */
.preview-card {
  border: 2px solid var(--color-border);
  display: flex;
  overflow: hidden;
  position: relative;
  background: var(--card-bg);
  box-shadow: var(--shadow-card);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-direction: column;
}

:global(html.dark) .preview-card {
  box-shadow:
    0 0 0 1px var(--color-border-subtle),
    0 10px 30px rgba(0, 0, 0, 0.5);
  border-color: var(--color-border);
}

/* Corner Accents */
.preview-card::before {
  top: -2px;
  left: -2px;
  width: 20px;
  height: 20px;
  content: "";
  z-index: 10;
  position: absolute;
  border-top: 4px solid var(--color-primary);
  border-left: 4px solid var(--color-primary);
}

.preview-card::after {
  right: -2px;
  width: 20px;
  bottom: -2px;
  height: 20px;
  content: "";
  z-index: 10;
  position: absolute;
  border-right: 4px solid var(--color-primary);
  border-bottom: 4px solid var(--color-primary);
}

.preview-card:hover {
  box-shadow: var(--shadow-glow);
  border-color: var(--color-primary);
}

.preview-info {
  display: flex;
  padding: 20px 32px;
  position: relative;
  background: var(--color-bg-surface);
  align-items: center;
  border-bottom: 1px solid var(--color-border-subtle);
  justify-content: space-between;
}

/* Diagonal Scanline */
.preview-info::after {
  left: 0;
  width: 100%;
  bottom: 0;
  height: 1px;
  content: "";
  opacity: 0.5;
  position: absolute;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
}

.info-text h3 {
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.info-text p {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 0.85rem;
  font-family: "Inter", monospace;
}

.meta-tag {
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  background: var(--color-primary-light);
  font-weight: 700;
  border-radius: 0; /* Tech tag */
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

:global(html.dark) .meta-tag {
  background: rgba(240, 0, 255, 0.1);
  box-shadow: 0 0 10px rgba(240, 0, 255, 0.2);
}

.preview-body {
  padding: 32px;
  min-height: 500px;
  background-size: 20px 20px;
  background-image: radial-gradient(var(--color-border-subtle) 1px, transparent 1px);
}
</style>
