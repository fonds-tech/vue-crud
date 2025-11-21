<template>
  <div>
    <div class="title">
      CRUD DEMO
    </div>
    <fd-crud ref="crud">
      <fd-add-button />
      <fd-delete-button />
    </fd-crud>
    <div class="actions">
      <el-button type="primary" @click="openForm">
        打开演示表单
      </el-button>
    </div>
    <fd-form ref="demoForm" />
  </div>
</template>

<script setup lang="ts">
import type { FormExpose } from "./types"
import { ref } from "vue"
import { useCrud } from "./hooks"
import { TestService } from "./utils/test"

const crud = useCrud(
  { service: new TestService() },
  app => app.refresh(),
)

const demoForm = ref<FormExpose>()

function openForm() {
  demoForm.value?.open({
    title: "示例表单",
    width: "600px",
    items: [
      {
        field: "name",
        label: "姓名",
        component: {
          is: "el-input",
          props: {
            placeholder: "请输入姓名",
          },
        },
        required: true,
      },
      {
        field: "age",
        label: "年龄",
        component: {
          is: "el-input-number",
          props: {
            min: 0,
          },
        },
      },
    ],
    form: {
      name: "",
      age: 18,
    },
  })
}
</script>

<style scoped>
.title {
  font-size: 24px;
  text-align: center;
  font-weight: bold;
}
.actions {
  margin: 24px 0;
  text-align: center;
}
</style>
