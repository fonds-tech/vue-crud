<template>
  <div class="debug-page">
    <h2>FdForm Debug</h2>

    <el-card header="测试 row 和 col 配置">
      <fd-form ref="form" />
      <div style="margin-top: 20px;">
        <el-button type="primary" @click="handleSubmit">
          提交
        </el-button>
        <el-button @click="handleReset">
          重置
        </el-button>
      </div>
    </el-card>

    <div style="margin-top: 20px;">
      <pre>{{ form?.model }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
// Assuming hooks are exported or I can import useForm from internal helper if not exported globally.
// Actually fd-form exposes `use` method. I should use ref.
import type { FormRef } from "@/components/fd-form/type"
import { ref, onMounted } from "vue"

const form = ref<FormRef>()

onMounted(() => {
  form.value?.use({
    model: {
      name: "",
      age: 18,
      desc: "",
      email: "",
    },
    // 测试全局 row 和 col
    row: {
      gutter: 12,
      justify: "start",
    },
    col: {
      span: 6, // 默认每行2个
    },
    items: [
      {
        field: "name",
        label: "姓名",
        component: { is: "el-input" },
      },
      {
        field: "age",
        label: "年龄",
        component: { is: "el-input-number" },
      },
      {
        field: "email",
        label: "邮箱",
        component: { is: "el-input" },
      },
      {
        field: "desc",
        label: "备注",
        component: { is: "el-input", props: { type: "textarea" } },
      },
    ],
  })
})

function handleSubmit() {
  form.value?.submit().then((res) => {
    console.log("Submit:", res)
  }).catch((err) => {
    console.error("Submit Error:", err)
  })
}

function handleReset() {
  form.value?.resetFields()
}
</script>

<style scoped>
.debug-page {
  margin: 0 auto;
  padding: 24px;
  max-width: 800px;
}
</style>
