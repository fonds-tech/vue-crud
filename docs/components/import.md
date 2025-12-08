# fd-import 导入按钮

`<fd-import>` 封装文件导入流程：校验文件类型与大小，附加选中行与自定义参数，调用 CRUD 导入服务并展示成功/部分失败提示，支持模板下载与权限控制。

## 核心特性

- **多重校验**：默认允许 `.xlsx/.xls/.csv`，可配置 `maxSize` 与 `accept`；不符合直接提示并阻断上传。
- **参数拼装**：自动附加选中行主键（`ids`）与 `params`，构建 `FormData` 后调用 `crud.service.import`。
- **权限控制**：渲染前检查 `crud.getPermission('import')`，无权限不渲染。
- **用户提示**：成功/失败均有消息反馈；部分失败会列出前 5 条错误并提示剩余条数。
- **模板下载**：传入 `templateUrl` 可展示模板下载按钮或自定义模板插槽。

## 基本示例

```vue
<template>
  <fd-crud>
    <fd-search />
    <fd-table />
    <fd-import :params="{ type: 'user' }" template-url="/api/user/template.xlsx" />
  </fd-crud>
</template>

<script setup lang="ts">
import { useCrud } from "vue-crud"
import * as api from "@/api/user"

useCrud(
  {
    dict: { api: { import: "import" }, primaryId: "id" },
    permission: { import: true },
  },
  (crud) => {
    crud.set("service", { import: api.import })
  },
)
</script>
```

## API

### Props

| 名称          | 说明                                           | 类型                  | 默认值            |
| ------------- | ---------------------------------------------- | --------------------- | ----------------- |
| `accept`      | 允许的文件类型，逗号分隔扩展名                 | `string`              | `.xlsx,.xls,.csv` |
| `params`      | 追加到 `FormData` 的额外参数                   | `Record<string, any>` | `{}`              |
| `templateUrl` | 模板下载地址，存在时显示下载按钮或使用模板插槽 | `string`              | `""`              |
| `maxSize`     | 允许的最大文件大小（MB）                       | `number`              | `10`              |

### 插槽

| 名称       | 说明                                                |
| ---------- | --------------------------------------------------- |
| `default`  | 上传按钮内容（默认文字为“导入”）                    |
| `template` | 自定义模板下载按钮；若存在 `templateUrl` 会优先渲染 |

### 暴露

`ref<{ import(file: File): Promise<any>, downloadTemplate(): void }>`：

- `import(file)`：手动触发导入逻辑（会重复应用校验与服务调用）。
- `downloadTemplate()`：触发模板下载。

## 行为说明

- **服务约定**：需要 `crud.service.import(FormData)`，返回 `ImportResult`：可包含 `success`、`count`、`errors[{ row, message }]`。
- **参数来源**：当前选中行主键（`ids`）、`params`、上传文件。上传拦截通过 `beforeUpload` 返回 `false`，使用自定义逻辑处理。
- **刷新**：导入成功后自动调用 `crud.refresh`。

## 常见问题

- **上传没有反应？** 检查文件类型/大小是否满足 `accept/maxSize`，或确认服务已注入且 `permission.import` 为真。
- **部分成功如何查看错误？** 组件会在消息中列出前 5 条错误并提示剩余数量，业务可在服务端提供更详细报告。
- **模板按钮不出现？** 需要提供 `templateUrl`；如使用自定义模板插槽，仍需传入 URL 以决定是否渲染区域。
