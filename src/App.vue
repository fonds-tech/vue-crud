<template>
  <div>
    <div class="title">
      CRUD DEMO
    </div>
    <fd-crud ref="crud">
      <fd-add-button />
      <fd-delete-button />
      <fd-dialog v-model="show" title="弹窗">
        <div style="background-color: antiquewhite;height: 200vh;"></div>
      </fd-dialog>
    </fd-crud>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useCrud } from "./hooks"
import { TestService } from "./utils/test"

const show = ref(true)

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
