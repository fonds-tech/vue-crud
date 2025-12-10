<template>
  <div class="demo-container">
    <div class="control-panel">
      <div class="panel-header">
        <span class="title">基础配置</span>
        <el-tag size="small" effect="plain"> Cols: {{ cols }} </el-tag>
      </div>
      <div class="control-item">
        <span class="label">列数设置</span>
        <el-slider v-model="cols" :min="1" :max="12" :step="1" show-stops tooltip-class="custom-tooltip" />
      </div>
    </div>

    <div class="grid-display">
      <fd-grid :cols="cols" :row-gap="16" :col-gap="16">
        <fd-grid-item v-for="i in 12" :key="i">
          <div class="aesthetic-box" :style="{ '--index': i }">
            <div class="box-content">
              <span class="number">{{ i }}</span>
              <span class="text">Item</span>
            </div>
          </div>
        </fd-grid-item>
      </fd-grid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

defineOptions({
  name: "basic-grid-demo",
})

const cols = ref(4)
</script>

<style scoped lang="scss">
.demo-container {
  gap: 24px;
  display: flex;
  flex-direction: column;
}

.control-panel {
  gap: 16px;
  border: 1px solid var(--el-border-color-lighter);
  display: flex;
  padding: 20px;
  background: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);
  border-radius: 12px;
  flex-direction: column;

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title {
      color: var(--el-text-color-primary);
      font-weight: 600;
    }
  }

  .control-item {
    gap: 20px;
    display: flex;
    align-items: center;

    .label {
      color: var(--el-text-color-regular);
      font-size: 14px;
      min-width: 60px;
    }

    .el-slider {
      flex: 1;
    }
  }
}

.aesthetic-box {
  border: 1px solid var(--el-color-primary-light-7);
  cursor: pointer;
  height: 100px;
  display: flex;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, var(--el-color-primary-light-8), var(--el-color-primary-light-9));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  align-items: center;
  border-radius: 12px;
  justify-content: center;

  &::before {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    content: "";
    opacity: 0;
    position: absolute;
    background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.8), transparent 70%);
    transition: opacity 0.3s;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px -4px var(--el-color-primary-light-8);
    border-color: var(--el-color-primary-light-5);

    &::before {
      opacity: 1;
    }

    .number {
      transform: scale(1.1);
    }
  }

  .box-content {
    display: flex;
    z-index: 1;
    align-items: center;
    flex-direction: column;
  }

  .number {
    color: var(--el-color-primary);
    opacity: 0.8;
    font-size: 28px;
    transition: transform 0.3s;
    font-weight: 800;
  }

  .text {
    color: var(--el-color-primary-light-3);
    font-size: 12px;
    margin-top: 4px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
}
</style>
