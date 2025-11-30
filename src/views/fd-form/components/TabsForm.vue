<template>
  <div class="form-variant">
    <el-card class="variant-card">
      <fd-form ref="form" />
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
        <div>
          <h3>Tabs 分段信息</h3>
          <span class="step-desc">折叠 + 分组并行示例</span>
        </div>
        <el-tag effect="light" round>
          Tabs 分组演示
        </el-tag>
      </div>
      <pre>{{ formModel }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/hooks"
import { computed } from "vue"

interface TabsFormModel {
  company: string
  industry: string
  size: string
  website: string
  contact: string
  mobile: string
  email: string
  city: string
  creditLimit: number
  invoiceTitle: string
  taxNo: string
  riskLevel: "low" | "medium" | "high"
  notifyTeam: boolean
  remark: string
}

const defaultModel: TabsFormModel = {
  company: "",
  industry: "",
  size: "300-500",
  website: "",
  contact: "",
  mobile: "",
  email: "",
  city: "",
  creditLimit: 50,
  invoiceTitle: "",
  taxNo: "",
  riskLevel: "medium",
  notifyTeam: true,
  remark: "",
}

const form = useForm<TabsFormModel>({
  model: { ...defaultModel },
  form: {
    labelWidth: "100px",
  },
  group: {
    type: "tabs",
    component: {
      props: {
        type: "border-card",
        stretch: true,
      },
    },
    children: [
      { name: "basic", title: "基础档案" },
      { name: "contacts", title: "联系方式" },
      { name: "control", title: "风控配置" },
    ],
  },
  items: [
    {
      field: "company",
      label: "企业名称",
      group: "basic",
      help: "工商登记名称",
      extra: model => `字符数：${model.company?.length ?? 0}`,
      component: {
        is: "el-input",
        props: { maxlength: 40, showWordLimit: true, placeholder: "请输入企业名称" },
      },
      rules: [{ required: true, message: "请输入企业名称", trigger: "blur" }],
    },
    {
      field: "industry",
      label: "行业",
      tooltip: "用于匹配行业模板",
      group: "basic",
      component: {
        is: "el-select",
        props: { placeholder: "请选择行业", filterable: true },
        options: [
          { label: "高科技", value: "tech" },
          { label: "制造", value: "manufacture" },
          { label: "零售", value: "retail" },
          { label: "金融", value: "finance" },
        ],
      },
      rules: [{ required: true, message: "请选择行业", trigger: "change" }],
    },
    {
      field: "size",
      label: "企业规模",
      group: "basic",
      component: {
        is: "el-radio-group",
        options: [
          { label: "0-100 人", value: "0-100" },
          { label: "100-300 人", value: "100-300" },
          { label: "300-500 人", value: "300-500" },
          { label: "500 人以上", value: "500+" },
        ],
      },
    },
    {
      field: "website",
      label: "官网地址",
      span: 2,
      group: "basic",
      extra: model => (model.website ? `将展示在客户档案中` : "未填写将隐藏"),
      component: {
        is: "el-input",
        props: { placeholder: "https://example.com" },
      },
    },
    {
      field: "contact",
      label: "联系人",
      group: "contacts",
      component: {
        is: "el-input",
        props: { placeholder: "请输入联系人姓名" },
      },
      rules: [{ required: true, message: "请填写联系人姓名", trigger: "blur" }],
    },
    {
      field: "mobile",
      label: "联系电话",
      group: "contacts",
      component: {
        is: "el-input",
        props: { placeholder: "例如：138xxxx0000" },
      },
      rules: [{ required: true, message: "请输入联系电话", trigger: "blur" }],
    },
    {
      field: "email",
      label: "邮箱",
      group: "contacts",
      span: 2,
      component: { is: "el-input", props: { placeholder: "name@example.com" } },
      rules: [
        { required: true, message: "请输入联系人邮箱", trigger: "blur" },
        { type: "email", message: "邮箱格式不正确", trigger: ["blur", "change"] },
      ],
    },
    {
      field: "city",
      label: "所在城市",
      group: "contacts",
      component: {
        is: "el-cascader",
        props: { placeholder: "选择省/市", filterable: true },
        options: [
          { label: "北京", value: "bj" },
          { label: "上海", value: "sh" },
          { label: "广州", value: "gz" },
          { label: "深圳", value: "sz" },
        ],
      },
    },
    {
      field: "creditLimit",
      label: "授信额度 (万)",
      group: "control",
      tooltip: "用于审批中的额度参考",
      extra: model => `当前额度：${model.creditLimit ?? 0} 万`,
      component: {
        is: "el-input-number",
        props: { min: 0, max: 500, step: 10 },
      },
    },
    {
      field: "invoiceTitle",
      label: "开票抬头",
      group: "control",
      component: {
        is: "el-input",
        props: { placeholder: "未需要可留空" },
      },
    },
    {
      field: "taxNo",
      label: "税号",
      group: "control",
      component: { is: "el-input", props: { placeholder: "请输入 15-20 位税号" } },
      rules: [{ min: 15, max: 20, message: "税号长度 15-20 位", trigger: "blur" }],
    },
    {
      field: "riskLevel",
      label: "风险级别",
      group: "control",
      component: {
        is: "el-radio-group",
        options: [
          { label: "低", value: "low" },
          { label: "中", value: "medium" },
          { label: "高", value: "high" },
        ],
      },
    },
    {
      field: "notifyTeam",
      label: "通知团队",
      group: "control",
      component: {
        is: "el-switch",
        props: { activeText: "自动通知", inactiveText: "手动通知" },
      },
    },
    {
      field: "remark",
      label: "备注",
      group: "control",
      span: 2,
      component: { is: "el-input", props: { type: "textarea", rows: 3, maxlength: 200, showWordLimit: true } },
    },
  ],
})
const formModel = computed(() => form.value?.model ?? {})

function handleSubmit() {
  form.value?.submit().then((res) => {
    console.log("TabsForm Submit:", res)
  }).catch((err) => {
    console.error("TabsForm Submit Error:", err)
  })
}

function handleReset() {
  form.value?.resetFields()
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

  h3,
  h4 {
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
}

.step-desc {
  color: var(--el-text-color-regular, #606266);
  display: block;
  font-size: 13px;
  margin-top: 4px;
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
