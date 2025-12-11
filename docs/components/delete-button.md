# fd-delete-button 删除按钮

`<fd-delete-button>` 基于 Element Plus `ElButton` 封装，自动读取 CRUD 权限与选中行，执行批量删除并内置安全样式。

## 基本示例

```vue
<template>
  <fd-crud>
    <fd-table />
    <fd-delete-button>删除选中</fd-delete-button>
  </fd-crud>
</template>
```

未传插槽时默认显示 `crud.dict.label.delete`（缺省为“删除”）。

## Props

继承 `ElButton` 的全部 props，并调整默认值与禁用策略：

| 名称       | 说明                                               | 类型      | 默认值     |
| ---------- | -------------------------------------------------- | --------- | ---------- |
| `type`     | 按钮类型                                           | `string`  | `danger`   |
| `disabled` | 显式禁用；若未设置则根据 `crud.selection` 判空禁用 | `boolean` | `false`    |
| 其余同     | Element Plus `ElButton`                            | -         | 跟随原组件 |

尺寸优先使用传入的 `size`，否则回退到 `useCrud` 的 `style.size`。

## 事件

沿用 Element Plus `ElButton` 事件；点击时会先透出 `click` 事件，再在有选中行时调用 `crud.rowDelete(...selection)`。

## 插槽

| 名称      | 说明                   |
| --------- | ---------------------- |
| `default` | 按钮文本，可自定义内容 |

## 权限与禁用策略

- 无 `delete` 权限 (`crud.getPermission('delete')` 为假) 时不渲染。
- 当表格无选中行时自动禁用，防止误触；可通过传入 `disabled` 强制禁用。

## 常见问题

- **删除确认文案从哪里来？** 由 `crud.dict.label.deleteConfirm` 控制，`fd-table` 的动作列与本组件共用。
- **如何自定义删除逻辑？** 在 `useCrud` 中传入 `onDelete(selection, ctx)` 覆盖默认行为。
