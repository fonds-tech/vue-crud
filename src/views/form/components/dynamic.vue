<template>
  <div class="form-variant">
    <el-card class="variant-card">
      <fd-form ref="formRef" />
      <div class="action-row">
        <el-button type="primary" @click="handleSubmit"> 提交配置 </el-button>
        <el-button @click="handleReset"> 重置 </el-button>
        <el-button text type="primary" @click="loadEnterprise"> 加载企业模板 </el-button>
        <el-button text type="primary" @click="loadPersonal"> 加载个人模板 </el-button>
      </div>
    </el-card>

    <el-card class="variant-card">
      <div class="panel-title">
        <h3>联动模型</h3>
        <span>展示 setOptions / hideItem / setRequired</span>
      </div>
      <pre>{{ formModel }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { clone } from "@fonds/utils"
import { useForm } from "@/hooks"
import { watch, computed } from "vue"

interface CustomerFormModel {
  customerName: string
  customerType: "enterprise" | "personal"
  region: "" | "north" | "east" | "south"
  city: string
  package: "basic" | "standard" | "pro"
  accountManager: string
  needInvoice: boolean
  invoiceTitle: string
  taxId: string
  invoiceEmail: string
  serviceLevel: "silver" | "gold" | "platinum"
}

const cityOptionsMap = {
  north: [
    { label: "北京", value: "beijing" },
    { label: "天津", value: "tianjin" },
  ],
  east: [
    { label: "上海", value: "shanghai" },
    { label: "南京", value: "nanjing" },
  ],
  south: [
    { label: "深圳", value: "shenzhen" },
    { label: "广州", value: "guangzhou" },
  ],
} as const

const managerOptions = {
  enterprise: [
    { label: "王企业", value: "wang" },
    { label: "刘大客户", value: "liu" },
  ],
  personal: [
    { label: "陈个人", value: "chen" },
    { label: "孙体验", value: "sun" },
  ],
} as const

const enterpriseTemplate: CustomerFormModel = {
  customerName: "星光科技",
  customerType: "enterprise",
  region: "north",
  city: "beijing",
  package: "pro",
  accountManager: "wang",
  needInvoice: true,
  invoiceTitle: "星光科技有限公司",
  taxId: "91350200712345678X",
  invoiceEmail: "finance@xingguang.com",
  serviceLevel: "gold",
}

const personalTemplate: CustomerFormModel = {
  customerName: "赵一鸣",
  customerType: "personal",
  region: "south",
  city: "shenzhen",
  package: "basic",
  accountManager: "chen",
  needInvoice: false,
  invoiceTitle: "",
  taxId: "",
  invoiceEmail: "",
  serviceLevel: "silver",
}

const formRef = useForm<CustomerFormModel>({
  model: {
    customerName: "",
    customerType: "enterprise",
    region: "",
    city: "",
    package: "standard",
    accountManager: "",
    needInvoice: false,
    invoiceTitle: "",
    taxId: "",
    invoiceEmail: "",
    serviceLevel: "silver",
  },
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
      prop: "customerName",
      label: "客户名称",
      component: { is: "el-input", props: { placeholder: "请输入客户名" } },
      rules: [{ required: true, message: "请输入客户名称", trigger: "blur" }],
    },
    {
      prop: "customerType",
      label: "客户类型",
      component: {
        is: "el-select",
        options: [
          { label: "企业客户", value: "enterprise" },
          { label: "个人客户", value: "personal" },
        ],
      },
    },
    {
      prop: "region",
      label: "所属区域",
      component: {
        is: "el-select",
        options: [
          { label: "华北", value: "north" },
          { label: "华东", value: "east" },
          { label: "华南", value: "south" },
        ],
      },
      rules: [{ required: true, message: "请选择区域", trigger: "change" }],
    },
    {
      prop: "city",
      label: "城市",
      component: {
        is: "el-select",
        props: { placeholder: "根据区域动态加载" },
        options: [],
      },
      rules: [{ required: true, message: "请选择城市", trigger: "change" }],
    },
    {
      prop: "package",
      label: "订阅套餐",
      component: {
        is: "el-radio-group",
        options: [
          { label: "基础版", value: "basic" },
          { label: "标准版", value: "standard" },
          { label: "专业版", value: "pro" },
        ],
      },
    },
    {
      prop: "accountManager",
      label: "客户经理",
      component: {
        is: "el-select",
        props: { placeholder: "跟随客户类型切换" },
        options: [],
      },
      rules: [{ required: true, message: "请选择客户经理", trigger: "change" }],
    },
    {
      prop: "needInvoice",
      label: "需要开票",
      component: {
        is: "el-switch",
        props: { activeText: "需要", inactiveText: "暂不需要" },
      },
    },
    {
      prop: "invoiceTitle",
      label: "发票抬头",
      hidden: true,
      component: { is: "el-input", props: { placeholder: "企业抬头" } },
    },
    {
      prop: "taxId",
      label: "税号",
      hidden: true,
      component: { is: "el-input", props: { placeholder: "请输入统一信用代码" } },
      rules: [{ min: 15, max: 20, message: "税号需 15-20 位", trigger: "blur" }],
    },
    {
      prop: "invoiceEmail",
      label: "接收邮箱",
      hidden: true,
      component: { is: "el-input", props: { placeholder: "finance@example.com" } },
      rules: [{ type: "email", message: "邮箱格式不正确", trigger: ["blur", "change"] }],
    },
    {
      prop: "serviceLevel",
      label: "服务等级",
      span: 2,
      component: {
        is: "el-radio-group",
        options: [
          { label: "银牌", value: "silver" },
          { label: "金牌", value: "gold" },
          { label: "铂金", value: "platinum" },
        ],
      },
    },
  ],
})
const formModel = computed(() => formRef.value?.model ?? ({} as CustomerFormModel))

