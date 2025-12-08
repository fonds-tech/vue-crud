# fd-upsert 增改弹窗

`<fd-upsert>` 基于 `fd-dialog` + `fd-form` 实现可配置的新增/编辑弹窗，自动衔接 CRUD 服务与表单校验，支持步骤模式、动作按钮自定义与全量表单编程接口。

## 核心特性

- **模式切换**：内置 `add/update` 两种模式，`crud.rowAdd/rowEdit/rowAppend` 通过事件自动驱动打开。
- **生命周期钩子**：支持 `onBeforeOpen/onOpen/onBeforeClose/onClose/onDetail/onSubmit`，可拦截接口调用或自定义数据装载。
- **动作按钮**：默认提供 `ok/cancel`（Steps 模式含 `next/prev`），可用插槽/组件覆盖文本、样式与行为。
- **表单编程能力**：暴露 `FormRef` 的全部能力（字段读写、校验、折叠、滚动定位等），便于复杂业务控制。
- **CRUD 依赖约束**：依赖 `crud.dict.api` 的 `add/update/detail`、`crud.refresh` 以及权限/标签配置。

## 基本示例

```vue
<template>
  <fd-crud ref="crudRef">
    <fd-table />
    <fd-upsert ref="upsertRef" />
  </fd-crud>
</template>

<script setup lang="ts">
import type { UpsertRef } from "vue-crud"
import { useCrud } from "vue-crud"
import * as api from "@/api/user"

const upsertRef = ref<UpsertRef>()
const crudRef = useCrud(
  {
    dict: {
      primaryId: "id",
      api: { add: "add", update: "update", detail: "detail" },
      label: { add: "新增用户", update: "编辑用户", saveSuccess: "保存成功" },
    },
  },
  (crud) => {
    crud.set("service", {
      add: api.add,
      update: api.update,
      detail: api.detail,
    })
  },
)

// 也可在业务代码中直接调用
const openAdd = () => upsertRef.value?.add({ status: 1 })

// 或者从 crudRef 中获取 crud，便于在其他函数中使用
// const crud = crudRef
</script>
```

> 默认监听 `crud.proxy` 事件：`crud.rowAdd/rowEdit/rowAppend/rowClose` 会驱动 `fd-upsert` 打开/关闭并复用 CRUD 服务。

## API

### Props

`fd-upsert` 本身无额外 Prop，所有配置通过 `upsertRef.use(options)` 注入，常用字段：

| 字段         | 说明                                                          | 类型                  | 默认值                                                                                   |
| ------------ | ------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| `mode`       | 当前模式，内部根据 add/update 自动切换                        | `"add" \| "update"`   | `add`                                                                                    |
| `model`      | 表单初始数据，`use` 时可传对象或函数返回新模型                | `Record<string, any>` | `{}`                                                                                     |
| `items`      | 表单项配置，等同 `fd-form` 的 `items`                         | `FormItem[]`          | `[]`                                                                                     |
| `group`      | 分组/Steps 配置                                               | `FormGroup`           | `{}`                                                                                     |
| `grid`       | 透传给 `fd-grid` 的栅格配置                                   | `GridProps`           | `{ cols: 1, rowGap: 0, colGap: 12 }`                                                     |
| `actions`    | 动作按钮列表，支持 `type="ok/cancel/next/prev"` 或组件        | `UpsertAction[]`      | `[]`（自动补充默认按钮）                                                                 |
| `dialog`     | 透传给 `fd-dialog` 的属性（含高度、关闭行为、loading 文案）   | `UpsertDialogProps`   | `{ width: "60%", showClose: true, destroyOnClose: false, loadingText: "正在加载中..." }` |
| 生命周期钩子 | `onBeforeOpen/onOpen/onBeforeClose/onClose/onDetail/onSubmit` | `Function`            | `-`                                                                                      |

### 插槽

| 名称           | 说明                                                                             |
| -------------- | -------------------------------------------------------------------------------- |
| 表单项同名插槽 | 所有传入的具名插槽会映射到内部表单，常用于自定义控件或动作按钮插槽。             |
| 动作插槽       | 当 `actions[].component.slot` 指向某个插槽时，可由父级实现自定义按钮内容或布局。 |
| `default`      | 自定义整个表单区域（通常无需覆盖，推荐使用表单项插槽）。                         |

### 事件

| 事件          | 触发时机与负载                                                   |
| ------------- | ---------------------------------------------------------------- |
| `beforeOpen`  | 弹窗开启前，`{ mode, model }`；可用于预处理数据。                |
| `open`        | 弹窗开启后，`{ mode, model }`。                                  |
| `beforeClose` | 关闭前，`{ action, mode, model }`，`action` 为 `cancel/submit`。 |
| `close`       | 关闭后，`{ action, mode, model }`。                              |

### 暴露

`ref<UpsertRef>` 可用方法（节选）：

- `use(options)`：运行时覆盖配置。
- `add(data?)` / `append(data?)` / `update(row?)`：切换模式并打开弹窗，`update` 自动调用 `dict.api.detail` 装载数据。
- `close(action?)`：关闭弹窗并标记关闭动作。
- `submit(extra?)`：校验并调用 `dict.api.add/update`，成功后自动 `crud.refresh` 与成功提示。
- `next()` / `prev()`：在 Steps 模式下切换步骤。
- 表单方法：`setField/getField/setItem/setOptions/setProps/setStyle/hideItem/showItem/bindFields/validate/...` 等同 `FormRef`。
- 只读状态：`mode`、`visible`、`loading`、`model`、`form`。

## 集成与约束

- **服务约定**：需要在 `crud.service` 中提供 `add/update/detail`，主键默认 `dict.primaryId`（缺失时报错并阻断 update 流程）。
- **权限**：若配合 `fd-table` 内置动作列，权限取决于 `crud.getPermission('add'|'update')`。
- **事件链路**：监听 `crud.proxy`，可与 `fd-table` 的动作列或右键菜单共用隐藏/过滤规则。
- **样式继承**：遵循 `fd-dialog` 属性；额外 attrs（除 `class`）会透传为原生对话框属性。

## 常见问题

- **加载状态何时清零？** `submit`/`update` 内部会在成功/失败时复位；`close('cancel')` 也会重置 loading。
- **如何自定义按钮？** 在 `actions` 中配置 `component` 或 `slot`；`type` 为 `ok/cancel/next/prev` 时会自动渲染默认按钮，可通过 `text/hidden` 控制。
- **详情接口缺失？** `update` 场景会校验 `dict.api.detail` 与主键，缺失时会抛错并弹出错误提示。
