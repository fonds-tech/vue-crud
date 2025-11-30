<template>
  <div class="basic-form">
    <el-card class="basic-form__card">
      <fd-form ref="form" />
      <div class="basic-form__actions">
        <el-button type="primary" @click="handleSubmit">
          提交表单
        </el-button>
        <el-button @click="handleReset">
          重置表单
        </el-button>
        <el-divider direction="vertical" />
        <el-button @click="handleValidate">
          校验表单
        </el-button>
        <el-button @click="handleSetName">
          设置姓名
        </el-button>
        <el-button @click="handleGetName">
          读取姓名
        </el-button>
        <el-button @click="handleToggleRequired">
          切换年龄必填
        </el-button>
        <el-button @click="handleUpdateConfig">
          更新配置
        </el-button>
        <el-button @click="handleBatchFill">
          批量填充
        </el-button>
        <el-button @click="handleSetOptions">
          设置选项
        </el-button>
        <el-button @click="handleToggleDisabled">
          切换禁用
        </el-button>
        <el-button @click="handleToggleVisible">
          显隐生日
        </el-button>
        <el-button @click="handleClearValidate">
          清除姓名校验
        </el-button>
        <el-button @click="handleValidateField">
          校验年龄
        </el-button>
      </div>
    </el-card>

    <el-card class="basic-form__card">
      <div class="basic-form__header">
        <h3>当前模型</h3>
        <span>实时同步</span>
      </div>
      <pre class="basic-form__code">{{ form?.model }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/hooks"
import { ElMessage, ElNotification } from "element-plus"

// #region 配置项
const roleOptions = [
  { label: "Developer", value: "dev" },
  { label: "Designer", value: "des" },
  { label: "Manager", value: "mgr" },
  { label: "Other", value: "oth" },
]

const form = useForm({
  items: [
    {
      field: "name",
      label: "姓名",
      span: 24,
      component: { is: "el-input", props: { placeholder: "请输入姓名" } },
      rules: [{ required: true, message: "请输入姓名", trigger: "blur" }],
    },
    {
      field: "age",
      label: "年龄",
      span: 12,
      component: { is: "el-input-number", props: { min: 0, style: { width: "100%" } } },
      rules: [
        { required: true, message: "请输入年龄", trigger: "blur" },
        { type: "number", min: 0, max: 120, message: "0-120之间", trigger: "blur" },
      ],
    },
    {
      field: "role",
      label: "角色",
      span: 12,
      component: {
        is: "fd-select",
        options: roleOptions,
        props: { style: { width: "100%" } },
      },
      rules: [{ required: true, message: "请选择角色", trigger: "change" }],
    },
    {
      field: "birthday",
      label: "生日",
      span: 12,
      component: {
        is: "el-date-picker",
        props: { valueFormat: "YYYY-MM-DD", style: { width: "100%" } },
      },
    },
    {
      field: "score",
      label: "评分",
      span: 12,
      component: { is: "el-slider" },
    },
    {
      field: "subscribe",
      label: "订阅简报",
      span: 24,
      component: { is: "el-switch" },
      value: true,
    },
    {
      field: "desc",
      label: "备注",
      span: 24,
      component: { is: "el-input", props: { type: "textarea", rows: 3 } },
      rules: [{ max: 200, message: "备注不超过 200 字", trigger: "blur" }],
    },
  ],
})
// #endregion

// #region 基础操作
function handleSubmit() {
  form.value
    ?.submit()
    .then((res) => {
      ElNotification.success({
        title: "提交成功",
        message: JSON.stringify(res.values, null, 2),
      })
    })
    .catch((err) => {
      console.error("Submit Error:", err)
      ElMessage.error("校验失败，请检查表单")
    })
}

function handleReset() {
  form.value?.resetFields()
  ElMessage.info("表单已重置")
}
// #endregion

// #region 演示操作
function handleValidate() {
  form.value?.validate((valid) => {
    if (valid)
      ElMessage.success("校验通过")
    else ElMessage.warning("校验不通过")
  })
}

function handleSetName() {
  form.value?.setField("name", "Fonds Tech")
  ElMessage.success("已设置姓名为: Fonds Tech")
}

function handleGetName() {
  const val = form.value?.getField("name")
  ElMessage.info(`当前姓名: ${val ?? "空"}`)
}

function handleToggleRequired() {
  const isRequired = Math.random() > 0.5
  form.value?.setRequired("age", isRequired)
  ElMessage.info(`年龄字段必填已设为: ${isRequired ? "是" : "否"}`)
}

function handleUpdateConfig() {
  form.value?.setItem("name", { label: `姓名-${Math.floor(Math.random() * 100)}` })
  ElMessage.success("已更新姓名Label配置")
}

function handleBatchFill() {
  form.value?.bindFields({
    name: "Batch User",
    age: 25,
    role: "dev",
  })
  ElMessage.success("已批量填充数据")
}

function handleSetOptions() {
  form.value?.setOptions("role", [
    { label: "New Admin", value: "admin" },
    { label: "New User", value: "user" },
  ])
  ElMessage.success("已更新角色选项列表")
}

function handleToggleDisabled() {
  // 假设我们要切换 'score' 的禁用状态
  // 由于 props 可能是函数，这里为了演示简单断言为对象
  const item = form.value?.items.find(i => i.field === "score")
  const currentProps = item?.component.props as Record<string, any> | undefined
  const isDisabled = currentProps?.disabled

  form.value?.setProps("score", { disabled: !isDisabled })
  ElMessage.info(`评分组件已${!isDisabled ? "禁用" : "启用"}`)
}

function handleToggleVisible() {
  const item = form.value?.items.find(i => i.field === "birthday")

  // 注意：hidden 可能是函数或布尔值，这里简单处理布尔值情况
  if (item?.hidden) {
    form.value?.showItem("birthday")
    ElMessage.success("已显示生日字段")
  }
  else {
    form.value?.hideItem("birthday")
    ElMessage.warning("已隐藏生日字段")
  }
}

function handleClearValidate() {
  form.value?.clearValidate("name")
  ElMessage.info("已清除姓名校验结果")
}

function handleValidateField() {
  form.value?.validateField("age", (valid) => {
    if (valid)
      ElMessage.success("年龄校验通过")
    else ElMessage.error("年龄校验失败")
  })
}
// #endregion
</script>

<style lang="scss" scoped>
.basic-form {
  gap: 12px;
  display: flex;
  flex-direction: column;

  &__card {
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

  &__actions {
    gap: 12px;
    display: flex;
    flex-wrap: wrap;
    border-top: 1px dashed var(--el-border-color-lighter, #ebeef5);
    margin-top: 24px;
    padding-top: 20px;
    justify-content: flex-end;
  }

  &__header {
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

  &__code {
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
}
</style>