watch(
  () => formModel.value.region,
  (region) => {
    if (!formRef.value) return
    const nextOptions = cityOptionsMap[region as keyof typeof cityOptionsMap] ?? []
    formRef.value.setOptions("city", [...nextOptions] as any[])
    if (!nextOptions.find(item => item.value === formModel.value.city)) {
      formRef.value.setField("city", "")
    }
  },
  { immediate: true },
)

watch(
  () => formModel.value.customerType,
  (type) => {
    if (!formRef.value) return
    const nextManagers = managerOptions[(type as "enterprise" | "personal") ?? "enterprise"]
    formRef.value.setOptions("accountManager", [...nextManagers] as any[])
    formRef.value.setRequired("accountManager", true)
    formRef.value.clearValidate("accountManager")
    if (!nextManagers.find(item => item.value === formModel.value.accountManager)) {
      formRef.value.setField("accountManager", "")
    }
  },
  { immediate: true },
)

const invoiceProps = ["invoiceTitle", "taxId", "invoiceEmail"] as const

watch(
  () => formModel.value.needInvoice,
  (need) => {
    if (!formRef.value) return
    const targets = invoiceProps as readonly string[]
    if (need) {
      formRef.value.showItem(targets as any)
      invoiceProps.forEach(prop => formRef.value?.setRequired(prop, true))
    }
    else {
      formRef.value.hideItem(targets as any)
      invoiceProps.forEach(prop => formRef.value?.setRequired(prop, false))
    }
  },
  { immediate: true },
)

function handleSubmit() {
  formRef.value
    ?.submit()
    .then((res) => {
      console.log("DynamicForm Submit:", res)
    })
    .catch((err) => {
      console.error("DynamicForm Submit Error:", err)
    })
}

function handleReset() {
  formRef.value?.resetFields()
  formRef.value?.clearValidate(["accountManager"])
}

function loadEnterprise() {
  formRef.value?.bindFields(clone(enterpriseTemplate))
}

function loadPersonal() {
  formRef.value?.bindFields(clone(personalTemplate))
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
