<template>
  <div class="demo-container">
    <div class="control-panel">
      <div class="header">
        <div class="title-group">
          <h4>动态仪表盘</h4>
          <el-tag type="info" size="small"> 混合排版演示 </el-tag>
        </div>
        <div class="view-controls">
          <span class="label">模拟视图:</span>
          <el-radio-group v-model="currentView" size="small">
            <el-radio-button label="mobile"> 手机 (1列) </el-radio-button>
            <el-radio-button label="tablet"> 平板 (2列) </el-radio-button>
            <el-radio-button label="desktop"> 桌面 (4列) </el-radio-button>
            <el-radio-button label="responsive"> 自适应 (Auto) </el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <p class="desc">
        Grid 布局的优势在于能轻松处理不同尺寸组件的对齐。点击下方卡片的
        <el-icon><full-screen /></el-icon> 图标可动态切换尺寸。
      </p>
    </div>

    <div class="dashboard-stage" :class="currentView">
      <fd-grid :cols="gridCols" :row-gap="16" :col-gap="16">
        <!-- 1. 顶部通栏 -->
        <fd-grid-item :span="gridCols">
          <div class="widget header-widget">
            <div class="left">
              <div class="avatar">admin</div>
              <div class="info">
                <h3>欢迎回来, Administrator</h3>
                <p>上次登录: 2025-11-30</p>
              </div>
            </div>
            <div class="right">
              <el-button type="primary" plain size="small"> 导出报表 </el-button>
            </div>
          </div>
        </fd-grid-item>

        <!-- 2. 数据卡片区 (混合 Span) -->
        <fd-grid-item :span="mainCardSpan">
          <div class="widget stat-card primary interactive" @click="toggleMainCard">
            <div class="card-header">
              <span>总销售额</span>
              <el-icon class="toggle-icon">
                <full-screen />
              </el-icon>
            </div>
            <div class="card-body">
              <span class="currency">¥</span>
              <span class="number">128,432</span>
              <div class="trend up">
                <el-icon><top /></el-icon> 12.5% 同比增长
              </div>
            </div>
            <div class="card-chart-placeholder">
              <!-- 模拟图表波浪 -->
              <svg viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,10 Q10,5 20,10 T40,10 T60,5 T80,15 T100,10 V20 H0 Z" fill="rgba(255,255,255,0.2)" />
              </svg>
            </div>
          </div>
        </fd-grid-item>

        <fd-grid-item :span="subCardSpan">
          <div class="widget stat-card success">
            <div class="card-header">
              <span>活跃用户</span>
            </div>
            <div class="card-body">
              <span class="number">2,048</span>
              <div class="trend">
                <el-icon><right /></el-icon> 持平
              </div>
            </div>
          </div>
        </fd-grid-item>

        <fd-grid-item :span="subCardSpan">
          <div class="widget stat-card warning">
            <div class="card-header">
              <span>待办事项</span>
            </div>
            <div class="card-body">
              <span class="number">12</span>
              <div class="trend down">
                <el-icon><bottom /></el-icon> -2 较昨日
              </div>
            </div>
          </div>
        </fd-grid-item>

        <!-- 3. 密集的小指标区 -->
        <fd-grid-item v-for="i in 4" :key="i" :span="1">
          <div class="widget mini-metric">
            <div class="metric-icon" :class="`color-${i}`">
              <component :is="getIcon(i)" />
            </div>
            <div class="metric-info">
              <span class="label">指标 {{ i }}</span>
              <span class="val">{{ Math.floor(Math.random() * 1000) }}</span>
            </div>
          </div>
        </fd-grid-item>

        <!-- 4. 底部列表与图表 -->
        <fd-grid-item :span="listCardSpan">
          <div class="widget list-widget">
            <div class="widget-title">
              <span>最新订单</span>
              <el-tag size="small" type="success"> 实时 </el-tag>
            </div>
            <div class="list-content">
              <div v-for="n in 4" :key="n" class="list-row">
                <span class="row-id">#{{ 202400 + n }}</span>
                <span class="row-name">产品 {{ String.fromCharCode(64 + n) }}</span>
                <span class="row-status">已发货</span>
              </div>
            </div>
          </div>
        </fd-grid-item>

        <fd-grid-item :span="chartCardSpan">
          <div class="widget chart-widget">
            <div class="widget-title">流量趋势</div>
            <div class="chart-bars">
              <div v-for="k in 12" :key="k" class="bar" :style="{ height: `${Math.random() * 80 + 20}%` }"></div>
            </div>
          </div>
        </fd-grid-item>
      </fd-grid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { Top, Bell, User, Goods, Right, Bottom, Wallet, FullScreen } from "@element-plus/icons-vue"

