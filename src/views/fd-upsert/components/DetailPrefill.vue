<template>
  <fd-crud ref="crud">
    <fd-table ref="table" />
    <fd-upsert ref="upsert" />
  </fd-crud>
</template>

<script setup lang="ts">
import type { TableDict } from "@/components/fd-table/type"
import { UpsertMockService } from "../mockService"
import { useCrud, useTable, useUpsert } from "@/hooks"

defineOptions({ name: "detail-prefill-upsert" })

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
  form: { labelWidth: "96px" },
  grid: { cols: 2 },
  items: [
    { field: "avatar", label: "头像", component: { is: "el-input", props: { placeholder: "请输入头像地址" } } },
    { field: "name", label: "姓名", component: { is: "el-input", props: { placeholder: "请输入姓名" } }, rules: [{ required: true, message: "请填写姓名" }] },
    { field: "account", label: "账号", component: { is: "el-input", props: { placeholder: "账号不可修改" } } },
    { field: "priority", label: "优先级", component: { is: "el-select", props: { placeholder: "请选择优先级" }, options: priorityDict } },
    { field: "progress", label: "进度", component: { is: "el-slider", props: { min: 0, max: 100, showStops: true } } },
    { field: "score", label: "评分", component: { is: "el-rate", props: { allowHalf: true } } },
    { field: "website", label: "个人主页", component: { is: "el-input", props: { placeholder: "请输入个人主页链接" } } },
    { field: "status", label: "状态", component: { is: "el-switch", props: { activeValue: 1, inactiveValue: 0 } } },
    { field: "remark", label: "备注", span: 2, component: { is: "el-input", props: { type: "textarea", rows: 3 } } },
  ],
  onOpen: (_model, ctx) => {
    // 新增时恢复可编辑，编辑时保持账号只读
    ctx.form?.setProps?.("account", { disabled: ctx.mode === "update" })
  },
  onDetail: async (row, ctx) => {
    // 自定义详情预取：调用 service.detail，然后补充备注，账号设为只读
    const service = crud.value?.service as UpsertMockService
    const detail = await service.detail({ id: row.id })
    ctx.done({
      ...detail,
      remark: `【详情预填】${detail.remark ?? ""}`,
    })
    upsert.value?.setProps("account", { disabled: true })
  },
  onSubmit: async (data, ctx) => {
    // 编辑提交时保留 detail 数据的补充字段
    const payload = { ...(upsert.value?.model ?? {}), ...data }
    return ctx.next(payload)
  },
})
</script>
