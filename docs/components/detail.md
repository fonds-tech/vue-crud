# fd-detail 详情弹窗

`<fd-detail>` 在 `fd-dialog` 之上封装了数据加载、分组渲染与脚手架操作，适合在 CRUD 场景中快速展示行详情或审批信息。

## 功能特点

- **弹窗增强**：继承 `fd-dialog` 的全屏、滚动条、可配置高度等能力。
- **Skeleton 占位**：自动处理加载态，避免闪烁。
- **分组与字段描述**：使用 `ElDescriptions` 承载，每个分组都可独立配置插槽、栅格和标题。
- **动作区**：底部 `actions` 数组描述按钮，可复用内置 “确定” 类型或完全自定义组件。
- **与 CRUD 整合**：默认响应 `crud.rowInfo / rowEdit` 等事件，可配合 `useDetail` 自动打开。

## 基本示例

```vue
<template>
  <fd-crud>
    <fd-table />
    <fd-detail />
  </fd-crud>
</template>

<script setup lang="ts">
import { useCrud, useDetail } from "vue-crud"

useCrud({
  dict: {
    api: { info: "info" },
    label: { detail: "详情", close: "关闭" },
  },
})

useDetail(
  {
    dialog: { title: "用户详情", width: 720 },
    groups: [
      {
        title: "基本信息",
        descriptions: { column: 2 },
        items: [
          { field: "name", label: "姓名" },
          { field: "status", label: "状态", formatter: v => (v ? "启用" : "禁用") },
        ],
      },
      {
        title: "扩展信息",
        items: [{ field: "remark", span: 2 }],
      },
    ],
    actions: [{ type: "ok", text: "关闭" }],
    onDetail(row, { next, done, render }) {
      next({ id: row.id })
    },
  },
  (detail) => {
    detail.use({
      dialog: { title: "动态标题" },
    })
  },
)
</script>
```

> `onDetail` 的 `next` 函数会按照 `dict.api.info` 或 `dict.api.detail` 调用 `crud.service`，并在成功后触发 Skeleton 渲染。

## 配置说明

`DetailOptions` 由以下部分组成：

- `dialog`：透传 `fd-dialog` 的 props（`width / fullscreen / loadingText` 等）。
- `groups`：分组数组，每组包含 `title`、`items`、`descriptions`（column、border 等）。
- `items`：若无需分组可直接配置在根级别，字段描述支持 `label / formatter / slots / component`。
- `actions`：底部按钮，多用于关闭、二次跳转，自定义组件时可以通过 `component` 传入。
- `descriptions`：通用 `ElDescriptions` props，作用于所有分组，必要时可被 group 覆盖。
- `onDetail(row, ctx)`：统一的查询钩子，可手动调用 `ctx.render(data)` 或 `ctx.done()`。

## API

### 插槽

| 名称             | 说明                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------- |
| `default`        | 完全自定义详情区域内容，透出 `data / loading / refresh` 等上下文                             |
| `label`          | 在字段 label 区域自定义渲染                                                                  |
| 组件 schema 插槽 | `group.descriptions.slots`、`item.slots`、`action.component.slot` 可映射到父组件中的具名插槽 |

### 暴露

`ref<DetailRef>` 拥有以下能力：

- `use(options)`：合并配置。
- `detail(row)`：根据行数据打开并执行 `onDetail`。
- `refresh(params?)`：重新拉取详情。
- `setData(value)` / `getData()` / `clearData()`：手动管理详情数据。
- `close()`：关闭弹窗。

## 常见问题

- **如何与 CRUD 的 `rowInfo` 打通？** 默认 `fd-table` 的动作列中 `type: 'detail'` 会调用 `crud.rowInfo(row)`，`fd-detail` 内部已经监听该事件。
- **接口返回结构不一致？** 在 `onDetail` 中使用 `ctx.render({ list, pagination })` 或直接 `setData`，可完全自定义展示数据。
- **需要多列布局？** 使用 `group.descriptions = { column: 3 }` 并在 `item.span` 中控制跨列数量。
