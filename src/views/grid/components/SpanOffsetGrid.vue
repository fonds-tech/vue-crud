<template>
  <div class="demo-container">
    <div class="control-panel">
      <div class="panel-header">
        <span class="title">布局调试</span>
        <div class="tags">
          <el-tag type="danger" size="small"> Active Span: {{ dynamicSpan }} </el-tag>
          <el-tag type="warning" size="small"> Active Offset: {{ dynamicOffset }} </el-tag>
        </div>
      </div>

      <div class="controls-row">
        <div class="control-group">
          <span class="label">Span (跨列)</span>
          <el-slider v-model="dynamicSpan" :min="1" :max="4" show-stops :marks="{ 1: '1', 4: 'Max' }" />
        </div>
        <div class="divider"></div>
        <div class="control-group">
          <span class="label">Offset (偏移)</span>
          <el-slider v-model="dynamicOffset" :min="0" :max="3" show-stops :marks="{ 0: '0', 3: 'Max' }" />
        </div>
      </div>
    </div>

    <div class="grid-stage">
      <fd-grid :cols="4" :row-gap="20" :col-gap="20">
        <!-- Static Items -->
        <fd-grid-item :span="4">
          <div class="grid-card static full-width">
            <div class="card-icon">⚓️</div>
            <div class="card-info">
              <h4>Fixed Header</h4>
              <p>Span 4 (Full Width)</p>
            </div>
          </div>
        </fd-grid-item>

        <fd-grid-item :span="1">
          <div class="grid-card static">S1</div>
        </fd-grid-item>
        <fd-grid-item :span="1">
          <div class="grid-card static">S1</div>
        </fd-grid-item>

        <!-- Dynamic Item -->
        <fd-grid-item :span="dynamicSpan" :offset="dynamicOffset">
          <div class="grid-card dynamic">
            <div class="dynamic-badge">Active</div>
            <div class="card-content">
              <span class="value">{{ dynamicSpan }}</span>
              <span class="label">Span</span>
            </div>
            <div class="separator"></div>
            <div class="card-content">
              <span class="value">{{ dynamicOffset }}</span>
              <span class="label">Offset</span>
            </div>
          </div>
        </fd-grid-item>

        <!-- Filler -->
        <fd-grid-item v-for="i in 2" :key="i" :span="1">
          <div class="grid-card filler">
            <span>Filler</span>
          </div>
        </fd-grid-item>
      </fd-grid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

defineOptions({
  name: "span-offset-grid-demo",
})

const dynamicSpan = ref(2)
const dynamicOffset = ref(1)
</script>

<style scoped lang="scss">
.demo-container {
  gap: 24px;
  display: flex;
  flex-direction: column;
}

.control-panel {
  border: 1px solid var(--el-border-color-lighter);
  padding: 24px;
  background: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);
  border-radius: 16px;
}

.panel-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  justify-content: space-between;

  .title {
    color: var(--el-text-color-primary);
    font-size: 16px;
    font-weight: 600;
  }

  .tags {
    gap: 8px;
    display: flex;
  }
}

.controls-row {
  gap: 32px;
  display: flex;
  align-items: flex-start;

  .control-group {
    gap: 12px;
    flex: 1;
    display: flex;
    flex-direction: column;

    .label {
      color: var(--el-text-color-secondary);
      font-size: 13px;
      font-weight: 500;
    }
  }

  .divider {
    width: 1px;
    height: 40px;
    align-self: center;
    background: var(--el-border-color-lighter);
  }
}

.grid-stage {
  padding: 8px;
}

.grid-card {
  height: 100px;
  display: flex;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  align-items: center;
  font-weight: 500;
  border-radius: 12px;
  justify-content: center;

  &.static {
    color: var(--el-text-color-secondary);
    border: 2px solid transparent;
    background: var(--el-fill-color);

    &.full-width {
      gap: 16px;
      color: var(--el-text-color-primary);
      padding: 0 24px;
      background: var(--el-fill-color-dark);
      justify-content: flex-start;

      .card-icon {
        font-size: 24px;
      }

      .card-info {
        display: flex;
        flex-direction: column;

        h4 {
          margin: 0;
          font-size: 15px;
        }
        p {
          margin: 2px 0 0 0;
          opacity: 0.7;
          font-size: 12px;
        }
      }
    }
  }

  &.dynamic {
    gap: 20px;
    color: white;
    overflow: hidden;
    position: relative;
    background: linear-gradient(135deg, var(--el-color-danger), var(--el-color-warning));
    box-shadow: 0 8px 20px -6px var(--el-color-danger-light-3);

    .dynamic-badge {
      top: 6px;
      right: 8px;
      padding: 2px 6px;
      position: absolute;
      font-size: 10px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .card-content {
      display: flex;
      align-items: center;
      flex-direction: column;

      .value {
        font-size: 24px;
        font-weight: 700;
        line-height: 1;
      }
      .label {
        opacity: 0.8;
        font-size: 11px;
        margin-top: 4px;
        text-transform: uppercase;
      }
    }

    .separator {
      width: 1px;
      height: 30px;
      background: rgba(255, 255, 255, 0.3);
    }
  }

  &.filler {
    color: var(--el-text-color-placeholder);
    border: 2px dashed var(--el-border-color);
    background: transparent;
  }
}
</style>
