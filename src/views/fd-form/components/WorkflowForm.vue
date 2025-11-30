<template>
  <div class="form-variant">
    <el-card class="variant-card">
      <fd-form ref="formRef" />
      <div class="action-row">
        <el-button type="primary" @click="handleSubmit">
          提交审批
        </el-button>
        <el-button @click="handleReset">
          重置
        </el-button>
      </div>
    </el-card>

    <el-card class="variant-card">
      <div class="panel-title">
        <h3>当前模型</h3>
        <span>实时同步</span>
      </div>
      <pre>{{ formModel }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/hooks"
import { computed } from "vue"

const formRef = useForm({
  model: {
    project: "",
    owner: "",
    start: "",
    end: "",
    tags: [],
    notify: true,
    risk: 2,
    comment: "",
  },
  grid: { cols: 4, colGap: 12, rowGap: 12 },
  form: {
    labelWidth: "90px",
  },
  items: [
    {
      field: "project",
      label: "项目名称",
      component: { is: "el-input", props: { placeholder: "例如：2024Q3 优化" } },
    },
    {
      field: "owner",
      label: "负责人",
      component: { is: "el-input", props: { clearable: true } },
    },
    {
      field: "start",
      label: "开始日期",
      component: { is: "el-date-picker", props: { type: "date", valueFormat: "YYYY-MM-DD" } },
    },
    {
      field: "end",
      label: "结束日期",
      component: { is: "el-date-picker", props: { type: "date", valueFormat: "YYYY-MM-DD" } },
    },
    {
      field: "tags",
      label: "项目标签",
      component: {
        is: "el-select",
        props: { multiple: true, collapseTags: true, placeholder: "请选择标签" },
        options: [
          { label: "重点", value: "important" },
          { label: "跨部门", value: "cross" },
          { label: "体验优化", value: "ux" },
        ],
      },
      span: 2,
    },
    {
      field: "notify",
      label: "通知成员",
      component: { is: "el-switch", props: { activeText: "是", inactiveText: "否" } },
    },
    {
      field: "risk",
      label: "风险级别",
      component: { is: "el-slider", props: { min: 1, max: 5, showStops: true } },
      span: 2,
    },
    {
      field: "comment",
      label: "补充说明",
      component: { is: "el-input", props: { type: "textarea", rows: 3, maxlength: 120, showWordLimit: true } },
      span: 4,
    },
  ],
})
const formModel = computed(() => formRef.value?.model ?? {})

function handleSubmit() {
  formRef.value?.submit().then((res) => {
    console.log("Submit workflow:", res)
  }).catch((err) => {
    console.error("Workflow Submit Error:", err)
  })
}

function handleReset() {
  formRef.value?.resetFields()
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

  span {
    color: var(--el-color-success, #67c23a);
    padding: 4px 10px;
    font-size: 12px;
    background: var(--el-color-success-light-9, #f0f9eb);
    font-weight: 500;
    border-radius: 6px;
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