defineOptions({
  name: "complex-layout-demo",
})

type ViewType = "mobile" | "tablet" | "desktop" | "responsive"
const currentView = ref<ViewType>("responsive")
const isMainExpanded = ref(false)

// 动态计算列数配置
const gridCols = computed(() => {
  switch (currentView.value) {
    case "mobile":
      return 1
    case "tablet":
      return 2
    case "desktop":
      return 4
    default:
      return { xs: 1, sm: 2, md: 4 } // 响应式
  }
})

// 动态计算跨列
// 如果是单列模式，所有 span 强制为 1 (或者 grid 组件会自动处理 span > cols 的情况为满宽，但为了演示清晰我们手动控制一下逻辑)
// 实际上 fd-grid 内部有 clampValue，span > cols 时会自动取 cols。
// 但为了视觉效果，我们在桌面模式下才启用 span 变化。

const currentColsValue = computed(() => {
  if (currentView.value === "mobile") return 1
  if (currentView.value === "tablet") return 2
  if (currentView.value === "desktop") return 4
  return 4 // 假设 responsive 在宽屏下是 4
})

const mainCardSpan = computed(() => {
  if (currentColsValue.value < 2) return 1
  return isMainExpanded.value ? Math.min(4, currentColsValue.value) : 2
})

const subCardSpan = computed(() => 1) // 始终占1列

const listCardSpan = computed(() => {
  if (currentColsValue.value < 2) return 1
  return isMainExpanded.value ? 2 : 2 // 保持 2
})

const chartCardSpan = computed(() => {
  if (currentColsValue.value < 2) return 1
  // 如果主卡片展开了，下面这一行空间剩余可能变化，这里简单处理
  return isMainExpanded.value ? 2 : 2
})

function toggleMainCard() {
  isMainExpanded.value = !isMainExpanded.value
}

const icons = [Wallet, Goods, User, Bell]
const getIcon = (i: number) => icons[(i - 1) % icons.length]
</script>

<style scoped lang="scss">
.demo-container {
  gap: 20px;
  display: flex;
  flex-direction: column;
}

.control-panel {
  border: 1px solid var(--el-border-color-lighter);
  padding: 16px 24px;
  background: var(--el-bg-color);
  border-radius: 12px;

  .header {
    gap: 16px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 12px;
    justify-content: space-between;
  }

  .title-group {
    gap: 12px;
    display: flex;
    align-items: center;
    h4 {
      color: var(--el-text-color-primary);
      margin: 0;
      font-size: 16px;
    }
  }

  .view-controls {
    gap: 12px;
    display: flex;
    align-items: center;
    .label {
      color: var(--el-text-color-secondary);
      font-size: 13px;
    }
  }

  .desc {
    gap: 4px;
    color: var(--el-text-color-secondary);
    margin: 0;
    display: flex;
    font-size: 13px;
    align-items: center;
    line-height: 1.5;
  }
}

.dashboard-stage {
  transition: all 0.3s;

  &.mobile {
    margin: 0 auto;
    max-width: 375px;
  }
  &.tablet {
    margin: 0 auto;
    max-width: 768px;
  }
  &.desktop {
    max-width: 100%;
  }
}

/* Widgets */
.widget {
  border: 1px solid var(--el-border-color-light);
  height: 100%;
  display: flex;
  padding: 20px;
  background: var(--el-bg-color);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-radius: 12px;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--el-box-shadow-light);
    border-color: var(--el-color-primary-light-7);
  }
}

