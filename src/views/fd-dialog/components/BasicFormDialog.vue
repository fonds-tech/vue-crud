<template>
  <div class="dialog-example">
    <el-button type="primary" :icon="Plus" @click="openDialog">
      新建用户
    </el-button>
    <span class="operation-tip">点击新建用户演示表单校验与提交流程</span>

    <fd-dialog
      v-model="dialogVisible"
      title="新建内部用户"
      width="720"
      height="60vh"
      destroy-on-close
      @closed="handleDialogClosed"
    >
      <fd-form ref="formRef" class="dialog-example__form" />

      <template #footer>
        <el-button :disabled="saving" @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">
          提交
        </el-button>
      </template>
    </fd-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormUseOptions } from "@/components/fd-form/type"
import { ref } from "vue"
import { Plus } from "@element-plus/icons-vue"
import { clone } from "@fonds/utils"
import { useForm } from "@/hooks"
import { ElMessage } from "element-plus"

const formOptions: FormUseOptions = {
  form: { labelWidth: "96px" },
  grid: { cols: 2, colGap: 16, rowGap: 18 },
  model: {
    name: "",
    account: "",
    phone: "",
    email: "",
    status: 1,
    remark: "",
  },
  items: [
    {
      field: "name",
      label: "姓名",
      component: { is: "el-input", props: { placeholder: "请输入姓名" } },
      rules: [{ required: true, message: "请输入姓名", trigger: "blur" }],
    },
    {
      field: "account",
      label: "账号",
      component: { is: "el-input", props: { placeholder: "请输入域账号" } },
      rules: [{ required: true, message: "请输入账号", trigger: "blur" }],
    },
    {
      field: "phone",
      label: "手机号",
      component: { is: "el-input", props: { placeholder: "11 位手机号码" } },
      rules: [{ required: true, message: "请输入手机号", trigger: "blur" }],
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
      field: "status",
      label: "账号启用",
      component: { is: "el-switch", props: { activeText: "启用", inactiveText: "禁用" } },
    },
    {
      field: "remark",
      label: "备注",
      component: { is: "el-input", props: { type: "textarea", rows: 3, maxlength: 200 } },
    },
  ],
}

const dialogVisible = ref(false)
const saving = ref(false)
const formRef = useForm(clone(formOptions))

function openDialog() {
  dialogVisible.value = true
}

function handleDialogClosed() {
  formRef.value?.resetFields()
}

async function handleSubmit() {
  if (!formRef.value)
    return
  try {
    saving.value = true
    const payload = await formRef.value.submit()
    await mockRequest(payload)
    ElMessage.success("模拟保存成功")
    dialogVisible.value = false
  }
  finally {
    saving.value = false
  }
}

function mockRequest<T>(payload: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(payload), 600)
  })
}
</script>

<style scoped>
.dialog-example {
  gap: 12px;
  display: flex;
  align-items: center;
}

.operation-tip {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.dialog-example__form {
  padding: 16px 0 0;
}
</style>
