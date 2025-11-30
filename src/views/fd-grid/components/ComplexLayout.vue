<template>
  <div class="dashboard-demo">
    <fd-grid :cols="{ xs: 1, sm: 2, md: 4 }" :row-gap="16" :col-gap="16">
      <!-- Header Widget -->
      <fd-grid-item :span="4">
        <div class="widget header-widget">
          <h3>数据概览仪表盘</h3>
          <span class="tag">实时监控</span>
        </div>
      </fd-grid-item>

      <!-- Big Stats Cards -->
      <fd-grid-item :span="2">
        <div class="widget stat-card primary">
          <h4>总访问量</h4>
          <div class="number">
            88,432
          </div>
        </div>
      </fd-grid-item>
      <fd-grid-item :span="2">
        <div class="widget stat-card success">
          <h4>在线用户</h4>
          <div class="number">
            1,204
          </div>
        </div>
      </fd-grid-item>

      <!-- Smaller Metrics -->
      <fd-grid-item v-for="i in 4" :key="i" :span="1">
        <div class="widget mini-stat">
          <span class="label">指标 {{ i }}</span>
          <span class="value">{{ Math.floor(Math.random() * 100) }}%</span>
        </div>
      </fd-grid-item>

      <!-- Content Area + Side List -->
      <fd-grid-item :span="3">
        <div class="widget main-chart">
          主内容区域 (图表/表格)
        </div>
      </fd-grid-item>
      <fd-grid-item :span="1">
        <div class="widget side-list">
          <div v-for="n in 5" :key="n" class="list-item">
            Top {{ n }}
          </div>
        </div>
      </fd-grid-item>
    </fd-grid>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "complex-layout-demo",
})
</script>

<style scoped lang="scss">
.dashboard-demo {
  // container
}

.widget {
  border: 1px solid var(--card-border);
  height: 100%;
  padding: 16px;
  background: var(--el-bg-color);
  transition: all 0.3s;
  border-radius: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--el-box-shadow-light);
  }
}

.header-widget {
  display: flex;
  background: linear-gradient(90deg, var(--el-color-primary-light-9), var(--el-bg-color));
  align-items: center;
  justify-content: space-between;

  h3 {
    color: var(--el-color-primary);
    margin: 0;
  }

  .tag {
    color: #fff;
    padding: 2px 8px;
    font-size: 12px;
    background: var(--el-color-primary);
    border-radius: 4px;
  }
}

.stat-card {
  display: flex;
  flex-direction: column;
  justify-content: center;

  h4 {
    color: var(--text-sub);
    margin: 0 0 8px 0;
    font-weight: normal;
  }

  .number {
    font-size: 24px;
    font-weight: bold;
  }

  &.primary .number {
    color: var(--el-color-primary);
  }
  &.success .number {
    color: var(--el-color-success);
  }
}

.mini-stat {
  display: flex;
  padding: 12px;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  .label {
    color: var(--text-sub);
    font-size: 12px;
  }

  .value {
    font-size: 18px;
    margin-top: 4px;
    font-weight: 600;
  }
}

.main-chart {
  color: var(--text-sub);
  display: flex;
  background: var(--el-fill-color-lighter);
  min-height: 200px;
  align-items: center;
  justify-content: center;
}

.side-list {
  gap: 8px;
  display: flex;
  flex-direction: column;

  .list-item {
    padding: 4px 0;
    font-size: 13px;
    border-bottom: 1px dashed var(--border-color);
    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
