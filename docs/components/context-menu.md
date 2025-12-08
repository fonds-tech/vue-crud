# fd-context-menu 右键菜单

`<fd-context-menu>` 提供独立的右键菜单渲染能力，可作为组件使用或通过静态方法直接在文档流外挂载，支持嵌套子菜单、hover 高亮、键盘可达性和全局点击关闭。

## 核心特性

- **两种使用方式**：组件模式受控展示，或 `ContextMenu.open(event, options)` 一行弹出并返回 `close` 句柄。
- **丰富的项定义**：`ContextMenuItem` 支持 `children`、`hidden/disabled/ellipsis`、前后缀图标、回调函数。
- **Hover 与键盘**：可配置 hover 高亮目标；子菜单展开后支持 Enter/Space 触发、Esc 关闭。
- **跨文档**：可传 `document` 实例，适配 iframe/自定义渲染环境。

## 基本示例（组件模式）

```vue
<template>
  <div @contextmenu.prevent="onContextMenu">
    右键打开菜单
  </div>
  <fd-context-menu ref="menuRef" />
</template>

<script setup lang="ts">
import type { ContextMenuExpose } from "vue-crud"
import { ref } from "vue"

const menuRef = ref<ContextMenuExpose>()

const items = [
  { label: "查看", callback: close => close() },
  { label: "编辑", disabled: false },
  {
    label: "更多操作",
    children: [
      { label: "复制 ID", prefixIcon: "fd-icon-copy" },
      { label: "删除", suffixIcon: "fd-icon-delete", callback: close => close() },
    ],
  },
]

function onContextMenu(event: MouseEvent) {
  menuRef.value?.open(event, { list: items, hover: { target: "row" } })
}
</script>
```

## API

### Props

| 名称      | 说明                       | 类型                 | 默认值  |
| --------- | -------------------------- | -------------------- | ------- |
| `show`    | 是否显示（受控模式）       | `boolean`            | `false` |
| `event`   | 触发事件（仅受控模式需要） | `MouseEvent`         | `-`     |
| `options` | 菜单配置，详见下表         | `ContextMenuOptions` | `{}`    |

`ContextMenuOptions` 关键字段：

| 字段       | 说明                                                            | 类型                                                 | 默认值            |
| ---------- | --------------------------------------------------------------- | ---------------------------------------------------- | ----------------- |
| `list`     | 菜单项数组，支持多级 children                                   | `ContextMenuItem[]`                                  | `[]`              |
| `hover`    | hover 高亮配置，`true` 启用默认，或传 `{ target?, className? }` | `boolean \| { target?: string, className?: string }` | `false`           |
| `class`    | 额外类名，附加到菜单容器                                        | `string`                                             | `-`               |
| `document` | 自定义文档对象（iframe 场景）                                   | `Document`                                           | `window.document` |

`ContextMenuItem` 关键字段：`label`、`prefixIcon`、`suffixIcon`、`ellipsis`、`disabled`、`hidden`、`children`、`callback(close)`。

### 插槽

| 名称      | 说明                                 |
| --------- | ------------------------------------ |
| `default` | 自定义菜单内容，替换默认的列表渲染。 |

### 暴露

`ref<ContextMenuExpose>`：

- `open(event, options?)`：基于事件坐标打开菜单，返回 `{ close }`。
- `close()`：关闭菜单并销毁（静态 open 会延迟销毁以播放离场动画）。

静态用法：`ContextMenu.open(event, options)`，返回同样的 `{ close }`。

## 集成示例（与 fd-table 右键菜单）

```ts
const actions = [
  {
    label: "详情",
    callback: (close) => {
      crud.rowInfo(row)
      close()
    },
  },
  {
    label: "编辑",
    hidden: () => !crud.getPermission("update"),
    callback: (close) => {
      crud.rowEdit(row)
      close()
    },
  },
  {
    label: "删除",
    disabled: row.locked,
    callback: (close) => {
      crud.rowDelete(row)
      close()
    },
  },
]

function onRowContextmenu(event: MouseEvent, row: any) {
  ContextMenu.open(event, { list: actions, hover: { target: "fd-table__row" } })
}
```

- 与 `fd-table` 自带动作列一致：可复用 `hidden/disabled` 规则，右键菜单操作后记得调用 `close()` 以销毁。
- 关闭策略：点击外部、Esc、执行无子菜单的项都会自动关闭；传 `close(true)` 可立即无动画关闭。

## 常见问题

- **为何不显示？** 确认 `event` 传入且 `show` 为真（组件模式）；静态模式需要 `ContextMenu.open(event)`。
- **菜单溢出屏幕？** 组件会自动调整到可视区域内，仍溢出时检查父容器是否覆盖 pointer 事件。
- **如何禁止 hover 高亮？** 将 `hover` 设为 `false` 或移除配置。