/* Header Widget */
.header-widget {
  background: linear-gradient(to right, var(--el-color-primary-light-9), var(--el-bg-color));
  align-items: center;
  flex-direction: row;
  justify-content: space-between;

  .left {
    gap: 16px;
    display: flex;
    align-items: center;

    .avatar {
      color: white;
      width: 48px;
      height: 48px;
      display: flex;
      font-size: 12px;
      background: var(--el-color-primary);
      align-items: center;
      font-weight: bold;
      border-radius: 50%;
      justify-content: center;
    }

    .info h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
    }
    .info p {
      color: var(--el-text-color-secondary);
      margin: 0;
      font-size: 12px;
    }
  }
}

/* Stat Cards */
.stat-card {
  overflow: hidden;
  position: relative;
  min-height: 140px;
  justify-content: space-between;

  &.interactive {
    cursor: pointer;
    &:hover .toggle-icon {
      opacity: 1;
    }
  }

  &.primary {
    color: white;
    border: none;
    background: linear-gradient(135deg, #409eff, #337ecc);
  }
  &.success {
    color: white;
    border: none;
    background: linear-gradient(135deg, #67c23a, #529b2e);
  }
  &.warning {
    color: white;
    border: none;
    background: linear-gradient(135deg, #e6a23c, #d48806);
  }

  .card-header {
    display: flex;
    opacity: 0.9;
    font-size: 14px;
    justify-content: space-between;

    .toggle-icon {
      opacity: 0.5;
      transition: opacity 0.2s;
    }
  }

  .card-body {
    z-index: 2;
    margin-top: 12px;

    .currency {
      opacity: 0.8;
      font-size: 16px;
      margin-right: 4px;
    }
    .number {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .trend {
      gap: 4px;
      display: flex;
      opacity: 0.9;
      font-size: 12px;
      margin-top: 8px;
      align-items: center;

      &.up {
        color: #d1edc4;
      }
      &.down {
        color: #fcd3d3;
      }
    }
  }

  .card-chart-placeholder {
    left: 0;
    width: 100%;
    bottom: 0;
    height: 60px;
    opacity: 0.3;
    position: absolute;
    pointer-events: none;
  }
}

/* Mini Metric */
.mini-metric {
  gap: 16px;
  padding: 16px;
  align-items: center;
  flex-direction: row;

  .metric-icon {
    width: 40px;
    height: 40px;
    display: flex;
    font-size: 20px;
    align-items: center;
    border-radius: 10px;
    justify-content: center;

    &.color-1 {
      color: var(--el-color-danger);
      background: var(--el-color-danger-light-9);
    }
    &.color-2 {
      color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
    }
    &.color-3 {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
    }
    &.color-4 {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }
  }

  .metric-info {
    display: flex;
    flex-direction: column;
    .label {
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }
    .val {
      color: var(--el-text-color-primary);
      font-size: 18px;
      font-weight: 600;
    }
  }
}

/* List & Chart */
.widget-title {
  display: flex;
  font-size: 14px;
  align-items: center;
  font-weight: 600;
  margin-bottom: 16px;
  justify-content: space-between;
}

.list-content {
  gap: 12px;
  display: flex;
  flex-direction: column;

  .list-row {
    display: flex;
    font-size: 13px;
    border-bottom: 1px dashed var(--el-border-color-lighter);
    padding-bottom: 8px;
    justify-content: space-between;
    &:last-child {
      border: none;
    }

    .row-id {
      color: var(--el-text-color-secondary);
      font-family: monospace;
    }
    .row-status {
      color: var(--el-color-success);
    }
  }
}

.chart-bars {
  gap: 8px;
  flex: 1;
  display: flex;
  align-items: flex-end;
  padding-top: 10px;
  justify-content: space-between;

  .bar {
    flex: 1;
    background: var(--el-color-primary-light-5);
    min-height: 4px;
    transition: height 0.5s ease;
    border-radius: 4px 4px 0 0;

    &:hover {
      background: var(--el-color-primary);
    }
  }
}
</style>
