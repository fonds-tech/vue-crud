<template>
  <fd-crud ref="crud">
    <fd-table ref="table" />
    <fd-upsert ref="upsert" />
  </fd-crud>
</template>

<script setup lang="ts">
import type { TableDict } from "@/components/table/type"
import { h } from "vue"
import { UpsertMockService } from "../mockService"
import { useCrud, useTable, useUpsert } from "@/hooks"

defineOptions({ name: "basic-upsert" })

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
    {
      prop: "priority",
      label: "优先级",
      width: 100,
      dict: priorityDict,
    },
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
    {
      type: "action",
      label: "操作",
      width: 100,
      actions: [
        { text: "编辑", type: "update" },
      ],
    },
  ],
})

const upsert = useUpsert({
  form: { labelWidth: "88px" },
  grid: { cols: 2 },
  items: [
    { prop: "avatar", label: "头像", component: { is: "el-input", props: { placeholder: "请输入头像地址" } } },
    { prop: "name", label: "姓名", component: { is: "el-input", props: { placeholder: "请输入姓名" } } },
    { prop: "account", label: "账号", component: { is: "el-input", props: { placeholder: "请输入账号" } } },
    {
      prop: "priority",
      label: "优先级",
      component: {
        is: "el-select",
        props: { placeholder: "请选择优先级" },
        slots: {
          default: () => priorityDict.map(item => h("el-option", {
            key: item.value,
            label: item.label,
            value: item.value,
          })),
        },
      },
    },
    {
      prop: "progress",
      label: "进度",
      component: { is: "el-slider", props: { min: 0, max: 100, showStops: true } },
    },
    { prop: "score", label: "评分", component: { is: "el-rate", props: { allowHalf: true } } },
    { prop: "website", label: "个人主页", component: { is: "el-input", props: { placeholder: "请输入个人主页链接" } } },
    { prop: "status", label: "状态", component: { is: "el-switch", props: { activeValue: 1, inactiveValue: 0 } } },
    { prop: "remark", label: "备注", span: 2, component: { is: "el-input", props: { type: "textarea", rows: 3 } } },
  ],
  onSubmit: async (data, ctx) => {
    // 合并当前表单模型（含 id 等隐藏字段）以确保更新请求携带主键
    const payload = { ...(upsert.value?.model ?? {}), ...data }
    return ctx.next(payload)
  },
})
</script>
