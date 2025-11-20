<template>
  <div>
    <div class="title">
      CRUD DEMO
    </div>
    <fd-crud>
      <fd-add-button />
      <fd-delete-button />
    </fd-crud>
  </div>
</template>

<script setup lang="ts">
import { useCrud } from "./hooks"

const crud = useCrud(
  {
    service: "test",
  },
  (app) => {
    app.refresh()
  },
)
console.log("🚀 ~ crud:", crud)
</script>

<style scoped>
.title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;

}
</style>
