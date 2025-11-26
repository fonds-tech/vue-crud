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
  gap: 16px;
  display: flex;
  flex-direction: column;
}

.variant-card {
  border: none;
  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.08);
  border-radius: 20px;
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

.step-desc {
  color: #606266;
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
