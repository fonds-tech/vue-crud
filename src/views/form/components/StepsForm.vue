<template>
  <div class="form-variant">
    <el-card class="variant-card">
      <fd-form ref="formRef" />

      <div class="action-row">
        <el-button :disabled="isFirstStep" @click="handlePrev">
          上一步
        </el-button>
        <el-button v-if="!isLastStep" type="primary" @click="handleNext">
          下一步
        </el-button>
        <el-button v-else type="success" @click="handleSubmit">
          完成提交
        </el-button>
        <el-button @click="handleReset">
          重置
        </el-button>
      </div>
    </el-card>

    <el-card class="variant-card">
      <div class="panel-title">
        <div>
          <h3>当前步骤：{{ currentStep.title }}</h3>
          <span class="step-desc">{{ currentStep.description }}</span>
        </div>
        <el-tag effect="light" type="info" round>
          {{ currentStep.badge }}
        </el-tag>
      </div>
      <pre>{{ formModel }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { FormRef, FormUseOptions } from "@/components/fd-form/type"
import { cloneDeep } from "lodash-es"
import { ref, computed, onMounted } from "vue"

const STEP_SEQUENCE = ["profile", "project", "confirm"] as const

const stepMeta = [
  { key: "profile", title: "申请人信息", description: "基础信息确认", badge: "Step 1/3" },
  { key: "project", title: "项目详情", description: "输入项目范围与预算", badge: "Step 2/3" },
  { key: "confirm", title: "提交确认", description: "确认审批信息", badge: "Step 3/3" },
] as const

const formRef = ref<FormRef>()
const formModel = computed(() => formRef.value?.model ?? {})
const activeStepIndex = ref(0)

const currentStep = computed(() => stepMeta[activeStepIndex.value] ?? stepMeta[0])
const isFirstStep = computed(() => activeStepIndex.value === 0)
const isLastStep = computed(() => activeStepIndex.value === STEP_SEQUENCE.length - 1)

function syncStep(index: number) {
  const targetIndex = Math.min(Math.max(index, 0), STEP_SEQUENCE.length - 1)
  activeStepIndex.value = targetIndex
  const step = STEP_SEQUENCE[targetIndex]
  if (formRef.value) {
    formRef.value.setField("__step", step)
  }
}

const options: FormUseOptions = {
  model: {
    applicant: "",
    department: "",
    email: "",
    budget: 5000,
    timeline: [],
    reviewer: "",
    remark: "",
    agree: false,
    __step: STEP_SEQUENCE[0],
  },
  grid: {
    cols: 2,
    colGap: 16,
    rowGap: 12,
  },
  form: {
    labelWidth: "96px",
    scrollToError: true,
  },
  group: {
    type: "steps",
    component: {
      props: {
        finishStatus: "success",
      },
    },
    children: stepMeta.map(step => ({
      name: step.key,
      title: step.title,
      component: {
        props: {
          description: step.description,
        },
      },
    })),
  },
  onNext: (_values, ctx) => {
    if (activeStepIndex.value < STEP_SEQUENCE.length - 1) {
      syncStep(activeStepIndex.value + 1)
    }
    ctx.next()
  },
  items: [
    {
      field: "applicant",
      label: "申请人",
      component: { is: "el-input", props: { placeholder: "请输入申请人姓名" } },
      rules: [{ required: true, message: "请填写申请人姓名", trigger: "blur" }],
      hidden: model => model.__step !== "profile",
    },
    {
      field: "department",
      label: "所属部门",
      component: {
        is: "el-select",
        props: { placeholder: "请选择部门", clearable: true },
        options: [
          { label: "产品研发", value: "rd" },
          { label: "市场运营", value: "marketing" },
          { label: "客户成功", value: "success" },
        ],
      },
      rules: [{ required: true, message: "请选择一个部门", trigger: "change" }],
      hidden: model => model.__step !== "profile",
    },
    {
      field: "email",
      label: "联系邮箱",
      component: { is: "el-input", props: { placeholder: "name@example.com" } },
      rules: [
        { required: true, message: "请输入邮箱地址", trigger: "blur" },
        { type: "email", message: "邮箱格式不正确", trigger: ["blur", "change"] },
      ],
      hidden: model => model.__step !== "profile",
    },
    {
      field: "timeline",
      label: "排期范围",
      component: {
        is: "el-date-picker",
        props: { type: "daterange", unlinkPanels: true, valueFormat: "YYYY-MM-DD" },
      },
      rules: [{ required: true, message: "请选择项目排期", trigger: "change" }],
      hidden: model => model.__step !== "project",
    },
    {
      field: "budget",
      label: "预算(万元)",
      component: { is: "el-input-number", props: { min: 0, max: 500, step: 5 } },
      rules: [
        { required: true, message: "请输入预算", trigger: "change" },
        { type: "number", min: 1, message: "预算必须大于 0", trigger: "change" },
      ],
      hidden: model => model.__step !== "project",
    },
    {
      field: "reviewer",
      label: "审批人",
      component: {
        is: "el-select",
        props: { placeholder: "请选择审批责任人" },
        options: [
          { label: "王拓展", value: "wang" },
          { label: "张维度", value: "zhang" },
          { label: "李验证", value: "li" },
        ],
      },
      rules: [{ required: true, message: "请选择审批人", trigger: "change" }],
      hidden: model => model.__step !== "project",
    },
    {
      field: "remark",
      label: "补充说明",
      span: 2,
      component: { is: "el-input", props: { type: "textarea", rows: 3, maxlength: 150, showWordLimit: true } },
      hidden: model => model.__step !== "confirm",
    },
    {
      field: "agree",
      label: "协议确认",
      component: {
        is: "el-switch",
        props: { activeText: "已阅读并同意", inactiveText: "待确认" },
      },
      rules: [
        {
          validator: (_rule, value, callback) => (value ? callback() : callback(new Error("请先同意审批协议"))),
          trigger: "change",
        },
      ],
      hidden: model => model.__step !== "confirm",
    },
  ],
}

onMounted(() => {
  formRef.value?.use(cloneDeep(options))
})

function handleNext() {
  formRef.value?.next()
}

function handlePrev() {
  if (isFirstStep.value)
    return
  syncStep(activeStepIndex.value - 1)
  formRef.value?.prev()
}

function handleSubmit() {
  formRef.value?.submit().then((res) => {
    console.log("Steps Submit:", res)
  }).catch((err) => {
    console.error("Steps Submit Error:", err)
  })
}

function handleReset() {
  syncStep(0)
  formRef.value?.use(cloneDeep(options))
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
  max-height: 240px;
  font-family: "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
  border-radius: 14px;
}
</style>
