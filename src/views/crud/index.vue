<template>
  <div class="view-shell">
    <aside class="component-panel">
      <h3>Components</h3>
      <p>在同一工作台内切换不同的 CRUD 组合调试场景。</p>
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
        <el-tag effect="dark" type="primary">
          {{ activeComponent.badge }}
        </el-tag>
      </header>

      <component :is="activeComponent.component" />
    </section>
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
