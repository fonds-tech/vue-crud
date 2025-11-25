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
        <el-tag effect="plain" type="success" round class="meta-tag">
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
import HookForm from "./components/HookForm.vue"
import ModeForm from "./components/ModeForm.vue"
import TabsForm from "./components/TabsForm.vue"
import BasicForm from "./components/BasicForm.vue"
import StepsForm from "./components/StepsForm.vue"
import DynamicForm from "./components/DynamicForm.vue"
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
    description: "1 列控件展示基础校验，适合入门场景。",
    component: BasicForm,
  },
  {
    key: "tabs",
    title: "Tabs 分段信息",
    badge: "Tabs + 折叠",
    description: "三大分组 + 折叠行演示，展示 help/extra/tooltip。",
    component: TabsForm,
  },
  {
    key: "workflow",
    title: "审批提交流程",
    badge: "工作流",
    description: "包含日期、标签、开关和滑块，模拟审批信息收集。",
    component: WorkflowForm,
  },
  {
    key: "dynamic",
    title: "动态联动表单",
    badge: "Action API",
    description: "使用 setOptions/hideItem/setRequired 实现客户类型联动。",
    component: DynamicForm,
  },
  {
    key: "steps",
    title: "多步骤审批",
    badge: "Steps",
    description: "分步填写并联动步骤条，适合长流程审批。",
    component: StepsForm,
  },
  {
    key: "hook",
    title: "数据钩子转换",
    badge: "Hook",
    description: "演示 number/json/datetimeRange 等 hook 对齐后端结构。",
    component: HookForm,
  },
  {
    key: "mode",
    title: "模式切换场景",
    badge: "Mode",
    description: "setMode + bindFields 复用表单，支持新增/编辑态切换。",
    component: ModeForm,
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

/* Segmented Control Tabs */
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

/* Preview Card */
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
  border: none;
  background: rgba(16, 185, 129, 0.1); /* Greenish for form */
  color: #10b981;
  font-weight: 600;
}

.preview-body {
  padding: 32px;
  min-height: 500px;
}
</style>
