# fd-grid 响应式栅格

`<fd-grid>` 是一个轻量的 CSS Grid 布局容器，支持响应式列数、间距与折叠控制，并通过注入机制驱动 `fd-grid-item` 自动获取上下文。

## 功能

- **跨断点配置**：`cols/rowGap/colGap` 接受 `ResponsiveValue`，可针对 `xs/sm/md/lg/xl/xxl` 视口单独配置。
- **折叠行数**：在搜索、表单等场景中，只显示前 N 行，剩余字段通过折叠按钮展开。
- **可观测的溢出状态**：`fd-grid-item` 会感知 `overflow` 状态，可用来渲染“展开/收起”按钮。
- **Suffix 支持**：标记 `suffix` 的项会优先展示（常用于按钮区右对齐）。

## 基本用法

```vue
<fd-grid :cols="{ xs: 1, md: 2, xl: 4 }" :col-gap="16" :row-gap="16" :collapsed="isCollapsed" :collapsed-rows="1">
  <fd-grid-item v-for="i in 6" :key="i" :span="1">
    <el-card>字段 {{ i }}</el-card>
  </fd-grid-item>
  <fd-grid-item suffix :span="1">
    <el-button type="text" @click="isCollapsed = !isCollapsed">
      {{ isCollapsed ? "展开" : "收起" }}
    </el-button>
  </fd-grid-item>
</fd-grid>
```

## Props

| 名称            | 说明               | 类型              | 默认值  |
| --------------- | ------------------ | ----------------- | ------- |
| `cols`          | 总列数（可响应式） | `ResponsiveValue` | `24`    |
| `rowGap`        | 行间距             | `ResponsiveValue` | `0`     |
| `colGap`        | 列间距             | `ResponsiveValue` | `0`     |
| `collapsed`     | 是否折叠           | `boolean`         | `false` |
| `collapsedRows` | 折叠时展示的行数   | `number`          | `1`     |

> `ResponsiveValue` 可以是数字或 `{ xs: 1, md: 2, ... }` 的对象，内部通过断点映射转换。

## 与 fd-grid-item 的协作

- 每个 `fd-grid-item` 注册到 grid 上下文，基于当前列数计算 `span/offset` 的有效值。
- 当处于折叠状态时，组件会自动判断哪些字段可见，并通过 `:overflow` 插槽参数提示父级是否存在隐藏项。
- `suffix` 属性可让按钮类元素固定在末尾，即便在折叠状态下也会优先生效。

## 常见问题

- **如何控制折叠策略？** 只要设置 `collapsed` 和 `collapsedRows` 即可。通常与 `fd-search` 或 `fd-form` 的折叠按钮结合，利用 `grid` 的 `overflow` 状态判断是否需要渲染“展开”按钮。
- **列数和 span 换算？** `span` 的默认单位是 1/24，即和 Element Plus 栅格一致；当 `cols` 调整为 12 时，`span=3` 表示占用 3/12。
- **可以嵌套吗？** 可以，`fd-grid-item` 里的内容再嵌套另一个 `fd-grid` 不会互相干扰。
