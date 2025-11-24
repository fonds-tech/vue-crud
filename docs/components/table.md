# fd-table 表格容器

`<fd-table>` 基于 Element Plus `ElTable` 定制，内置工具栏、列配置、行操作按钮及分页统计。它与 `fd-crud` 共享数据上下文，刷新/选择/全屏等动作都由容器统一分发。

## 核心特性

- **内置工具栏**：支持刷新、尺寸切换、列显示开关与一键全屏。
- **列配置驱动**：`columns` 数组描述所有列，支持字典渲染、插槽、动态组件与操作列。
- **与 CRUD 联动**：自动接收 `crud.refresh` 推送的数据，`crud.selection` 与表格勾选状态保持一致。
- **上下文菜单**：右键可挂载操作列表，在复杂业务场景中替代操作列。

## 基本示例

```vue
<template>
  <fd-crud>
    <fd-table />
  </fd-crud>
</template>

<script setup lang="ts">
import { useCrud, useTable } from "vue-crud"
import * as api from "@/api/user"

useCrud(
  {
    dict: {
      primaryId: "id",
      api: { page: "page", delete: "delete", add: "add", update: "update" },
      label: { deleteConfirm: "确定删除选中记录吗？", deleteSuccess: "删除成功" },
    },
  },
  (crud) => {
    crud.set("service", { page: api.query, delete: api.remove })
  },
)

useTable(
  {
    table: {
      border: true,
      tools: true,
      rowKey: "id",
    },
    columns: [
      { type: "selection", width: 48 },
      { prop: "name", label: "用户名", minWidth: 160 },
      {
        prop: "status",
        label: "状态",
        dict: [
          { value: 1, label: "启用", type: "success" },
          { value: 0, label: "禁用", type: "danger" },
        ],
      },
      {
        type: "action",
        actions: [
          { type: "detail" },
          { type: "update" },
          { type: "delete", hidden: ({ row }) => row.status === 1 },
        ],
      },
    ],
  },
  (table) => {
    table.use()
  },
)
</script>
```

## 列配置速览

`TableColumn` 定义了所有列行为：

| 字段        | 说明                                                                            |
| ----------- | ------------------------------------------------------------------------------- |
| `type`      | `selection / index / expand / action` 等内置类型。                              |
| `dict`      | 数组或函数，自动渲染 `el-tag`（支持 `type/color/icon`）。                       |
| `component` | 自定义渲染对象，允许动态返回组件、props、事件、子插槽。                         |
| `slots`     | 通过小型 schema 将进一步的插槽映射到父组件。                                    |
| `actions`   | 仅 action 列可用，描述每个按钮，可选 `type`（detail/update/delete）或自绘组件。 |
| `hidden`    | 布尔或函数，控制列显示。                                                        |

## 结合 useTable

`useTable(options, callback)` 与 `fd-table` 实例绑定，常见能力：

- `table.use(partialOptions)`：运行时覆盖列或表格配置，支持链式更新。
- `table.refresh(params?)`：复用 `crud.refresh` 的请求参数录入，常用于手动刷新。
- `table.select(rowKey, checked?)`、`table.selectAll(checked?)`：从业务逻辑控制选中。
- `table.setData(rows)`：自定义数据源（离线场景）。
- `table.clearSelection()`、`table.resetFilters()`、`table.toggleFullscreen()` 等与 Element Plus 保持一致。

## API

### Props

| 名称      | 说明                                                      | 类型                  | 默认值                                           |
| --------- | --------------------------------------------------------- | --------------------- | ------------------------------------------------ |
| `table`   | 继承自 `ElTable` 的 props，额外支持 `tools`、`fullscreen` | `Partial<TableProps>` | `{ border: true, size: 'default', tools: true }` |
| `columns` | 列描述数组                                                | `TableColumn[]`       | `[]`                                             |

### 插槽

| 名称         | 说明                                |
| ------------ | ----------------------------------- |
| `toolbar`    | 自定义工具栏内容，放置筛选/按钮等   |
| `header`     | 表格上方的额外信息条                |
| 其它具名插槽 | 自动透传到 `el-table`，可定制特殊列 |
| `expand`     | 当列类型为 `expand` 时对应插槽      |

### 暴露

`ref<TableExpose>` 可访问 `data / selection / use / refresh / select / setTable / clearData ...` 等方法，详见 `TableExpose` 类型定义。

## 常见问题

- **如何控制列的显示顺序？** 只需调整 `columns` 数组即可，列开关弹窗会维持顺序并记住用户勾选。
- **数据不刷新？** 确认 `crud.refresh` 已推送 `table.refresh` 事件，或者直接调用 `table.setData(list)` 覆盖。
- **如何拓展动作列？** `actions` 中传入 `{ component: { is: 'el-button', props: {...} } }` 或者使用 `slot` 回到父组件自定义渲染。

> `fd-table` 依赖 `fd-crud` 中注入的 `crud.mitt`，因此务必让其置于 `<fd-crud>` 内部使用。
