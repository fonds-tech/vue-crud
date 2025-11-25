<template>
  <div class="form-variant">
    <el-card class="variant-card">
      <fd-form ref="formRef" />
      <div class="action-row">
        <el-button type="primary" @click="handleSubmit">
          提交审批
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
    project: "",
    owner: "",
    start: "",
    end: "",
    tags: [],
    notify: true,
    risk: 2,
    comment: "",
  },
  grid: { cols: 4, colGap: 12, rowGap: 12 },
  form: {
    labelWidth: "90px",
  },
  items: [
    {
      field: "project",
      label: "项目名称",
      component: { is: "el-input", props: { placeholder: "例如：2024Q3 优化" } },
    },
    {
      field: "owner",
      label: "负责人",
      component: { is: "el-input", props: { clearable: true } },
    },
    {
      field: "start",
      label: "开始日期",
      component: { is: "el-date-picker", props: { type: "date", valueFormat: "YYYY-MM-DD" } },
    },
    {
      field: "end",
      label: "结束日期",
      component: { is: "el-date-picker", props: { type: "date", valueFormat: "YYYY-MM-DD" } },
    },
    {
      field: "tags",
      label: "项目标签",
      component: {
        is: "el-select",
        props: { multiple: true, collapseTags: true, placeholder: "请选择标签" },
        options: [
          { label: "重点", value: "important" },
          { label: "跨部门", value: "cross" },
          { label: "体验优化", value: "ux" },
        ],
      },
      span: 2,
    },
    {
      field: "notify",
      label: "通知成员",
      component: { is: "el-switch", props: { activeText: "是", inactiveText: "否" } },
    },
    {
      field: "risk",
      label: "风险级别",
      component: { is: "el-slider", props: { min: 1, max: 5, showStops: true } },
      span: 2,
    },
    {
      field: "comment",
      label: "补充说明",
      component: { is: "el-input", props: { type: "textarea", rows: 3, maxlength: 120, showWordLimit: true } },
      span: 4,
    },
  ],
}

onMounted(() => {
  formRef.value?.use(clone(options))
})

function handleSubmit() {
  formRef.value?.submit().then((res) => {
    console.log("Submit workflow:", res)
  }).catch((err) => {
    console.error("Workflow Submit Error:", err)
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
