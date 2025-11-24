# fd-cascader 级联选择

`<fd-cascader>` 在 Element Plus `ElCascader` 基础上封装了远程刷新、参数映射及 loading 状态控制，适合加载行政区、部门树等结构化数据。

## 功能特点

- **远程数据加载**：只需提供 `api(params)` 即可自动拉取树形结构，支持即时和手动刷新。
- **参数合并**：`params` 可以是对象或函数，便于根据其它字段携带附加条件。
- **统一清空逻辑**：清空选择时自动清理缓存并再次刷新，确保数据保持最新。

## 基本示例

```vue
<fd-cascader
  v-model="form.region"
  :api="fetchRegions"
  :props="{ checkStrictly: true, emitPath: false }"
  :params="() => ({ type: 'china' })"
  placeholder="请选择区域"
/>

<script setup lang="ts">
import { request } from "@/utils/request"

const fetchRegions = params => request.get("/api/regions", { params })
</script>
```

## Props

除 `ElCascader` 原有 props 外，新增：

| 名称        | 说明                                         | 类型                                                      | 默认值 |
| ----------- | -------------------------------------------- | --------------------------------------------------------- | ------ |
| `api`       | 异步请求函数 `(params) => Promise<Option[]>` | `Function`                                                | -      |
| `params`    | 请求参数/函数，支持根据其他字段动态生成      | `Record<string, any> \| (payload) => Record<string, any>` | `{}`   |
| `immediate` | 创建后是否自动请求一次                       | `boolean`                                                 | `true` |

组件内部还允许直接传 `options` 作为静态数据，远程数据优先级更高。

## 事件

| 事件    | 说明                                 |
| ------- | ------------------------------------ |
| `clear` | 在清空已选项后触发，同时重置远程数据 |

## 暴露

通过 `ref` 可访问 `refresh(params?)`、`options`、`loading`，方便在父组件中控制数据重新加载。

## 常见问题

- **如何处理级联懒加载？** 结合 `ElCascader` 的 `lazy` + `lazyLoad` 即可，`fd-cascader` 不会限制这些原生能力。
- **多表单复用？** 可以，一般把 `api` 函数提取成公共服务即可；不同实例之间不共享缓存。
- **需要根据父级选择刷新？** 把 `params` 写成函数，接收当前 `fd-cascader` 内部合并的 payload，并 return 最新参数。
