<template>
  <div>
    <div class="title">
      CRUD DEMO
    </div>
    <fd-crud ref="crud">
      <fd-add-button />
      <fd-delete-button />
    </fd-crud>
  </div>
</template>

<script setup lang="ts">
import { useCrud } from "./hooks"
import { TestService } from "./utils/test"

const crud = useCrud(
  { service: new TestService() },
  app => app.refresh(),
)
console.log("🚀 ~ crud:", crud.value)
</script>

<style scoped>
.title {
  font-size: 24px;
  text-align: center;
  font-weight: bold;
}
</style>
