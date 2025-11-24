# fd-option 选项封装

`<fd-option>` 是对 Element Plus `ElOption` 的轻量封装，主要用于搭配 `fd-select`、`fd-cascader` 等组件，以统一选项数据结构。

## 功能

- **自动映射**：通过 `option` + `labelKey/valueKey` 参数，从对象中提取 `label/value`，避免在模板中重复写属性。
- **属性透传**：除 `option`、`labelKey`、`valueKey` 外的所有 props/attrs 均会被传递给 `el-option`。
- **插槽同步**：所有具名插槽保持与原生组件一致，可以自定义模板。

## 基本用法

```vue
<fd-select v-model="value">
  <fd-option
    v-for="item in options"
    :key="item.id"
    :option="item"
    label-key="name"
    value-key="id"
    :disabled="item.disabled"
  />
</fd-select>
```

当需要完全自定义 `label`/`value` 时也可以直接写在 `fd-option` 上：

```vue
<fd-option label="全部" value="" />
```

## Props

| 名称       | 说明                   | 类型                  | 默认值  |
| ---------- | ---------------------- | --------------------- | ------- |
| `option`   | 原始选项对象           | `Record<string, any>` | -       |
| `labelKey` | 对象中用于显示的字段名 | `string`              | `label` |
| `valueKey` | 对象中用于绑定的字段名 | `string`              | `value` |

其余 props（如 `disabled`, `title` 等）与 `ElOption` 完全相同。

## 插槽

默认插槽和命名插槽保持原样，适合在 Option 中嵌入图标、标签等自定义结构。

## 常见问题

- **为什么 label/value 没生效？** 确认 `option` 对象中确实存在对应字段，或显式传入 `label`、`value` 属性。
- **能否附带更多字段？** 可以，`option` 保持原样，可与 `fd-select change` 回调返回的 payload 结合，读取任意附加信息。
