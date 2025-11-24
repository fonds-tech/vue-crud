# fd-grid-item 栅格单元

`<fd-grid-item>` 与 `fd-grid` 配套使用，负责计算子内容在网格中的位置和可见性。组件会自动感知折叠状态、响应式列数以及 `suffix` 标记。

## 特性

- **响应式 span/offset**：`span`、`offset` 同样接受 `ResponsiveValue`，根据视口宽度动态切换。
- **可见性控制**：当父级开启折叠时，多余字段会自动隐藏，无需手动处理。
- **suffix 模式**：常用于靠右的操作按钮，内部会设置 `justify-self: end`。

## 基本用法

```vue
<fd-grid :cols="{ xs: 1, lg: 3 }" :collapsed="collapsed" :collapsed-rows="1">
  <fd-grid-item :span="{ xs: 1, lg: 1 }">
    <el-input placeholder="关键词" />
  </fd-grid-item>
  <fd-grid-item :span="{ xs: 1, lg: 1 }">
    <el-select placeholder="状态" />
  </fd-grid-item>
  <fd-grid-item suffix :span="1">
    <el-button @click="collapsed = !collapsed">{{ collapsed ? "展开" : "收起" }}</el-button>
  </fd-grid-item>
</fd-grid>
```

## Props

| 名称     | 说明                                             | 类型              | 默认值  |
| -------- | ------------------------------------------------ | ----------------- | ------- |
| `span`   | 占用的列数，支持响应式对象                       | `ResponsiveValue` | `1`     |
| `offset` | 左侧偏移列数                                     | `ResponsiveValue` | `0`     |
| `suffix` | 是否为后缀区域，开启后即使折叠也优先展示且右对齐 | `boolean`         | `false` |

## 插槽

默认插槽会注入 `{ overflow: boolean }`，用于判断当前网格是否存在被折叠的项，例如：

```vue
<fd-grid-item suffix>
  <el-button v-if="overflow" type="link">查看更多</el-button>
</fd-grid-item>
```

## 注意事项

- 需要放置在 `<fd-grid>` 内部，否则会在控制台输出警告并失去响应式能力。
- `span + offset` 会自动被裁剪在 `fd-grid.cols` 范围内，避免布局错位。
- 当你希望在移动端一列显示、桌面端多列显示时，优先使用对象形态设置 `span`。
