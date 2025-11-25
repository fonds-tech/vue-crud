<template>
  <div class="form-variant">
    <el-card class="variant-card">
      <el-alert
        :type="modeLabel === 'add' ? 'info' : 'warning'"
        show-icon
        :closable="false"
        class="mode-alert"
      >
        当前模式：{{ modeLabel === "add" ? "新增" : "编辑" }} ｜ 使用 setMode + bindFields 演示同表单复用
      </el-alert>

      <fd-form ref="formRef" />
      <div class="action-row">
        <el-button type="primary" @click="handleSubmit">
          保存
        </el-button>
        <el-button @click="handleReset">
          重置
        </el-button>
        <el-button text type="primary" @click="loadAddMode">
          切换新增场景
        </el-button>
        <el-button text type="primary" @click="loadUpdateMode">
          切换编辑场景
        </el-button>
      </div>
    </el-card>

    <el-card class="variant-card">
      <div class="panel-title">
        <div>
          <h3>模式详情</h3>
          <span class="step-desc">mode = {{ modeLabel }}</span>
        </div>
      </div>
      <pre>{{ formModel }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { FormRef, FormUseOptions } from "@/components/fd-form/type"
import { cloneDeep } from "lodash-es"
import { ref, computed, onMounted } from "vue"

interface ProjectPayload {
  projectName: string
  projectCode: string
  owner: string
  priority: string
  budget: number
  status: string
  reviewComment: string
  attachments: string[]
}

const draftRecord: ProjectPayload = {
  projectName: "AI 质检平台",
  projectCode: "AI-2024-NEW",
  owner: "秦更新",
  priority: "high",
  budget: 80,
  status: "draft",
  reviewComment: "",
  attachments: [],
}

const reviewRecord: ProjectPayload = {
  projectName: "国际化改造",
  projectCode: "INTL-2023-007",
  owner: "盛评估",
  priority: "medium",
  budget: 150,
  status: "review",
  reviewComment: "第二阶段需要增加灰度指标。",
  attachments: ["合同.pdf"],
}

const formRef = ref<FormRef<ProjectPayload>>()
const formModel = computed(() => formRef.value?.model ?? draftRecord)
const modeLabel = computed(() => formRef.value?.mode ?? "add")

const options: FormUseOptions<ProjectPayload> = {
  mode: "add",
  model: draftRecord,
  grid: {
    cols: 2,
    colGap: 18,
    rowGap: 12,
  },
  form: {
    labelWidth: "110px",
  },
  items: [
    {
      field: "projectName",
      label: "项目标题",
      component: { is: "el-input", props: { placeholder: "请输入项目标题" } },
      rules: [{ required: true, message: "请输入项目标题", trigger: "blur" }],
    },
    {
      field: "projectCode",
      label: "项目编号",
      component: { is: "el-input", props: { placeholder: "内部唯一编码" } },
      rules: [{ required: true, message: "请输入编号", trigger: "blur" }],
    },
    {
      field: "owner",
      label: "负责人",
      component: {
        is: "el-select",
        options: [
          { label: "秦更新", value: "秦更新" },
          { label: "盛评估", value: "盛评估" },
          { label: "李掌控", value: "李掌控" },
        ],
      },
    },
    {
      field: "priority",
      label: "优先级",
      component: {
        is: "el-radio-group",
        options: [
          { label: "普通", value: "low" },
          { label: "重要", value: "medium" },
          { label: "紧急", value: "high" },
        ],
      },
    },
    {
      field: "budget",
      label: "预算 (万)",
      component: { is: "el-input-number", props: { min: 0, max: 500, step: 10 } },
      rules: [{ required: true, type: "number", message: "请输入预算", trigger: "blur" }],
    },
    {
      field: "status",
      label: "审批状态",
      component: {
        is: "el-select",
        options: [
          { label: "草稿", value: "draft" },
          { label: "评审中", value: "review" },
          { label: "已通过", value: "approved" },
        ],
      },
    },
    {
      field: "attachments",
      label: "附件列表",
      span: 2,
      component: {
        is: "el-select",
        props: { multiple: true, allowCreate: true, defaultFirstOption: true, placeholder: "输入附件名称后回车" },
        options: [
          { label: "需求说明.md", value: "需求说明.md" },
          { label: "合同.pdf", value: "合同.pdf" },
          { label: "测试报告.xlsx", value: "测试报告.xlsx" },
        ],
      },
    },
    {
      field: "reviewComment",
      label: "评审意见",
      span: 2,
      component: { is: "el-input", props: { type: "textarea", rows: 3 } },
    },
  ],
}

onMounted(() => {
  formRef.value?.use(cloneDeep(options))
  syncMode("add")
})

function syncMode(mode: "add" | "update") {
  if (!formRef.value)
    return
  if (mode === "add") {
    formRef.value.setMode("add")
    formRef.value.setProps("projectCode", { disabled: false })
    formRef.value.setProps("status", { disabled: true })
    formRef.value.setRequired("reviewComment", false)
    formRef.value.setField("status", "draft")
  }
  else {
    formRef.value.setMode("update")
    formRef.value.setProps("projectCode", { disabled: true })
    formRef.value.setProps("status", { disabled: false })
    formRef.value.setRequired("reviewComment", true)
  }
}

function handleSubmit() {
  formRef.value?.submit().then((res) => {
    console.log("ModeForm Submit:", res)
  }).catch((err) => {
    console.error("ModeForm Submit Error:", err)
  })
}

function handleReset() {
  formRef.value?.resetFields()
}

function loadAddMode() {
  if (!formRef.value)
    return
  syncMode("add")
  formRef.value.bindFields(cloneDeep(draftRecord))
}

function loadUpdateMode() {
  if (!formRef.value)
    return
  syncMode("update")
  formRef.value.bindFields(cloneDeep(reviewRecord))
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

.mode-alert {
  margin-bottom: 16px;
}

.action-row {
  gap: 12px;
  display: flex;
  flex-wrap: wrap;
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

.step-desc {
  color: #606266;
  display: block;
  font-size: 13px;
  margin-top: 4px;
}

pre {
  color: #e5e7eb;
  margin: 0;
  padding: 16px;
  overflow: auto;
  background: #111827;
  max-height: 260px;
  font-family: "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
  border-radius: 14px;
}
</style>
