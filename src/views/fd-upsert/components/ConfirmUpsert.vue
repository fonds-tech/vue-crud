<template>
  <fd-crud ref="crud">
    <fd-table ref="table" />
    <fd-upsert ref="upsert" />
  </fd-crud>
</template>

<script setup lang="ts">
import type { TableDict } from "@/components/fd-table/type"
import { ElMessageBox } from "element-plus"
import { UpsertMockService } from "../mockService"
import { useCrud, useTable, useUpsert } from "@/hooks"

defineOptions({ name: "confirm-upsert" })

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
    { prop: "priority", label: "优先级", width: 100, dict: priorityDict },
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
    { prop: "status", label: "状态", width: 80, dict: [{ label: "启用", value: 1, type: "success" }, { label: "禁用", value: 0, type: "danger" }] },
    { prop: "createTime", label: "创建时间", minWidth: 160 },
    { prop: "remark", label: "备注", minWidth: 200 },
    { type: "action", label: "操作", width: 100, actions: [{ text: "编辑", type: "update" }] },
  ],
})

const upsert = useUpsert({
  form: { labelWidth: "92px" },
  grid: { cols: 2 },
  items: [
    { field: "avatar", label: "头像", component: { is: "el-input", props: { placeholder: "请输入头像地址" } } },
    { field: "name", label: "姓名", component: { is: "el-input", props: { placeholder: "请输入姓名" } }, rules: [{ required: true, message: "请填写姓名" }] },
    { field: "account", label: "账号", component: { is: "el-input", props: { placeholder: "请输入账号" } } },
    { field: "priority", label: "优先级", component: { is: "el-select", props: { placeholder: "请选择优先级" }, options: priorityDict } },
    { field: "progress", label: "进度", component: { is: "el-slider", props: { min: 0, max: 100, showStops: true } } },
    { field: "score", label: "评分", component: { is: "el-rate", props: { allowHalf: true } } },
    { field: "website", label: "个人主页", component: { is: "el-input", props: { placeholder: "请输入个人主页链接" } } },
    { field: "status", label: "状态", component: { is: "el-switch", props: { activeValue: 1, inactiveValue: 0 } } },
    { field: "remark", label: "备注", span: 2, component: { is: "el-input", props: { type: "textarea", rows: 3, maxlength: 100, showWordLimit: true } } },
  ],
  actions: [
    { type: "cancel" },
    {
      component: {
        is: "el-button",
        props: { type: "primary" },
        on: () => ({ click: () => upsert.value?.submit() }),
        slots: { default: () => "确认提交" },
      },
    },
  ],
  onSubmit: async (data, ctx) => {
    const payload = { ...(upsert.value?.model ?? {}), ...data }
    await ElMessageBox.confirm("确认保存当前表单数据？", "二次确认", { type: "warning" })
    return ctx.next(payload)
  },
})
</script>
