# fd-dialog 弹窗容器

`<fd-dialog>` 对 Element Plus `ElDialog` 进行了增强，统一了 CRUD 弹窗的头部视觉、滚动处理以及全屏控制。`fd-detail`、表单弹窗等组件都是基于它构建。

## 特性

- **自定义头部**：内置标题居左、动作区域居右的布局，包含全屏/关闭按钮。
- **滚动容器**：自动嵌入 `el-scrollbar`，通过 `height` 属性控制可滚动区域高度。
- **全屏控制**：支持 `fullscreen` prop 与编程式 `fullscreen()` 方法，按钮文案自动切换。
- **属性透传**：除 `class` 以外的 attrs 原样交给 `ElDialog`，保证 Element Plus API 兼容。

## 基本用法

```vue
<template>
  <fd-dialog v-model="visible" title="编辑用户" width="640" height="60vh">
    <fd-form />
    <template #footer>
      <el-button @click="visible = false">
        取消
      </el-button>
      <el-button type="primary" @click="handleSubmit">
        保存
      </el-button>
    </template>
  </fd-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue"

const visible = ref(false)

function handleSubmit() {
  // 校验逻辑
  visible.value = false
}
</script>
```

## API

### Props

继承 `ElDialog` 全量 props，并新增：

| 名称     | 说明                                      | 类型               | 默认值 |
| -------- | ----------------------------------------- | ------------------ | ------ |
| `height` | 滚动容器高度，支持数字或任何合法 CSS 高度 | `number \| string` | `60vh` |

### 事件

沿用 Element Plus：`open`、`close`、`opened`、`closed`、`open-auto-focus`、`close-auto-focus` 等，所有事件都原样向外透出。

### 插槽

| 名称      | 说明         |
| --------- | ------------ |
| `default` | 弹窗主体内容 |
| `footer`  | 底部操作区   |

### 暴露

通过 `ref` 可访问：

- `open()` / `close()`：手动切换可见性。
- `fullscreen(value?)`：设置或切换全屏。
- `dialogVisible`：响应式可见状态。
- `fullscreenActive`：响应式全屏状态。

## 常见问题

- **如何修改头部布局？** 通过 `class` 覆盖 `.fd-dialog__header` 的样式，或直接传入 `header` 插槽覆盖默认实现。
- **希望保留原生右上角关闭按钮？** 设置 `show-close` 属性，组件会在头部右侧渲染该按钮。
- **滚动条高度如何自适应？** 传入 `height="auto"` 或直接省略 `height`，即可使用内容高度。
