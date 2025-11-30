<template>
  <fd-grid :cols="4" :row-gap="16" :col-gap="16">
    <!-- 全宽 -->
    <fd-grid-item :span="4">
      <div class="grid-box highlight">
        Span 4 (Full Width)
      </div>
    </fd-grid-item>

    <!-- 均分 -->
    <fd-grid-item :span="1">
      <div class="grid-box">
        Span 1
      </div>
    </fd-grid-item>
    <fd-grid-item :span="1">
      <div class="grid-box">
        Span 1
      </div>
    </fd-grid-item>
    <fd-grid-item :span="2">
      <div class="grid-box">
        Span 2
      </div>
    </fd-grid-item>

    <!-- 偏移演示 -->
    <fd-grid-item :span="2" :offset="1">
      <div class="grid-box highlight">
        Span 2 + Offset 1 (Centered)
      </div>
    </fd-grid-item>
  </fd-grid>
</template>

<script setup lang="ts">
defineOptions({
  name: "span-offset-grid-demo",
})
</script>

<style scoped lang="scss">
.grid-box {
  color: var(--text-sub);
  border: 1px dashed var(--card-border);
  padding: 16px;
  background: var(--el-fill-color-lighter);
  text-align: center;
  border-radius: 8px;

  &.highlight {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}
</style>
