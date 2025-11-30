<template>
  <div class="demo-container">
    <div class="control-panel">
      <div class="panel-header">
        <div class="title-block">
          <h4>嵌套布局演示</h4>
          <p>左侧固定侧边栏，右侧自适应内容区，内容区内嵌 3 列子网格。</p>
        </div>
        <div class="controls">
          <el-switch v-model="showDebug" active-text="显示网格辅助线 (Debug Mode)" />
        </div>
      </div>
    </div>

    <div class="layout-stage" :class="{ 'debug-mode': showDebug }">
      <!-- Outer Grid Wrapper -->
      <div class="grid-wrapper outer-wrapper">
        <div v-if="showDebug" class="debug-label outer">Outer Grid (Cols: 4, Gap: 24px)</div>

        <!-- Outer Grid: 1:3 Ratio -->
        <fd-grid :cols="{ xs: 1, sm: 3, md: 4 }" :row-gap="24" :col-gap="24">
          <!-- Left Sidebar (Takes 1 col) -->
          <fd-grid-item :span="1">
            <div class="sidebar-panel">
              <div class="user-profile">
                <div class="avatar">U</div>
                <div class="username">User Settings</div>
              </div>
              <div class="menu-list">
                <div class="menu-item active">
                  <el-icon><menu /></el-icon>
                  <span>Dashboard</span>
                </div>
                <div class="menu-item">
                  <el-icon><user /></el-icon>
                  <span>Profile</span>
                </div>
                <div class="menu-item">
                  <el-icon><setting /></el-icon>
                  <span>Preferences</span>
                </div>
              </div>
              <div class="sidebar-footer">
                <span class="ver">v1.0.0</span>
              </div>
            </div>
          </fd-grid-item>

          <!-- Right Content (Takes remaining cols) -->
          <fd-grid-item :span="{ xs: 1, sm: 2, md: 3 }">
            <div class="content-panel">
              <div class="content-header">
                <h5>我的应用</h5>
                <el-button type="primary" size="small" plain icon="Plus"> 添加应用 </el-button>
              </div>

              <!-- Inner Nested Grid Wrapper -->
              <div class="nested-grid-wrapper inner-wrapper">
                <div v-if="showDebug" class="debug-label inner">Inner Grid (Cols: 3, Gap: 16px)</div>

                <fd-grid :cols="{ xs: 2, sm: 2, md: 3 }" :row-gap="16" :col-gap="16">
                  <fd-grid-item v-for="app in apps" :key="app.id">
                    <div class="app-card">
                      <div class="app-icon" :style="{ background: app.color }">
                        <component :is="app.icon" />
                      </div>
                      <div class="app-info">
                        <span class="app-name">{{ app.name }}</span>
                        <span class="app-desc">{{ app.desc }}</span>
                      </div>
                      <div class="app-action">
                        <el-icon><more-filled /></el-icon>
                      </div>
                    </div>
                  </fd-grid-item>

                  <!-- Add New Placeholder -->
                  <fd-grid-item>
                    <div class="app-card add-new">
                      <el-icon class="add-icon">
                        <plus />
                      </el-icon>
                      <span>New App</span>
                    </div>
                  </fd-grid-item>
                </fd-grid>
              </div>
            </div>
          </fd-grid-item>
        </fd-grid>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { Plus, User, Goods, Folder, Monitor, Setting, DataLine, MoreFilled, ChatDotRound } from "@element-plus/icons-vue"

defineOptions({
  name: "nested-grid-demo",
})

const showDebug = ref(false)

const apps = [
  { id: 1, name: "Analytics", desc: "Data visualization", color: "#409EFF", icon: DataLine },
  { id: 2, name: "Store", desc: "E-commerce mgt", color: "#67C23A", icon: Goods },
  { id: 3, name: "Chat", desc: "Team connect", color: "#E6A23C", icon: ChatDotRound },
  { id: 4, name: "Files", desc: "Cloud storage", color: "#F56C6C", icon: Folder },
  { id: 5, name: "Monitor", desc: "Server status", color: "#909399", icon: Monitor },
]
</script>

<style scoped lang="scss">
.demo-container {
  gap: 24px;
  display: flex;
  flex-direction: column;
}

.control-panel {
  border: 1px solid var(--el-border-color-lighter);
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 12px;

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title-block {
      h4 {
        color: var(--el-text-color-primary);
        margin: 0 0 4px 0;
        font-size: 16px;
      }
      p {
        color: var(--el-text-color-secondary);
        margin: 0;
        font-size: 13px;
      }
    }
  }
}

