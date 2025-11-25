# fd-form 表单引擎

`<fd-form>` 在 Element Plus Form 基础上扩展了响应式 schema、动态栅格、Tab/Steps 分组、数据转换钩子等能力，可与 `fd-search`、`fd-dialog` 等组件复用一套配置。

## 关键特性

- **Schema 驱动**：`items` 数组描述字段、校验、控件组件、插槽、选项等信息。
- **响应式栅格**：基于 `fd-grid` 自动布局，支持 `span/offset`、折叠、响应式断点。
- **分组模式**：`group.type = 'tabs' | 'steps'` 可把表单拆分为多个面板或多步骤。
- **数据钩子**：`hook` 支持内置 `number/string/join` 等转换，也可以自定义函数。
- **Action 能力**：通过 `ref<FormRef>` 可编程地控制显隐、校验、批量赋值。

## 基本示例

```vue
<template>
  <fd-form ref="formRef" />
</template>

<script setup lang="ts">
import { useForm } from "vue-crud"

const formRef = useForm<{ name: string, status: number }>({
  model: { name: "", status: 1 },
  items: [
    {
      field: "name",
      label: "名称",
      required: true,
      rules: [{ message: "请输入名称", trigger: "blur" }],
      component: { is: "el-input", props: { placeholder: "请输入" } },
    },
    {
      field: "status",
      label: "状态",
      component: {
        is: "el-select",
        options: [
          { label: "启用", value: 1 },
          { label: "禁用", value: 0 },
        ],
      },
    },
  ],
})

async function submit() {
  const res = await formRef.value?.submit()
  console.log(res?.values)
}
</script>
```

## 表单项配置要点

| 字段                           | 用途                                                             |
| ------------------------------ | ---------------------------------------------------------------- |
| `component`                    | 描述控件：`is`（组件名）、`props`、`on`、`slots`、`options` 等。 |
| `hook`                         | 数据转换，支持字符串（内置转换）或函数。                         |
| `group`                        | 指定所属分组名，与 `group.children` 搭配构建 Tabs/Steps。        |
| `hidden / disabled / required` | 可传函数 `(model) => boolean`，动态控制状态。                    |
| `extra`                        | 追加说明文字，渲染在控件下方。                                   |

## 结合 useForm 的编程式操作

`FormRef` 继承了 Element Plus Form 的方法，并新增大量助手：

- `setField(field, value)`、`bindFields(data)`：写入表单值。
- `setOptions(field, options)`、`setProps(field, props)`：运行时更新控件属性。
- `hideItem(fields)` / `showItem(fields)` / `collapse(state)`：控制布局。
- `next()` / `prev()`：在 Steps 模式下切换步骤。
- `submit(callback?)`：校验通过后返回 `{ values, errors }`，自动执行 `options.onSubmit`。

## API

### Props

`fd-form` 没有额外 prop，所有配置通过 `form.use(options)` 或 `useForm(options)` 注入。`FormOptions` 主要字段：

- `form`：Element Plus Form 原生配置（label-width、rules 等）。
- `model`：初始数据模型。
- `items`：字段描述。
- `grid`：透传给 `fd-grid`，控制列数、间距、折叠规则。
- `group`：分组与步骤声明。
- `onNext` / `onSubmit`：步骤切换钩子、提交流程。

### 插槽

| 名称      | 作用                                                                        |
| --------- | --------------------------------------------------------------------------- |
| `default` | 透传给所有表单项，内部每个字段也支持 `slots` 指向父级插槽                   |
| 分组插槽  | `group.component.slots` 可以映射出 `#label` 等 slot，自定义 Steps/Tabs 展示 |

### 暴露

`ref<FormRef>` 可获取 `model / items / validate / submit / action 方法（setField、setOptions 等）`。

## 常见问题

- **如何根据模式切换字段？** 通过 `formRef.value?.setMode('update')`，并在 `items` 中根据 `form.mode` 决定 `hidden/disabled`。
- **表单项较多时如何折叠？** 在 `grid` 中设置 `collapsed: true, collapsedRows: 1`，并在按钮区域放置 `fd-search` 类似的折叠按钮。
- **如何与 CRUD 弹窗联动？** 在 `fd-dialog`/`fd-detail` 中通过 `crud.rowAdd()` 打开，监听 `crud.rowEdit(row)` 时调用 `form.bindFields(row)`。

> 同一套表单 schema 既可嵌入 CRUD 页面，也可在弹窗、抽屉等场景独立复用，推荐统一维护。
