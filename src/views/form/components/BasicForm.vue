<template>
  <div class="form-variant">
    <el-card class="variant-card">
      <fd-form ref="formRef" />
      <div class="action-row">
        <el-button type="primary" @click="handleSubmit">
          提交
        </el-button>
        <el-button @click="handleReset">
          重置
        </el-button>
      </div>
    </el-card>

    <el-card class="variant-card">
      <div class="panel-title">
        <h3>当前模型</h3>
        <span>实时同步</span>
      </div>
      <pre>{{ formModel }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { FormRef, FormUseOptions } from "@/components/fd-form/type"
import { cloneDeep } from "lodash-es"
import { ref, computed, onMounted } from "vue"

const formRef = ref<FormRef>()
const formModel = computed(() => formRef.value?.model ?? {})

const options: FormUseOptions = {
  model: {
    name: "",
    age: 18,
    email: "",
    desc: "",
  },
  grid: {
    cols: 4,
    colGap: 12,
    rowGap: 12,
  },
  form: {
    labelWidth: "80px",
  },
  items: [
    {
      field: "name",
      label: "姓名",
      component: { is: "el-input", props: { placeholder: "请输入姓名" } },
    },
    {
      field: "age",
      label: "年龄",
      component: { is: "el-input-number", props: { min: 0 } },
    },
    {
      field: "email",
      label: "邮箱",
      component: { is: "el-input", props: { placeholder: "name@example.com" } },
    },
    {
      field: "desc",
      label: "备注",
      component: { is: "el-input", props: { type: "textarea", rows: 2 } },
      span: 2,
    },
  ],
}

onMounted(() => {
  formRef.value?.use(cloneDeep(options))
})

function handleSubmit() {
  formRef.value?.submit().then((res) => {
    console.log("Submit:", res)
  }).catch((err) => {
    console.error("Submit Error:", err)
  })
}

function handleReset() {
  formRef.value?.resetFields()
}
</script>

<style scoped>
.form-variant {
  gap: 16px;
  display: flex;
  flex-direction: column;
}

.variant-card {
  border: none;
  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.08);
  border-radius: 20px;
}

.action-row {
  gap: 12px;
  display: flex;
  margin-top: 16px;
  justify-content: flex-end;
}

.panel-title {
  color: #909399;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  justify-content: space-between;
}

pre {
  color: #e5e7eb;
  margin: 0;
  padding: 16px;
  overflow: auto;
  background: #111827;
  max-height: 240px;
  font-family: "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
  border-radius: 14px;
}
</style>
