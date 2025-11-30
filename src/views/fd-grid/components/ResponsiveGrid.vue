<template>
  <fd-grid :cols="{ xs: 1, sm: 2, md: 3 }" :row-gap="12" :col-gap="12" :collapsed="true" :collapsed-rows="2">
    <fd-grid-item v-for="i in 8" :key="i">
      <div class="grid-box">
        内容 {{ i }}
      </div>
    </fd-grid-item>
  </fd-grid>
</template>

<script setup lang="ts">
defineOptions({
  name: "responsive-grid-demo",
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
