<template>
  <div class="form-variant">
    <el-card class="variant-card">
      <h4 class="section-title">
        component 对象全量配置示例
      </h4>
      <p class="section-desc">
        覆盖 props / options / slots / on / style 的使用方式。
      </p>

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
          <h4>当前模型</h4>
          <span class="step-desc">动态 options 与插槽效果可实时查看</span>
        </div>
      </div>
      <pre>{{ formModel }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/hooks"
import { Link, Search } from "@element-plus/icons-vue"
import { h, markRaw, computed } from "vue"

// 自定义组件插槽：输入框后缀提示（函数式组件避免额外定义名）
const searchIcon = markRaw(Search)
const linkIcon = markRaw(Link)

const SuffixTip = markRaw(() => h("span", { class: "suffix-tip" }, "可编辑"))

// 自定义组件插槽：标签列表提示
const TagSlot = markRaw(() => h("div", { class: "tag-slot" }, ["已选择的标签会在此展示，自定义插槽可嵌套任意结构。"]))

const roleOptions = [
  { label: "产品", value: "pm" },
  { label: "设计", value: "ux" },
  { label: "研发", value: "rd" },
  { label: "测试", value: "qa" },
]

const tagOptions = [
  { label: "高优先级", value: "important" },
  { label: "需要评审", value: "review" },
  { label: "性能关注", value: "performance" },
  { label: "安全关注", value: "security" },
]

const form = useForm({
  model: {
    username: "",
    role: "rd",
    tags: [],
    website: "",
  },
  grid: {
    cols: 2,
    colGap: 16,
    rowGap: 12,
  },
  form: {
    labelWidth: "96px",
  },
  items: [
    {
      field: "username",
      label: "前缀图标 + 插槽",
      component: {
        is: "el-input",
        props: { placeholder: "请输入姓名", prefixIcon: searchIcon, clearable: true },
        slots: { suffix: SuffixTip },
        on: {
          blur: (event: FocusEvent) => {
            console.log("blur event", (event.target as HTMLInputElement | null)?.value)
          },
        },
        style: { "--fd-input-shadow": "0 0 0 1px var(--el-color-primary-light-5)" },
      },
      rules: [{ required: true, message: "请输入姓名", trigger: "blur" }],
    },
    {
      field: "role",
      label: "动态选项函数",
      component: {
        is: "el-select",
        props: { placeholder: "请选择角色", filterable: true },
        // options 支持函数形式，接收当前 model
        options: model =>
          roleOptions.map(item => ({
            ...item,
            disabled: model.username === "" && item.value === "qa",
          })),
      },
      rules: [{ required: true, message: "请选择角色", trigger: "change" }],
    },
    {
      field: "tags",
      label: "多选 + 插槽",
      component: {
        is: "el-select",
        props: { multiple: true, collapseTags: true, placeholder: "请选择标签" },
        options: tagOptions,
        slots: { default: TagSlot },
      },
      extra: "options 可直接传数组，也可使用 slots 自定义提示",
    },
    {
      field: "website",
      label: "事件 + 样式",
      component: {
        is: "el-input",
        props: { placeholder: "https://example.com", suffixIcon: linkIcon },
        on: {
          focus: () => console.log("focus website input"),
        },
        style: { background: "var(--el-color-primary-light-9)" },
      },
      rules: [
        { required: true, message: "请输入网址", trigger: "blur" },
        { type: "url", message: "请输入合法网址", trigger: ["blur", "change"] },
      ],
    },
  ],
})

const formModel = computed(() => form.value?.model ?? {})

function handleSubmit() {
  form.value
    ?.submit()
    .then((res) => {
      console.log("ComponentPlayground Submit:", res)
    })
    .catch((err) => {
      console.error("ComponentPlayground Submit Error:", err)
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

.section-title {
  margin: 0 0 6px 0;
}

.section-desc {
  color: var(--text-sub);
  margin: 0 0 12px 0;
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

.suffix-tip {
  color: var(--el-color-primary);
  font-size: 12px;
  padding-left: 6px;
}

.tag-slot {
  color: var(--text-sub);
  font-size: 12px;
  padding-top: 4px;
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
