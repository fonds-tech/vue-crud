<template>
  <div class="dialog-demo">
    <el-card class="dialog-demo__card">
      <template #header>
        <div class="dialog-demo__header">
          <div>
            <p class="dialog-demo__eyebrow">
              Form + CRUD
            </p>
            <h3>配置化表单弹窗</h3>
          </div>
          <el-tag size="small" type="primary" effect="dark">
            fd-form
          </el-tag>
        </div>
      </template>

      <p class="dialog-demo__desc">
        展示 `fd-dialog` 与 `fd-form` 的典型组合：打开弹窗填写信息、提交后提示并自动重置。
      </p>

      <el-button type="primary" size="large" :loading="saving" @click="openDialog">
        <el-icon><plus /></el-icon>
        新建用户
      </el-button>
    </el-card>

    <fd-dialog
      v-model="dialogVisible"
      title="新建内部用户"
      width="720"
      height="60vh"
      destroy-on-close
      @closed="handleDialogClosed"
    >
      <fd-form ref="formRef" class="dialog-demo__form" />

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
import type { FormRef, FormUseOptions } from "@/components/fd-form/type"
import { Plus } from "@element-plus/icons-vue"
import { clone } from "@fonds/utils"
import { ElMessage } from "element-plus"
import { ref, onMounted } from "vue"

const dialogVisible = ref(false)
const saving = ref(false)
const formRef = ref<FormRef>()

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

onMounted(() => {
  formRef.value?.use(clone(formOptions))
})

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
.dialog-demo {
  gap: 16px;
  display: flex;
  flex-direction: column;
}

.dialog-demo__card {
  border: none;
  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.08);
  border-radius: 18px;
}

.dialog-demo__header {
  gap: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-demo__eyebrow {
  color: var(--text-sub);
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dialog-demo__card h3 {
  margin: 6px 0 0;
}

.dialog-demo__desc {
  color: var(--text-sub);
  margin: 0 0 16px;
}

.dialog-demo__form {
  padding: 24px;
}
</style>