/* Debug Mode Styles */
.layout-stage {
  padding: 10px;
  position: relative;
  transition: background-color 0.3s;
  border-radius: 8px;

  &.debug-mode {
    background-color: var(--el-fill-color-lighter);

    .grid-wrapper {
      border: 1px dashed transparent;
      position: relative;

      &.outer-wrapper {
        padding: 20px;
        background: rgba(64, 158, 255, 0.05);
        border-color: var(--el-color-primary-light-5);
        border-radius: 8px;
      }

      .nested-grid-wrapper.inner-wrapper {
        border: 1px dashed var(--el-color-success-light-5);
        padding: 10px;
        background: rgba(103, 194, 58, 0.05);
        margin-top: 10px;
        border-radius: 8px;
      }
    }

    .debug-label {
      top: -12px;
      left: 10px;
      color: white;
      padding: 2px 8px;
      z-index: 10;
      position: absolute;
      font-size: 12px;
      font-weight: bold;
      border-radius: 4px;

      &.outer {
        background-color: var(--el-color-primary);
      }

      &.inner {
        background-color: var(--el-color-success);
      }
    }
  }
}

/* Sidebar Styles */
.sidebar-panel {
  border: 1px solid var(--el-border-color-light);
  height: 100%;
  display: flex;
  overflow: hidden;
  background: var(--el-bg-color);
  min-height: 300px;
  border-radius: 12px;
  flex-direction: column;

  .user-profile {
    gap: 12px;
    display: flex;
    padding: 20px;
    background: var(--el-fill-color-lighter);
    align-items: center;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .avatar {
      color: white;
      width: 36px;
      height: 36px;
      display: flex;
      background: var(--el-color-primary);
      align-items: center;
      font-weight: bold;
      border-radius: 8px;
      justify-content: center;
    }

    .username {
      color: var(--el-text-color-primary);
      font-size: 14px;
      font-weight: 600;
    }
  }

  .menu-list {
    gap: 4px;
    flex: 1;
    display: flex;
    padding: 12px;
    flex-direction: column;

    .menu-item {
      gap: 10px;
      color: var(--el-text-color-regular);
      cursor: pointer;
      display: flex;
      padding: 10px 12px;
      font-size: 14px;
      transition: all 0.2s;
      align-items: center;
      border-radius: 8px;

      &:hover {
        background: var(--el-fill-color);
      }
      &.active {
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
        font-weight: 500;
      }
    }
  }

  .sidebar-footer {
    color: var(--el-text-color-placeholder);
    padding: 12px;
    font-size: 12px;
    border-top: 1px solid var(--el-border-color-lighter);
    text-align: center;
  }
}

/* Content Styles */
.content-panel {
  border: 1px solid var(--el-border-color-light);
  height: 100%;
  display: flex;
  padding: 24px;
  background: var(--el-bg-color);
  border-radius: 12px;
  flex-direction: column;

  .content-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    justify-content: space-between;

    h5 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

/* App Card (Inner Grid Item) */
.app-card {
  gap: 12px;
  border: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  display: flex;
  padding: 16px;
  position: relative;
  background: var(--el-bg-color-overlay);
  transition: all 0.3s;
  align-items: center;
  border-radius: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--el-box-shadow-light);
    border-color: var(--el-color-primary-light-5);

    .app-action {
      opacity: 1;
    }
  }

  .app-icon {
    color: white;
    width: 40px;
    height: 40px;
    display: flex;
    font-size: 20px;
    align-items: center;
    flex-shrink: 0;
    border-radius: 10px;
    justify-content: center;
  }

  .app-info {
    flex: 1;
    overflow: hidden;

    .app-name {
      display: block;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .app-desc {
      color: var(--el-text-color-secondary);
      display: block;
      overflow: hidden;
      font-size: 12px;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  .app-action {
    color: var(--el-text-color-secondary);
    opacity: 0;
    padding: 4px;
    transition: opacity 0.2s;
    &:hover {
      color: var(--el-color-primary);
    }
  }

  &.add-new {
    gap: 8px;
    color: var(--el-text-color-placeholder);
    border-style: dashed;
    justify-content: center;

    &:hover {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary);
    }

    .add-icon {
      font-size: 18px;
    }
    span {
      font-size: 13px;
      font-weight: 500;
    }
  }
}
</style>
