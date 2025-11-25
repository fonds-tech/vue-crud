<template>
  <div class="form-variant">
    <el-card class="variant-card">
      <fd-form ref="formRef" />
      <div class="action-row">
        <el-button type="primary" @click="handleSubmit">
          转换并提交
        </el-button>
        <el-button @click="handleReset">
          重置
        </el-button>
        <el-button type="warning" plain @click="handleRebind">
          回滚为后端值
        </el-button>
      </div>
    </el-card>

    <el-card class="variant-card">
      <div class="panel-title">
        <h3>模型 & 提交结果</h3>
        <span>演示 hook 对齐后端字段</span>
      </div>
      <div class="payload-panel">
        <div class="payload-column">
          <h4>表单模型</h4>
          <pre>{{ formModel }}</pre>
        </div>
        <div class="payload-column">
          <h4>最新提交</h4>
          <pre>{{ submitPayload }}</pre>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { FormRef, FormUseOptions } from "@/components/fd-form/type"
import { cloneDeep } from "lodash-es"
import { ref, computed, onMounted } from "vue"

const initialPayload = {
  productName: "AI 协同套餐",
  sku: "SKU-2024-001",
  price: "199",
  seats: "100",
  tags: "beta,trial",
  metadata: "{\"owner\":\"OPS\",\"sla\":\"gold\"}",
  startOnlineWindow: "2024-08-01",
  endOnlineWindow: "2024-08-31",
  onlineWindow: [],
  activeFlag: 1,
  auditNotes: "",
}

const formRef = ref<FormRef>()
const formModel = computed(() => formRef.value?.model ?? {})
const submitPayload = ref<Record<string, any>>({})

const options: FormUseOptions = {
  model: initialPayload,
  grid: {
    cols: 2,
    colGap: 16,
    rowGap: 14,
  },
  form: {
    labelWidth: "110px",
  },
  onSubmit(model) {
    submitPayload.value = cloneDeep(model)
  },
  items: [
    {
      field: "productName",
      label: "产品名称",
      component: { is: "el-input", props: { maxlength: 40, showWordLimit: true } },
      rules: [{ required: true, message: "请输入产品名称", trigger: "blur" }],
    },
    {
      field: "sku",
      label: "内部 SKU",
      component: { is: "el-input", props: { placeholder: "SKU-xxx" } },
    },
    {
      field: "price",
      label: "售卖价格",
      hook: "number",
      component: { is: "el-input-number", props: { min: 0, step: 10, controlsPosition: "right" } },
    },
    {
      field: "seats",
      label: "席位数",
      hook: "number",
      component: { is: "el-input-number", props: { min: 1, step: 5 } },
    },
    {
      field: "onlineWindow",
      label: "上线窗口",
      value: [],
      hook: "datetimeRange",
      component: {
        is: "el-date-picker",
        props: { type: "daterange", valueFormat: "YYYY-MM-DD", unlinkPanels: true },
      },
      extra: () => "hook: datetimeRange 自动拆分 start/end 字段",
    },
    {
      field: "tags",
      label: "特性标签",
      hook: "splitJoin",
      component: {
        is: "el-select",
        props: { multiple: true, filterable: true, allowCreate: true },
        options: [
          { label: "beta", value: "beta" },
          { label: "trial", value: "trial" },
          { label: "enterprise", value: "enterprise" },
          { label: "ai", value: "ai" },
        ],
      },
    },
    {
      field: "metadata",
      label: "配置 JSON",
      hook: "json",
      span: 2,
      component: { is: "el-input", props: { type: "textarea", rows: 3 } },
    },
    {
      field: "activeSwitch",
      label: "是否激活",
      hook: {
        bind: (_value, { model }) => model.activeFlag === 1,
        submit: (value, { model }) => {
          model.activeFlag = value ? 1 : 0
          return value
        },
      },
      component: { is: "el-switch", props: { activeText: "上线", inactiveText: "下线" } },
    },
    {
      field: "auditNotes",
      label: "审批备注",
      span: 2,
      component: { is: "el-input", props: { type: "textarea", rows: 2, maxlength: 120, showWordLimit: true } },
    },
  ],
}

onMounted(() => {
  formRef.value?.use(cloneDeep(options))
})

function handleSubmit() {
  formRef.value?.submit().then(({ values }) => {
    submitPayload.value = cloneDeep(values)
    console.log("HookForm Submit:", values)
  }).catch((err) => {
    console.error("HookForm Submit Error:", err)
  })
}

function handleReset() {
  formRef.value?.resetFields()
}

function handleRebind() {
  formRef.value?.bindFields(cloneDeep(initialPayload))
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

.payload-panel {
  gap: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.payload-column h4 {
  color: #cfd3dc;
  margin: 0 0 8px;
  font-size: 14px;
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
