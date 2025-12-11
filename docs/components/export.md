# fd-export 导出按钮

`<fd-export>` 提供标准导出流程：收集当前搜索条件与选中行，调用 CRUD 服务的 `export` 方法并自动下载返回的文件 URL。

## 基本示例

```vue
<fd-crud>
  <fd-search />
  <fd-table />
  <fd-export :params="{ scene: 'user' }">
    <template #trigger>
      <el-button type="warning">导出数据</el-button>
    </template>
  </fd-export>
</fd-crud>
```

## Props

| 名称     | 说明                                   | 类型                  | 默认值 |
| -------- | -------------------------------------- | --------------------- | ------ |
| `params` | 额外导出参数，会与搜索条件、选中行合并 | `Record<string, any>` | `{}`   |

## 事件

无额外事件，点击时会触发导出逻辑并显示成功/失败消息。

## 插槽

| 名称      | 说明                                                    |
| --------- | ------------------------------------------------------- |
| `default` | 默认按钮内容，未提供时显示黄色 `ElButton`（文案“导出”） |
| `trigger` | 自定义触发区域，包裹在容器内，点击后执行导出            |

## 暴露

`ref<ExportExpose>`：`export(params?)` 可在父组件主动触发导出。

## 权限与行为

- 无 `export` 权限 (`crud.getPermission('export')`) 时不渲染。
- 会尝试从 `crud.service.export` 调用后端接口，返回对象含 `url` 时自动调用 `downloadFile` 触发下载。
- 会同时附带选中行主键（`ids/id`）与搜索条件（通过 `search.get.model` 事件获取）。

## 常见问题

- **返回的不是 url？** 组件仅在 `res.url` 存在时触发下载，其他结构请在后端保证返回下载链接。
- **选中行未传递？** 确认列表有选中，且 `dict.primaryId` 配置正确；组件会把选中行主键 join 后放入 `ids`/`id`。
