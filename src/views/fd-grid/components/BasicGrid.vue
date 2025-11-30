<template>
  <fd-grid :cols="3" :row-gap="12" :col-gap="12">
    <fd-grid-item v-for="i in 6" :key="i">
      <div class="grid-box">
        单元 {{ i }}
      </div>
    </fd-grid-item>
  </fd-grid>
</template>

<script setup lang="ts">
defineOptions({
  name: "basic-grid-demo",
})
</script>

<style scoped lang="scss">
.grid-box {
  border: 1px dashed var(--card-border);
  padding: 12px;
  background: var(--el-fill-color-lighter);
  text-align: center;
  border-radius: 8px;
}
</style>
