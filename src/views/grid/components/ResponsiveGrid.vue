<template>
  <div class="demo-container">
    <div class="control-panel">
      <div class="control-group">
        <span class="label">默认折叠</span>
        <el-switch v-model="collapsed" active-text="开启" inactive-text="关闭" />
      </div>
      <div class="divider"></div>
      <div class="control-group">
        <span class="label">保留行数</span>
        <el-input-number v-model="collapsedRows" :min="1" :max="5" size="small" style="width: 100px" />
      </div>
      <div class="breakpoint-hint">
        <el-tag size="small" effect="plain"> xs: 1列 </el-tag>
        <el-tag size="small" effect="plain"> sm: 2列 </el-tag>
        <el-tag size="small" effect="plain"> md: 4列 </el-tag>
      </div>
    </div>

    <div class="grid-stage">
      <!-- 使用 4 列布局在 md 尺寸 -->
      <fd-grid :cols="{ xs: 1, sm: 2, md: 4 }" :row-gap="16" :col-gap="16" :collapsed="collapsed" :collapsed-rows="collapsedRows">
        <fd-grid-item v-for="member in members" :key="member.id">
          <div class="member-card">
            <div class="avatar-wrapper" :style="{ backgroundColor: member.color }">
              {{ member.name.charAt(0) }}
            </div>
            <div class="info">
              <div class="name">
                {{ member.name }}
              </div>
              <div class="role">
                {{ member.role }}
              </div>
            </div>
            <div class="status-dot" :class="{ online: member.online }"></div>
          </div>
        </fd-grid-item>
      </fd-grid>

      <!-- 独立的操作区 (Footer) -->
      <div class="grid-footer-action">
        <el-button v-if="collapsed" type="primary" plain class="expand-btn" @click="collapsed = false">
          查看全部 ({{ members.length }})
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </el-button>
        <el-button v-else link type="info" @click="collapsed = true">
          收起列表
          <el-icon class="el-icon--right">
            <arrow-up />
          </el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { ArrowUp, ArrowDown } from "@element-plus/icons-vue"

defineOptions({
  name: "responsive-grid-demo",
})

const collapsed = ref(true)
const collapsedRows = ref(1)

const roles = ["Product Manager", "Frontend Dev", "Backend Dev", "Designer", "QA Engineer", "DevOps"]
const colors = ["#409EFF", "#67C23A", "#E6A23C", "#F56C6C", "#909399", "#9C27B0"]

const members = Array.from({ length: 11 }).map((_, i) => ({
  id: i,
  name: `Member ${i + 1}`,
  role: roles[i % roles.length],
  color: colors[i % colors.length],
  online: Math.random() > 0.3,
}))
</script>

<style scoped lang="scss">
.demo-container {
  gap: 20px;
  display: flex;
  flex-direction: column;
}

.control-panel {
  gap: 24px;
  border: 1px solid var(--el-border-color-lighter);
  display: flex;
  padding: 16px 24px;
  flex-wrap: wrap;
  background: var(--el-bg-color);
  align-items: center;
  border-radius: 12px;

  .control-group {
    gap: 12px;
    display: flex;
    align-items: center;

    .label {
      color: var(--el-text-color-secondary);
      font-size: 13px;
    }
  }

  .divider {
    width: 1px;
    height: 20px;
    background: var(--el-border-color);
  }

  .breakpoint-hint {
    gap: 8px;
    display: flex;
    margin-left: auto;
  }
}

.member-card {
  border: 1px solid var(--el-border-color-light);
  display: flex;
  padding: 12px 16px;
  position: relative;
  background: var(--el-bg-color);
  transition: all 0.2s ease;
  align-items: center;
  border-radius: 10px;

  &:hover {
    transform: translateY(-2px);
    background: var(--el-color-primary-light-9);
    box-shadow: var(--el-box-shadow-light);
    border-color: var(--el-color-primary-light-5);
  }

  .avatar-wrapper {
    color: white;
    width: 40px;
    height: 40px;
    display: flex;
    font-size: 16px;
    align-items: center;
    flex-shrink: 0;
    font-weight: 600;
    margin-right: 12px;
    border-radius: 50%;
    justify-content: center;
  }

  .info {
    flex: 1;
    overflow: hidden;

    .name {
      color: var(--el-text-color-primary);
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 2px;
    }

    .role {
      color: var(--el-text-color-secondary);
      overflow: hidden;
      font-size: 12px;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background: var(--el-color-info-light-3);
    border-radius: 50%;

    &.online {
      background: var(--el-color-success);
      box-shadow: 0 0 0 2px var(--el-color-success-light-8);
    }
  }
}

.grid-footer-action {
  display: flex;
  margin-top: 16px;
  justify-content: center;

  .expand-btn {
    min-width: 200px;
  }
}
</style>
