<template>
  <div class="gap-demo">
    <div class="controls">
      <div class="control-item">
        <span class="label">行间距 (Row Gap): {{ rowGap }}px</span>
        <el-slider v-model="rowGap" :min="0" :max="50" />
      </div>
      <div class="control-item">
        <span class="label">列间距 (Col Gap): {{ colGap }}px</span>
        <el-slider v-model="colGap" :min="0" :max="50" />
      </div>
    </div>

    <fd-grid :cols="3" :row-gap="rowGap" :col-gap="colGap">
      <fd-grid-item v-for="i in 9" :key="i">
        <div class="grid-box">
          Item {{ i }}
        </div>
      </fd-grid-item>
    </fd-grid>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

defineOptions({
  name: "gap-grid-demo",
})

const rowGap = ref(10)
const colGap = ref(10)
</script>

<style scoped lang="scss">
.gap-demo {
  gap: 20px;
  display: flex;
  flex-direction: column;
}

.controls {
  gap: 32px;
  border: 1px solid var(--border-color);
  display: flex;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;

  .control-item {
    gap: 8px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .label {
    color: var(--text-main);
    font-size: 14px;
  }
}

.grid-box {
  color: var(--el-color-primary);
  border: 1px solid var(--el-color-primary-light-5);
  height: 60px;
  display: flex;
  background: var(--el-color-primary-light-9);
  transition: all 0.3s;
  align-items: center;
  border-radius: 4px;
  justify-content: center;
}
</style>
