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
import { clone } from "@fonds/utils"
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
    cols: 1,
    colGap: 12,
    rowGap: 0,
  },
  form: {
    labelWidth: "80px",
  },
  items: [
    {
      field: "name",
      label: "姓名",
      component: { is: "el-input", props: { placeholder: "请输入姓名" } },
      rules: [{ required: true, message: "请输入姓名", trigger: "blur" }],
    },
    {
      field: "age",
      label: "年龄",
      component: { is: "el-input-number", props: { min: 0 } },
      rules: [
        { required: true, message: "请输入年龄", trigger: "blur" },
        { type: "number", min: 0, max: 120, message: "年龄需在 0-120 岁之间", trigger: "blur" },
      ],
    },
    {
      field: "email",
      label: "邮箱",
      component: { is: "el-input", props: { placeholder: "name@example.com" } },
      rules: [
        { required: true, message: "请输入邮箱地址", trigger: "blur" },
        { type: "email", message: "邮箱格式不正确", trigger: ["blur", "change"] },
      ],
    },
    {
      field: "desc",
      label: "备注",
      component: { is: "el-input", props: { type: "textarea", rows: 2 } },
      rules: [{ max: 200, message: "备注不超过 200 字", trigger: "blur" }],
    },
  ],
}

onMounted(() => {
  formRef.value?.use(clone(options))
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
