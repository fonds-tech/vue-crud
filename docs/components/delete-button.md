# fd-delete-button 删除按钮

`<fd-delete-button>` 基于 Element Plus `ElButton` 封装，统一 CRUD 删除操作体验：

- 自动读取 `crud.dict.label.delete` 作为默认文本；
- 绑定 `crud.selection`，在未选择数据时自动禁用；
- 调用 `crud.getPermission("delete")` 控制显隐；
- 点击自动执行 `crud.rowDelete(...crud.selection)`。

## 基本示例

```vue
<template>
  <fd-crud>
    <template #toolbar-left>
      <fd-delete-button />
    </template>
  </fd-crud>
</template>
```

> `fd-delete-button` 默认展示在工具栏中，你也可以根据业务移动到任意插槽。

## 与 useCrud 搭配

`fd-delete-button` 与 `useCrud` 共用同一份配置，包含接口地址、权限以及统一的文案：

```ts
import { useCrud } from "vue-crud"

const crud = useCrud(
  {
    dict: {
      label: {
        delete: "批量删除",
      },
      api: {
        delete: "/api/user",
      },
    },
    permission: {
      delete: true,
    },
  },
  ctx => ctx.refresh(),
)
```

## 常见问题

- **为什么按钮是禁用状态？** `fd-delete-button` 基于 `crud.selection` 判断，需确保表格勾选事件正确回填到 selection（例如 `fd-table` 默认已接管）。
- **如何只删除单条数据？** 可通过操作列触发 `crud.rowDelete(row)`；若仍需使用该按钮，可以在触发前手动更新 `crud.selection`。

## 插槽

| 名称      | 说明                       | 参数 |
| --------- | -------------------------- | ---- |
| `default` | 按钮文本，可插入自定义内容 | -    |

> 新增按钮请参考 `fd-add-button` 组件，更多 CRUD 能力请参阅 `fd-crud` 文档。
