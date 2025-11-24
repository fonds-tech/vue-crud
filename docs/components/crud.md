# fd-crud CRUD 容器

`<fd-crud>` 是整个 CRUD 系统的依赖注入中心，负责生成统一的 `crud` 实例、分发配置、管理权限，并在内部封装了刷新、增删改等常见动作。

## 核心特性

- **配置注入**：通过 `useCrud(options)` 在外层提供 `dict / permission / service` 等配置，所有子组件共享一套语义。
- **统一权限**：`crud.getPermission('add')` 等方法在任意子组件中可用，操作按钮无需再次判断。
- **事件总线**：基于 `Mitt` 构建，`fd-table`、`fd-search`、`fd-detail` 等都通过事件与容器互动。
- **CRUD 行为封装**：`rowAdd / rowEdit / rowDelete / refresh` 内置 Element Plus 弹窗提醒与 loading 控制，业务侧只关注接口实现。

## 基本用法

```vue
<template>
  <fd-crud>
    <fd-search />
    <fd-table />
    <fd-detail />
    <template #toolbar-left>
      <fd-add-button />
      <fd-delete-button />
    </template>
  </fd-crud>
</template>

<script setup lang="ts">
import { useCrud } from "vue-crud"
import * as api from "@/api/user"

useCrud(
  {
    dict: {
      primaryId: "id",
      api: {
        page: "page",
        add: "add",
        update: "update",
        delete: "delete",
      },
      label: {
        add: "新增用户",
        update: "编辑",
        delete: "删除",
        list: "用户列表",
      },
    },
    permission: {
      add: true,
      delete: true,
      update: true,
    },
    style: { size: "default" },
  },
  (app) => {
    app.set("service", {
      page: api.query,
      add: api.create,
      update: api.update,
      delete: api.remove,
    })
    app.refresh()
  },
)
</script>
```

## useCrud 配置说明

`useCrud(options, callback)` 会在最邻近的 `<fd-crud>` 上注入配置，并在实例可用后触发回调。常见配置：

- `dict`：统一字段映射。`dict.api.page` 指定分页接口 Key，`dict.label.deleteConfirm` 用于自动提示语。
- `permission`：初始权限表，可为布尔值或函数。也可以由 `service._permission` 自动回填。
- `style.size`：决定默认按钮、表格、表单的尺寸。
- `events`：注册全局事件处理，等价于在 `crud.mitt` 上监听。
- `onRefresh`：接管分页刷新流程，手动控制 `ctx.next / ctx.render`。
- `onDelete`：自定义批量删除行为，例如需要再弹出审批确认。

## CRUD 实例能力

通过 `ref<CrudRef>()` 可获取以下字段和方法（节选）：

| 成员                                                                | 作用                                                   |
| ------------------------------------------------------------------- | ------------------------------------------------------ |
| `loading`                                                           | 当前是否在刷新列表                                     |
| `selection`                                                         | 勾选的行数据，供删除按钮使用                           |
| `params / setParams()`                                              | 统一的查询参数对象与写入方法                           |
| `refresh(params?)`                                                  | 触发分页刷新，自动处理 loading、emit 数据给 `fd-table` |
| `rowAdd()` / `rowEdit(row)` / `rowDelete(...rows)` / `rowInfo(row)` | 打开增改详情或执行删除                                 |
| `rowClose()`                                                        | 关闭弹窗（通常传递给 `fd-detail` / `fd-form`）         |
| `set(key, value)`                                                   | 动态写入 dict / service / permission 等配置            |
| `getPermission(key)`                                                | 判断当前用户是否拥有对应操作权限                       |
| `on(event, handler)`                                                | 监听 `crud.refresh` 等自定义事件                       |

## 常见问题

- **何时调用 `app.refresh()`？** 建议在 `useCrud` 回调中等待 service 注入完成后调用，确保请求函数已就绪。
- **如何自定义删除弹窗？** 通过 `onDelete(selection, { next })` 接管内部逻辑，可结合自定义校验后再执行 `next(params)`。
- **能否同时存在多个 CRUD？** 可以，`useCrud` 默认绑定最近的 `<fd-crud>`。如果需要区分多个实例，请使用 `name` prop 并结合 `useParent`/`ref` 精确引用。

> `fd-crud` 本身只负责上下文与生命周期，所有可视内容都由插槽交给 `fd-search`、`fd-table`、`fd-detail` 等组件完成。
