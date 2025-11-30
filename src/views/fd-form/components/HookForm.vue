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
import { clone } from "@fonds/utils"
import { useForm } from "@/hooks"
import { ref, computed } from "vue"

interface HookFormModel {
  productName: string
  sku: string
  price: number | string
  seats: number | string
  tags: string | string[]
  metadata: string
  startOnlineWindow: string
  endOnlineWindow: string
  onlineWindow: any[]
  activeFlag: number
  auditNotes: string
  activeSwitch?: boolean
}

const initialPayload: HookFormModel = {
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

const submitPayload = ref<Record<string, any>>({})
const formRef = useForm<HookFormModel>({
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
    submitPayload.value = clone(model)
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
        bind: (_value: unknown, { model }: { model: Record<string, any> }) => (model as HookFormModel).activeFlag === 1,
        submit: (value: boolean, { model }: { model: Record<string, any> }) => {
          const typedModel = model as HookFormModel
          typedModel.activeFlag = value ? 1 : 0
          return undefined
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
})
const formModel = computed(() => formRef.value?.model ?? ({} as HookFormModel))

function handleSubmit() {
  formRef.value?.submit().then(({ values }) => {
    submitPayload.value = clone(values)
    console.log("HookForm Submit:", values)
  }).catch((err) => {
    console.error("HookForm Submit Error:", err)
  })
}

function handleReset() {
  formRef.value?.resetFields()
}

function handleRebind() {
  formRef.value?.bindFields(clone(initialPayload))
}
</script>

<style scoped lang="scss">
.form-variant {
  gap: 12px;
  display: flex;
  flex-direction: column;
}

.variant-card {
  border: 1px solid var(--el-border-color-light, #e4e7ed);
  overflow: hidden;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.02),
    0 2px 4px -1px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  background-color: var(--el-bg-color, #ffffff);

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.08),
      0 4px 6px -2px rgba(0, 0, 0, 0.04);
    border-color: var(--el-color-primary-light-7, #c6e2ff);
  }

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.action-row {
  gap: 12px;
  display: flex;
  flex-wrap: wrap;
  border-top: 1px dashed var(--el-border-color-lighter, #ebeef5);
  justify-content: flex-end;
}

.panel-title {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  justify-content: space-between;

  h3 {
    gap: 10px;
    color: var(--el-text-color-primary, #303133);
    margin: 0;
    display: flex;
    font-size: 16px;
    align-items: center;
    font-weight: 600;

    &::before {
      width: 4px;
      height: 16px;
      content: "";
      border-radius: 2px;
      background-color: var(--el-color-primary, #409eff);
    }
  }

  span {
    color: var(--el-color-success, #67c23a);
    padding: 4px 10px;
    font-size: 12px;
    background: var(--el-color-success-light-9, #f0f9eb);
    font-weight: 500;
    border-radius: 6px;
  }
}

.payload-panel {
  gap: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.payload-column h4 {
  color: var(--el-text-color-primary, #303133);
  margin: 0 0 8px;
  font-size: 14px;
}

pre {
  color: #a6accd;
  border: 1px solid #1b1e2b;
  margin: 0;
  padding: 20px;
  overflow: auto;
  font-size: 13px;
  background: #292d3e;
  max-height: 300px;
  font-family: "JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  line-height: 1.6;
  border-radius: 8px;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #454b66;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}
</style>
