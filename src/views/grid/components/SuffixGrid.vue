<template>
  <div class="demo-container">
    <!-- Search Bar Simulation -->
    <div class="search-panel">
      <div class="panel-header">
        <h4>高级筛选</h4>
        <div class="header-actions">
          <el-button circle size="small" @click="itemCount = Math.max(1, itemCount - 1)">
            <el-icon><minus /></el-icon>
          </el-button>
          <span class="count">{{ itemCount }} 字段</span>
          <el-button circle size="small" @click="itemCount++">
            <el-icon><plus /></el-icon>
          </el-button>
        </div>
      </div>

      <fd-grid :cols="{ xs: 1, sm: 2, md: 4 }" :row-gap="16" :col-gap="16" :collapsed="collapsed" :collapsed-rows="1">
        <fd-grid-item v-for="i in itemCount" :key="i">
          <div class="form-item">
            <span class="label">筛选字段 {{ i }}</span>
            <el-input placeholder="请输入内容..." size="default">
              <template #prefix>
                <el-icon class="input-icon">
                  <search />
                </el-icon>
              </template>
            </el-input>
          </div>
        </fd-grid-item>

        <!-- Suffix Item -->
        <!-- 使用 style="grid-column-end: -1" 强制使操作区靠右对齐 -->
        <fd-grid-item suffix style="grid-column-end: -1">
          <div class="form-item">
            <!-- 占位 Label，确保按钮组与输入框垂直对齐 -->
            <span class="label" style="opacity: 0; user-select: none">Placeholder</span>
            <div class="action-area">
              <el-button type="primary" :icon="Search"> 搜索 </el-button>
              <el-button :icon="Refresh"> 重置 </el-button>
              <el-button link type="primary" class="collapse-btn" @click="collapsed = !collapsed">
                {{ collapsed ? "展开" : "收起" }}
                <el-icon class="el-icon--right">
                  <arrow-down v-if="collapsed" />
                  <arrow-up v-else />
                </el-icon>
              </el-button>
            </div>
          </div>
        </fd-grid-item>
      </fd-grid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { Plus, Minus, Search, ArrowUp, Refresh, ArrowDown } from "@element-plus/icons-vue"

defineOptions({
  name: "suffix-grid-demo",
})

const collapsed = ref(true)
const itemCount = ref(5)
</script>

<style scoped lang="scss">
.demo-container {
  padding: 10px;
}

.search-panel {
  gap: 20px;
  border: 1px solid var(--el-border-color-light);
  display: flex;
  padding: 24px;
  background: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);
  border-radius: 12px;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  border-bottom: 1px dashed var(--el-border-color);
  margin-bottom: 4px;
  padding-bottom: 16px;
  justify-content: space-between;

  h4 {
    color: var(--el-text-color-primary);
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .header-actions {
    gap: 12px;
    display: flex;
    padding: 4px 12px;
    background: var(--el-fill-color-light);
    align-items: center;
    border-radius: 20px;

    .count {
      font-size: 12px;
      min-width: 60px;
      text-align: center;
      font-weight: 600;
    }
  }
}

.form-item {
  gap: 8px;
  display: flex;
  flex-direction: column;

  .label {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    font-weight: 500;
    line-height: 1; /* Normalize line-height for alignment */
  }

  .input-icon {
    color: var(--el-text-color-placeholder);
  }
}

.action-area {
  gap: 12px;
  display: flex;
  align-items: center;

  .collapse-btn {
    margin-left: 8px;
  }
}
</style>
