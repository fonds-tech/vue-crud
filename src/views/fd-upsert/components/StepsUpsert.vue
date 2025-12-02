<template>
  <fd-crud ref="crud">
    <fd-table ref="table" />
    <fd-upsert ref="upsert" />
  </fd-crud>
</template>

<script setup lang="ts">
import type { TableDict } from "@/components/fd-table/type"
import { h, ref } from "vue"
import { UpsertMockService } from "../mockService"
import { useCrud, useTable, useUpsert } from "@/hooks"

defineOptions({ name: "steps-upsert-demo" })

const STEP_SEQUENCE = ["base", "extra"] as const
type StepKey = typeof STEP_SEQUENCE[number]
type StepModel = { __step: StepKey } & Record<string, any>
const stepIndex = ref(0)

const priorityDict: TableDict[] = [
  { label: "High", value: "High", type: "danger" },
  { label: "Medium", value: "Medium", type: "warning" },
  { label: "Low", value: "Low", type: "info" },
]

const crud = useCrud({
  service: new UpsertMockService(),
}, crud => crud.refresh())

const table = useTable({
  columns: [
    {
      prop: "avatar",
      label: "头像",
      width: 80,
      component: {
        is: "el-avatar",
        props: (scope: any) => ({ src: scope.row.avatar, size: "small" }),
      },
    },
    { prop: "name", label: "姓名", minWidth: 140 },
    { prop: "account", label: "账号", minWidth: 120 },
    { prop: "priority", label: "优先级", dict: priorityDict, width: 100 },
    {
      prop: "progress",
      label: "进度",
      minWidth: 160,
      component: {
        is: "el-progress",
        props: (scope: any) => ({ percentage: scope.row.progress, strokeWidth: 10 }),
      },
    },
    {
      prop: "score",
      label: "评分",
      minWidth: 140,
      component: {
        is: "el-rate",
        props: (scope: any) => ({ modelValue: Number(scope.row.score), disabled: true, size: "small" }),
      },
    },
    {
      prop: "website",
      label: "个人主页",
      minWidth: 180,
      component: {
        is: "el-link",
        props: (scope: any) => ({ type: "primary", href: scope.row.website, target: "_blank" }),
        slots: { default: () => "点击访问" },
      },
    },
    {
      prop: "status",
      label: "状态",
      width: 80,
      dict: [
        { label: "启用", value: 1, type: "success" },
        { label: "禁用", value: 0, type: "danger" },
      ],
    },
    { prop: "createTime", label: "创建时间", minWidth: 160 },
    { prop: "remark", label: "备注", minWidth: 200 },
    { type: "action", label: "操作", width: 100, actions: [{ text: "编辑", type: "update" }] },
  ],
})

function setStep(index: number) {
  stepIndex.value = Math.max(0, Math.min(index, STEP_SEQUENCE.length - 1))
  upsert.value?.setField("__step", STEP_SEQUENCE[stepIndex.value])
}

const upsert = useUpsert<StepModel>({
  form: { labelWidth: "96px" },
  grid: { cols: 2 },
  model: { __step: STEP_SEQUENCE[0] },
  group: {
    type: "steps",
    component: { props: { finishStatus: "success" } },
    children: [
      { name: "base", title: "基础信息", component: { props: { description: "必填信息" } } },
      { name: "extra", title: "补充信息", component: { props: { description: "可选项" } } },
    ],
  },
  actions: [
    { type: "cancel" },
    {
      component: {
        is: "el-button",
        props: () => ({ disabled: stepIndex.value === 0 }),
        on: () => ({ click: () => setStep(stepIndex.value - 1) }),
        slots: { default: () => "上一步" },
      },
    },
    {
      component: {
        is: "el-button",
        props: () => ({ type: "primary" }),
        on: () => ({
          click: () => {
            if (stepIndex.value === STEP_SEQUENCE.length - 1)
              upsert.value?.submit()
            else
              setStep(stepIndex.value + 1)
          },
        }),
        slots: () => ({ default: () => (stepIndex.value === STEP_SEQUENCE.length - 1 ? "提交" : "下一步") }),
      },
    },
  ],
  items: [
    { prop: "__step", label: "步骤", hidden: true },
    { prop: "avatar", label: "头像", component: { is: "el-input", props: { placeholder: "请输入头像地址" } }, hidden: (model: StepModel) => model.__step !== "base" },
    { prop: "name", label: "姓名", component: { is: "el-input", props: { placeholder: "请输入姓名" } }, rules: [{ required: true, message: "必填" }], hidden: (model: StepModel) => model.__step !== "base" },
    { prop: "account", label: "账号", component: { is: "el-input", props: { placeholder: "请输入账号" } }, hidden: (model: StepModel) => model.__step !== "base" },
    {
      prop: "priority",
      label: "优先级",
      component: {
        is: "el-select",
        props: { placeholder: "请选择优先级" },
        slots: {
          default: () => priorityDict.map(item => h("el-option", { key: item.value, label: item.label, value: item.value })),
        },
      },
      hidden: (model: StepModel) => model.__step !== "base",
    },
    { prop: "status", label: "状态", component: { is: "el-switch", props: { activeValue: 1, inactiveValue: 0 } }, hidden: (model: StepModel) => model.__step !== "base" },
    { prop: "progress", label: "进度", component: { is: "el-slider", props: { min: 0, max: 100, showStops: true } }, hidden: (model: StepModel) => model.__step !== "extra" },
    { prop: "score", label: "评分", component: { is: "el-rate", props: { allowHalf: true } }, hidden: (model: StepModel) => model.__step !== "extra" },
    { prop: "website", label: "个人主页", component: { is: "el-input", props: { placeholder: "可选" } }, hidden: (model: StepModel) => model.__step !== "extra" },
    { prop: "remark", label: "备注", span: 2, component: { is: "el-input", props: { type: "textarea", rows: 3 } }, hidden: (model: StepModel) => model.__step !== "extra" },
  ],
  onOpen: (_model, ctx) => {
    setStep(0)
    ctx.form?.setField?.("__step", STEP_SEQUENCE[0])
  },
  onSubmit: async (data, ctx) => {
    const payload = { ...(upsert.value?.model ?? {}), ...data }
    return ctx.next(payload)
  },
})
</script>
