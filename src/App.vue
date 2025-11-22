<template>
  <div>
    <div class="title">
      CRUD DEMO
    </div>
    <fd-crud ref="crud">
      <fd-add-button />
      <fd-delete-button />
    </fd-crud>
    <fd-form ref="form" />
  </div>
</template>

<script setup lang="ts">
import type { FormUseOptions } from "./types"
import { TestService } from "./utils/test"
import { h, onMounted } from "vue"
import { useCrud, useForm } from "./hooks"

const crud = useCrud(
  { service: new TestService() },
  app => app.refresh(),
)
const form = useForm()

const regionOptions = [
  { label: "上海", value: "shanghai" },
  { label: "北京", value: "beijing" },
  { label: "深圳", value: "shenzhen" },
]

const demoFormOptions: FormUseOptions = {
  form: {
    labelWidth: 120,
  },
  model: {
    name: "",
    age: 18,
    region: "",
    status: true,
    joinedAt: [],
    description: "",
  },
  items: [
    {
      field: "name",
      label: "姓名",
      required: true,
      component: {
        is: "el-input",
        props: {
          placeholder: "请输入姓名",
          clearable: true,
        },
      },
    },
    {
      field: "age",
      label: "年龄",
      component: {
        is: "el-input-number",
        props: {
          min: 0,
          max: 120,
          placeholder: "请输入年龄",
        },
      },
    },
    {
      field: "region",
      label: "地区",
      component: {
        is: "el-select",
        props: {
          placeholder: "请选择地区",
          clearable: true,
        },
        slots: {
          default: () => regionOptions.map(option => h("el-option", option)),
        },
      },
    },
    {
      field: "status",
      label: "状态",
      component: {
        is: "el-switch",
        props: {
          activeText: "启用",
          inactiveText: "停用",
        },
      },
    },
    {
      field: "joinedAt",
      label: "入职时间",
      component: {
        is: "el-date-picker",
        props: {
          type: "datetimerange",
          startPlaceholder: "开始时间",
          endPlaceholder: "结束时间",
        },
      },
    },
    {
      field: "description",
      label: "备注",
      component: {
        is: "el-input",
        props: {
          type: "textarea",
          rows: 3,
          maxlength: 200,
          showWordLimit: true,
        },
      },
    },
  ],
}

onMounted(() => {
  form.value?.use(demoFormOptions)
})
</script>

<style scoped>
.title {
  font-size: 24px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 16px;
}
</style>
