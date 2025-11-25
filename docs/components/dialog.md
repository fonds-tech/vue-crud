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

## 典型场景

### 表单弹窗（搭配 fd-form）

```vue
<fd-dialog v-model="visible" title="新建内部用户" width="720" height="60vh" destroy-on-close>
  <fd-form ref="formRef" />

  <template #footer>
    <el-button @click="visible = false" :disabled="saving">
      取消
    </el-button>
    <el-button type="primary" :loading="saving" @click="handleSubmit">
      提交
    </el-button>
  </template>
</fd-dialog>

<script setup lang="ts">
import type { FormRef, FormUseOptions } from "vue-crud"
import { ref, onMounted } from "vue"

const visible = ref(false)
const saving = ref(false)
const formRef = ref<FormRef>()

const options: FormUseOptions = {
  form: { labelWidth: "96px" },
  grid: { cols: 2, colGap: 16, rowGap: 16 },
  model: { name: "", account: "", status: 1 },
  items: [
    { field: "name", label: "姓名", component: { is: "el-input" }, required: true },
    { field: "account", label: "账号", component: { is: "el-input" }, required: true },
    { field: "status", label: "启用状态", component: { is: "el-switch" } },
  ],
}

onMounted(() => formRef.value?.use(options))

async function handleSubmit() {
  if (!formRef.value)
    return
  saving.value = true
  const payload = await formRef.value.submit()
  console.log("mock save", payload)
  visible.value = false
  saving.value = false
}
</script>
```

### API 调用控制（open / close / fullscreen）

```vue
<template>
  <div>
    <el-space>
      <el-button type="primary" @click="openDialog">
        手动打开
      </el-button>
      <el-button @click="toggleFullscreen">
        切换全屏
      </el-button>
      <el-button @click="closeDialog">
        关闭
      </el-button>
      <el-button text type="primary" @click="defaultFullscreen = !defaultFullscreen">
        {{ defaultFullscreen ? "取消默认全屏" : "默认全屏" }}
      </el-button>
    </el-space>

    <fd-dialog
      ref="dialogRef"
      title="巡检详情"
      :fullscreen="defaultFullscreen"
      @close="defaultFullscreen = false"
    >
      <el-descriptions :column="2">
        <el-descriptions-item label="状态">
          运行中
        </el-descriptions-item>
        <el-descriptions-item label="负责人">
          Ops 团队
        </el-descriptions-item>
      </el-descriptions>
    </fd-dialog>
  </div>
</template>

<script setup lang="ts">
import type { DialogExpose } from "vue-crud"
import { ref } from "vue"

const dialogRef = ref<DialogExpose>()
const defaultFullscreen = ref(false)

function openDialog() {
  dialogRef.value?.open()
}

function closeDialog() {
  dialogRef.value?.close()
}

function toggleFullscreen() {
  dialogRef.value?.fullscreen()
}
```

### 长内容滚动（height + top）

```vue
<fd-dialog v-model="visible" title="版本更新说明" width="640" height="48vh" top="12vh" center>
  <el-timeline>
    <el-timeline-item v-for="item in logs" :key="item.id" :timestamp="item.time" :type="item.type">
      <strong>{{ item.title }}</strong>
      <p>{{ item.desc }}</p>
    </el-timeline-item>
  </el-timeline>
</fd-dialog>

<script setup lang="ts">
import type { TimelineItemProps } from "element-plus"
import { ref } from "vue"

interface TimelineLog extends Required<Pick<TimelineItemProps, "type">> {
  id: number
  time: string
  title: string
  desc: string
}

const visible = ref(false)
const logs = ref<TimelineLog[]>([
  { id: 1, time: "2024-07-12 10:00", title: "版本发布", desc: "推送 v1.5.2 到生产", type: "primary" },
  { id: 2, time: "2024-07-10 16:30", title: "安全修复", desc: "修补依赖漏洞", type: "warning" },
])
</script>
```

更多现场效果可以在示例站点 `/dialog` 页面查看，那里整合了上述 3 种模式并给出了交互提示。

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
