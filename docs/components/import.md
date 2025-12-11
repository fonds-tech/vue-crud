# fd-import 导入按钮

`<fd-import>` 基于 `ElUpload` + `ElButton` 封装文件导入能力，自动校验文件类型/大小，调用 CRUD 服务的 `import` 方法并在成功后刷新列表。

## 基本示例

```vue
<fd-crud>
  <fd-import :params="{ scene: 'user' }" template-url="/api/import/template">
    <el-button type="success">导入用户</el-button>
    <template #template>
      <el-button type="info">下载模板</el-button>
    </template>
  </fd-import>
</fd-crud>
```

## Props

| 名称          | 说明                                 | 类型                  | 默认值            |
| ------------- | ------------------------------------ | --------------------- | ----------------- |
| `accept`      | 允许的文件类型列表（逗号分隔扩展名） | `string`              | `.xlsx,.xls,.csv` |
| `params`      | 附加参数，会追加到 `FormData`        | `Record<string, any>` | `{}`              |
| `templateUrl` | 模板下载地址，存在时渲染模板按钮插槽 | `string`              | `""`              |
| `maxSize`     | 最大文件大小（MB）                   | `number`              | `10`              |

## 事件

无额外事件，内部在点击时触发自定义上传逻辑并显示消息提示。

## 插槽

| 名称       | 说明                                          |
| ---------- | --------------------------------------------- |
| `default`  | 上传触发按钮内容，默认渲染绿色 `ElButton`     |
| `template` | 当提供 `templateUrl` 时用于自定义模板下载按钮 |

## 暴露

`ref<ImportExpose>`：`import(file)` 主动触发导入、`downloadTemplate()` 下载模板。

## 权限与行为

- 无 `import` 权限 (`crud.getPermission('import')` 为假) 时不渲染。
- 上传前校验扩展名与大小，不符合会提示错误并阻止上传。
- 成功后调用 `crud.refresh()` 刷新列表；若后端返回 `errors` 会以消息提示前几条。

## 常见问题

- **后端接口如何接收？** 内部构建 `FormData`，文件字段为 `file`，附带 `ids`（当前选中行主键列表）与传入的 `params`。
- **想支持其他格式？** 调整 `accept` 即可，例如 `.json,.txt`。
