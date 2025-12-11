# fd-add-button 新增按钮

`<fd-add-button>` 基于 Element Plus `ElButton` 封装，用于触发 CRUD 场景中的新增操作：自动读取权限、标签并调用 `crud.rowAdd()`。

## 基本示例

```vue
<template>
  <fd-crud>
    <fd-add-button>新建用户</fd-add-button>
  </fd-crud>
</template>
```

若未传插槽文本，默认显示 `crud.dict.label.add`（缺省为“新增”）。

## Props

继承 `ElButton` 的全部 props，并调整默认值：

| 名称   | 说明                    | 类型     | 默认值     |
| ------ | ----------------------- | -------- | ---------- |
| `type` | 按钮类型                | `string` | `primary`  |
| 其余同 | Element Plus `ElButton` | -        | 跟随原组件 |

尺寸会优先使用传入的 `size`，否则回退到 `useCrud` 的 `style.size`。

## 事件

沿用 Element Plus `ElButton` 事件；点击时会先透出 `click` 事件，再调用 `crud.rowAdd()`。

## 插槽

| 名称      | 说明                   |
| --------- | ---------------------- |
| `default` | 按钮文本，可自定义内容 |

## 权限与禁用策略

- 无 `add` 权限 (`crud.getPermission('add')` 为假) 时不渲染。
- 其他禁用逻辑沿用传入的 `disabled`。

## 常见问题

- **想改成幽灵按钮？** 直接传入 `type="default" plain` 等原生属性即可。
- **多语言文案？** 设置 `dict.label.add` 或传入插槽覆盖。
