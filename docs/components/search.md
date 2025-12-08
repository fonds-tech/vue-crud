# fd-search 搜索区

`<fd-search>` 基于 `fd-form` 构建，提供常用的查询表单、折叠控制与操作按钮。它会把模型自动同步给 `crud.params`，并在搜索/重置时触发 CRUD 刷新。

## 特性速览

- **与 fd-form 共享 Schema**：可以直接把 `fd-form` 的字段配置复用到查询条件里。
- **动作区域即栅格**：`action.grid` 继承 `fd-grid`，可控制按钮在不同分辨率下的分布。
- **内置动作类型**：search/reset/collapse 三种行为即刻可用，亦可通过 `component/slot` 注入自定义按钮。
- **钩子机制**：`onSearch / onReset` 允许在触发请求前后补充自定义逻辑。
- **事件桥接**：通过 `mitt` 广播 `search.search/reset/get.model/model`，供导出、外部刷新或联动控件读取当前模型。

## 基本示例

```vue
<template>
  <fd-crud>
    <fd-search>
      <template #toolbar>
        <el-button link type="primary">
          高级过滤
        </el-button>
      </template>
    </fd-search>
    <fd-table />
  </fd-crud>
</template>

<script setup lang="ts">
import type { SearchExpose } from "vue-crud"
import { useCrud, useSearch } from "vue-crud"

useCrud({
  dict: {
    api: { page: "page" },
    label: { search: "查询", reset: "重置", collapse: "收起", expand: "展开" },
  },
})

useSearch<SearchExpose["model"]>({
  model: { keyword: "", status: null },
  items: [
    {
      field: "keyword",
      label: "关键词",
      component: { is: "el-input", props: { placeholder: "用户名/手机号" } },
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
  action: {
    items: [{ type: "search" }, { type: "reset" }, { type: "collapse" }],
    grid: { cols: 6, colGap: 8 },
  },
})
</script>
```

## useSearch 能力

`useSearch(options)` 实质上会调用 `fd-form.use(options)` 并注入额外的动作描述。常用字段：

- `model / items / grid`：参考 `fd-form` 配置。
- `action.items`：扩展按钮，`col` 字段映射到 `fd-grid-item`（支持响应式 `span`）。
- `action.grid`：动作区域自身的 `fd-grid` 参数，可设置折叠能力，与表单独立。
- `onSearch(model, ctx)`：调用 `ctx.next(params)` 触发 `crud.refresh`，可在此追加自定义参数。
- `onReset(model, ctx)`：在重置后执行副作用，例如重置服务端缓存。

## API

### 插槽

| 名称           | 说明                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| `default`      | 直接透传到内部 `fd-form`，可自定义表单项                                |
| 自定义动作插槽 | `action.component.slot` 或 `action.slot` 指向的插槽，需要在父组件里实现 |

### 事件

| 事件               | 说明                                                          |
| ------------------ | ------------------------------------------------------------- |
| `search.search`    | 触发搜索，负载为附加参数；内部会调用 `onSearch` 并刷新 CRUD。 |
| `search.reset`     | 触发重置，负载为附加参数；内部会调用 `onReset`。              |
| `search.get.model` | 请求当前搜索模型，回调函数会收到 model 引用。                 |
| `search.model`     | 模型变化广播，监听可获取实时搜索条件。                        |

### 暴露

`ref<SearchExpose>` 可访问：

- `model`：响应式查询条件。
- `form`：`fd-form` 实例引用。
- `use(options)`：动态覆盖配置。
- `search(params?)` / `reset(params?)`：手动触发，支持附加额外参数。
- `collapse(state?)`：切换按钮区域的折叠状态。

## 常见问题

- **如何和分页联动？** `search()` 默认会调用 `crud.refresh`，自动根据 `dict.pagination` 将模型字段映射到请求参数。
- **按钮太多如何排版？** 利用 `action.grid` 控制列数与折叠行数，再合理设置 `action.items[].col`。
- **需要监听表单值变化？** 订阅 `mitt.on('search.model', handler)` 或直接 `watch(searchRef.value?.model)` 即可。
- **如何与导出联动？** `fd-export` 默认通过 `search.get.model` 回调拿到查询条件，无需重复传参；也可手动 `mitt.emit('search.get.model', cb)` 获取模型。

> 当 `fd-search` 和 `fd-table` 同时存在时，推荐把它们包裹在同一个 `<fd-crud>` 内，保证事件与参数同步。
