# fd-export 导出按钮

`<fd-export>` 封装导出行为：合并搜索参数与选中行主键，调用 CRUD 的导出服务并自动下载文件，支持自定义触发器与权限控制。

## 核心特性

- **参数合并**：自动收集 `fd-search` 的模型（通过 `search.get.model` 事件）与当前勾选行主键，额外 `params` 透传。
- **权限控制**：在渲染前检查 `crud.getPermission('export')`，无权限时不渲染。
- **自动下载**：服务返回 `{ url }` 时自动触发下载，成功/失败有 Element Plus 消息提示。
- **可编程**：暴露 `export(params?)` 方法，可在业务逻辑中手动触发。

## 基本示例

```vue
<template>
  <fd-crud>
    <fd-search />
    <fd-table />
    <fd-export :params="{ type: 'user' }">
      <template #trigger>
        <el-button type="warning">导出数据</el-button>
      </template>
    </fd-export>
  </fd-crud>
</template>

<script setup lang="ts">
import { useCrud } from "vue-crud"
import * as api from "@/api/user"

useCrud(
  {
    dict: { api: { export: "export" }, primaryId: "id" },
    permission: { export: true },
  },
  (crud) => {
    crud.set("service", { export: api.export })
  },
)
</script>
```

## API

### Props

| 名称     | 说明                                   | 类型                  | 默认值 |
| -------- | -------------------------------------- | --------------------- | ------ |
| `params` | 额外导出参数，会与搜索模型、选中行合并 | `Record<string, any>` | `{}`   |

### 插槽

| 名称      | 说明                             |
| --------- | -------------------------------- |
| `default` | 按钮内容（默认文字为“导出”）     |
| `trigger` | 自定义触发节点，替换默认按钮整体 |

### 暴露

`ref<{ export(params?: Record<string, any>): Promise<any> }>`：

- `export(params?)`：执行导出逻辑，返回服务结果。

## 行为说明

- **服务约定**：需要 `crud.service.export(params)` 返回包含 `url` 的响应；未配置时会提示错误并抛出异常。
- **参数来源**：`ids/id`（勾选行主键，逗号分隔） + `props.params` + `fd-search` 模型回调参数。
- **错误处理**：任意异常会弹出“导出失败”；调用方可捕获异常进一步处理。

## 常见问题

- **选中项没带上？** 确认 `fd-table` 勾选后 `crud.selection` 已同步，且主键字段与 `dict.primaryId` 一致。
- **自定义按钮不显示？** 检查 `permission.export` 或服务是否正确注入；无权限时组件直接返回 `null`。
