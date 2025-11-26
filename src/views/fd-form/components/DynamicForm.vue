<template>
  <div class="form-variant">
    <el-card class="variant-card">
      <fd-form ref="formRef" />
      <div class="action-row">
        <el-button type="primary" @click="handleSubmit">
          提交配置
        </el-button>
        <el-button @click="handleReset">
          重置
        </el-button>
        <el-button text type="primary" @click="loadEnterprise">
          加载企业模板
        </el-button>
        <el-button text type="primary" @click="loadPersonal">
          加载个人模板
        </el-button>
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
import type { FormRef, FormUseOptions } from "@/components/fd-form/type"
import { clone } from "@fonds/utils"
import { ref, watch, computed, onMounted } from "vue"

const formRef = ref<FormRef>()
const formModel = computed(() => formRef.value?.model ?? {})

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

const enterpriseTemplate = {
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

const personalTemplate = {
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

const options: FormUseOptions = {
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
      field: "customerName",
      label: "客户名称",
      component: { is: "el-input", props: { placeholder: "请输入客户名" } },
      rules: [{ required: true, message: "请输入客户名称", trigger: "blur" }],
    },
    {
      field: "customerType",
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
      field: "region",
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
      field: "city",
      label: "城市",
      component: {
        is: "el-select",
        props: { placeholder: "根据区域动态加载" },
        options: [],
      },
      rules: [{ required: true, message: "请选择城市", trigger: "change" }],
    },
    {
      field: "package",
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
      field: "accountManager",
      label: "客户经理",
      component: {
        is: "el-select",
        props: { placeholder: "跟随客户类型切换" },
        options: [],
      },
      rules: [{ required: true, message: "请选择客户经理", trigger: "change" }],
    },
    {
      field: "needInvoice",
      label: "需要开票",
      component: {
        is: "el-switch",
        props: { activeText: "需要", inactiveText: "暂不需要" },
      },
    },
    {
      field: "invoiceTitle",
      label: "发票抬头",
      hidden: true,
      component: { is: "el-input", props: { placeholder: "企业抬头" } },
    },
    {
      field: "taxId",
      label: "税号",
      hidden: true,
      component: { is: "el-input", props: { placeholder: "请输入统一信用代码" } },
      rules: [{ min: 15, max: 20, message: "税号需 15-20 位", trigger: "blur" }],
    },
    {
      field: "invoiceEmail",
      label: "接收邮箱",
      hidden: true,
      component: { is: "el-input", props: { placeholder: "finance@example.com" } },
      rules: [{ type: "email", message: "邮箱格式不正确", trigger: ["blur", "change"] }],
    },
    {
      field: "serviceLevel",
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
}

onMounted(() => {
  formRef.value?.use(clone(options))
})

watch(() => formModel.value.region, (region) => {
  if (!formRef.value)
    return
  const nextOptions = cityOptionsMap[region as keyof typeof cityOptionsMap] ?? []
  formRef.value.setOptions("city", [...nextOptions] as any[])
  if (!nextOptions.find(item => item.value === formModel.value.city)) {
    formRef.value.setField("city", "")
  }
}, { immediate: true })

watch(() => formModel.value.customerType, (type) => {
  if (!formRef.value)
    return
  const nextManagers = managerOptions[(type as "enterprise" | "personal") ?? "enterprise"]
  formRef.value.setOptions("accountManager", [...nextManagers] as any[])
  formRef.value.setRequired("accountManager", true)
  if (!nextManagers.find(item => item.value === formModel.value.accountManager)) {
    formRef.value.setField("accountManager", "")
  }
}, { immediate: true })

const invoiceFields = ["invoiceTitle", "taxId", "invoiceEmail"] as const

watch(() => formModel.value.needInvoice, (need) => {
  if (!formRef.value)
    return
  const targets = invoiceFields as readonly string[]
  if (need) {
    formRef.value.showItem(targets as any)
    invoiceFields.forEach(field => formRef.value?.setRequired(field, true))
  }
  else {
    formRef.value.hideItem(targets as any)
    invoiceFields.forEach(field => formRef.value?.setRequired(field, false))
  }
}, { immediate: true })

function handleSubmit() {
  formRef.value?.submit().then((res) => {
    console.log("DynamicForm Submit:", res)
  }).catch((err) => {
    console.error("DynamicForm Submit Error:", err)
  })
}

function handleReset() {
  formRef.value?.resetFields()
}

function loadEnterprise() {
  formRef.value?.bindFields(clone(enterpriseTemplate))
}

function loadPersonal() {
  formRef.value?.bindFields(clone(personalTemplate))
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
