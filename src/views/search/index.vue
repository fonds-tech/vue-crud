<template>
  <div class="view-shell">
    <aside class="component-panel">
      <h3>Components</h3>
      <p>切换不同的 fd-search 调试场景，保持代码结构清晰。</p>
      <button
        v-for="component in componentCatalog"
        :key="component.key"
        type="button"
        class="component-link"
        :class="{ active: component.key === activeComponentKey }"
        @click="activeComponentKey = component.key"
      >
        <strong>{{ component.title }}</strong>
        <span>{{ component.description }}</span>
      </button>
    </aside>

    <section class="preview">
      <header class="preview-header">
        <div>
          <h2>{{ activeComponent.title }}</h2>
          <p>{{ activeComponent.description }}</p>
        </div>
        <el-tag effect="dark" type="warning">
          {{ activeComponent.badge }}
        </el-tag>
      </header>

      <component :is="activeComponent.component" />
    </section>
  </div>
</template>

<script setup lang="ts">
import CompactSearch from "./components/CompactSearch.vue"
import AdvancedSearch from "./components/AdvancedSearch.vue"
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
]

const activeComponentKey = ref(componentCatalog[0].key)
const activeComponent = computed(() => componentCatalog.find(item => item.key === activeComponentKey.value) ?? componentCatalog[0])
</script>

<style scoped>
.view-shell {
  gap: 24px;
  display: flex;
  align-items: flex-start;
}

.component-panel {
  width: 260px;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  border-radius: 18px;
}

.component-panel h3 {
  margin: 0 0 8px;
}

.component-panel p {
  color: #909399;
  margin: 0 0 16px;
  line-height: 1.5;
}

.component-link {
  color: #1f2d3d;
  width: 100%;
  border: 1px solid transparent;
  cursor: pointer;
  padding: 12px 14px;
  background: #f5f7ff;
  text-align: left;
  transition: all 0.2s;
  border-radius: 12px;
  margin-bottom: 10px;
}

.component-link:last-of-type {
  margin-bottom: 0;
}

.component-link strong {
  display: block;
  font-size: 15px;
}

.component-link span {
  color: #636e88;
  display: block;
  font-size: 13px;
  margin-top: 4px;
}

.component-link.active {
  background: #fff;
  box-shadow: 0 10px 24px rgba(64, 158, 255, 0.15);
  border-color: rgba(64, 158, 255, 0.6);
}

.preview {
  gap: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.preview-header {
  gap: 16px;
  display: flex;
  padding: 24px;
  background: #fff;
  box-shadow: 0 15px 38px rgba(15, 23, 42, 0.08);
  align-items: center;
  border-radius: 18px;
  justify-content: space-between;
}

.preview-header h2 {
  margin: 0;
}

.preview-header p {
  color: #606266;
  margin: 6px 0 0;
}

@media (max-width: 960px) {
  .view-shell {
    flex-direction: column;
  }

  .component-panel {
    width: 100%;
  }
}
</style>
