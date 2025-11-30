<template>
  <div class="suffix-demo">
    <div class="toolbar">
      <el-switch v-model="collapsed" active-text="折叠模式" inactive-text="展开模式" />
    </div>

    <fd-grid :cols="4" :row-gap="16" :col-gap="16" :collapsed="collapsed" :collapsed-rows="1">
      <fd-grid-item v-for="i in 7" :key="i">
        <el-input :placeholder="`搜索条件 ${i}`" />
      </fd-grid-item>

      <!-- Suffix Item -->
      <fd-grid-item suffix>
        <div class="actions">
          <el-button type="primary">
            搜索
          </el-button>
          <el-button>重置</el-button>
          <el-button link type="primary" @click="collapsed = !collapsed">
            {{ collapsed ? "展开" : "收起" }}
          </el-button>
        </div>
      </fd-grid-item>
    </fd-grid>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

defineOptions({
  name: "suffix-grid-demo",
})

const collapsed = ref(true)
</script>

<style scoped lang="scss">
.suffix-demo {
  gap: 16px;
  display: flex;
  flex-direction: column;
}

.actions {
  gap: 8px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
