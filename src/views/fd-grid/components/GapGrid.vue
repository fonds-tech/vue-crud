<template>
  <div class="demo-container">
    <div class="control-panel">
      <div class="control-group">
        <span class="label">Row Gap (行距)</span>
        <div class="slider-wrapper">
          <el-slider v-model="rowGap" :min="0" :max="50" :format-tooltip="(val) => `${val}px`" />
        </div>
        <span class="value-tag">{{ rowGap }}px</span>
      </div>
      <div class="control-group">
        <span class="label">Column Gap (列距)</span>
        <div class="slider-wrapper">
          <el-slider v-model="colGap" :min="0" :max="50" :format-tooltip="(val) => `${val}px`" />
        </div>
        <span class="value-tag">{{ colGap }}px</span>
      </div>
    </div>

    <div class="grid-display">
      <fd-grid :cols="3" :row-gap="rowGap" :col-gap="colGap">
        <fd-grid-item v-for="i in 9" :key="i">
          <div class="gap-box">
            <div class="inner-content">
              <el-icon :size="20">
                <component :is="getIcon(i)" />
              </el-icon>
              <span>Item {{ i }}</span>
            </div>
            <div v-if="i % 3 !== 0" class="gap-indicator horizontal"></div>
            <div v-if="i <= 6" class="gap-indicator vertical"></div>
          </div>
        </fd-grid-item>
      </fd-grid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { Bell, Grid, Menu, Star, User, Goods, House, Setting, ElementPlus } from "@element-plus/icons-vue"

defineOptions({
  name: "gap-grid-demo",
})

const rowGap = ref(24)
const colGap = ref(24)

const icons = [ElementPlus, Grid, Menu, Setting, Star, User, House, Goods, Bell]
const getIcon = (i: number) => icons[(i - 1) % icons.length]
</script>

<style scoped lang="scss">
.demo-container {
  gap: 32px;
  display: flex;
  flex-direction: column;
}

.control-panel {
  gap: 20px;
  border: 1px solid var(--el-border-color-lighter);
  display: flex;
  padding: 24px;
  background: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);
  border-radius: 12px;
  flex-direction: column;

  .control-group {
    gap: 20px;
    display: flex;
    align-items: center;

    .label {
      color: var(--el-text-color-primary);
      font-size: 14px;
      min-width: 120px;
      font-weight: 500;
    }

    .slider-wrapper {
      flex: 1;
    }

    .value-tag {
      color: var(--el-color-primary);
      padding: 2px 8px;
      min-width: 60px;
      background: var(--el-color-primary-light-9);
      text-align: right;
      font-family: monospace;
      font-weight: 600;
      border-radius: 4px;
    }
  }
}

.gap-box {
  border: 1px solid var(--el-border-color);
  height: 100px;
  display: flex;
  position: relative;
  background: var(--el-fill-color-light);
  transition: all 0.3s;
  align-items: center;
  border-radius: 8px;
  justify-content: center;

  &:hover {
    color: var(--el-color-primary);
    z-index: 1;
    background: var(--el-color-primary-light-9);
    box-shadow: 0 0 0 2px var(--el-color-primary-light-5);
    border-color: var(--el-color-primary);
  }

  .inner-content {
    gap: 8px;
    color: var(--el-text-color-regular);
    display: flex;
    font-size: 14px;
    align-items: center;
    font-weight: 500;
    flex-direction: column;
  }
}
</style>
