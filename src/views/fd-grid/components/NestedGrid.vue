<template>
  <div class="nested-demo">
    <fd-grid :cols="2" :row-gap="20" :col-gap="20">
      <!-- Left Column: Simple Content -->
      <fd-grid-item>
        <div class="grid-box tall">
          <h3>侧边栏</h3>
          <p>这是一个普通的栅格项</p>
        </div>
      </fd-grid-item>

      <!-- Right Column: Nested Grid -->
      <fd-grid-item>
        <div class="nested-container">
          <h4 class="mb-2">
            嵌套网格区域
          </h4>
          <fd-grid :cols="3" :row-gap="10" :col-gap="10">
            <fd-grid-item v-for="i in 6" :key="i">
              <div class="grid-box sub-item">
                子项 {{ i }}
              </div>
            </fd-grid-item>
          </fd-grid>
        </div>
      </fd-grid-item>
    </fd-grid>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "nested-grid-demo",
})
</script>

<style scoped lang="scss">
.nested-demo {
  // Just a container
}

.mb-2 {
  margin-bottom: 8px;
}

.nested-container {
  border: 1px solid var(--card-border);
  height: 100%;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.grid-box {
  color: var(--text-main);
  border: 1px dashed var(--card-border);
  padding: 16px;
  background: var(--el-fill-color-lighter);
  text-align: center;
  border-radius: 4px;

  &.tall {
    color: var(--el-color-primary);
    height: 100%;
    display: flex;
    min-height: 150px;
    align-items: center;
    border-color: var(--el-color-primary-light-5);
    flex-direction: column;
    justify-content: center;
    background-color: var(--el-color-primary-light-9);
  }

  &.sub-item {
    padding: 8px;
    font-size: 12px;
    background: var(--el-bg-color);
  }
}
</style>
