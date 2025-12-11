# fd-cascader 级联选择

`<fd-cascader>` 在 Element Plus `ElCascader` 基础上封装了远程刷新、参数监听与选项回退逻辑，适合行政区、组织树等场景。

## 功能特点

- **远程加载**：提供 `api(params)` 时自动请求选项；异常时回退为空数组。
- **参数驱动**：`params` 变化自动刷新，避免手动管理依赖。
- **静态兜底**：若远程结果为空会回退到传入的静态 `options`。
- **编程式刷新**：通过 `ref` 暴露 `refresh` 与 `options`，可在父级主动刷新。

## 基本示例

```vue
<fd-cascader
  v-model="form.region"
  :api="fetchRegions"
  :params="{ type: 'china' }"
  :props="{ checkStrictly: true, emitPath: false }"
  placeholder="请选择区域"
/>

<script setup lang="ts">
import { request } from "@/utils/request"

const fetchRegions = params => request.get("/api/regions", { params })
</script>
```

## Props

继承 `ElCascader` 的全部 props，并扩展（其余保持 Element Plus 原有含义）：

| 名称        | 说明                                         | 类型                         | 默认值 |
| ----------- | -------------------------------------------- | ---------------------------- | ------ |
| `api`       | 远程获取选项 `(params) => Promise<Option[]>` | `Function`                   | -      |
| `params`    | 请求参数对象                                 | `Record<string, unknown>`    | `{}`   |
| `immediate` | 组件创建后是否自动请求一次                   | `boolean`                    | `true` |
| `options`   | 静态选项列表（远程结果优先覆盖）             | `Array<Record<string, any>>` | `[]`   |

## 事件

沿用 Element Plus `ElCascader` 事件（如 `change`、`expand-change`、`visible-change` 等），无新增事件。

## 插槽

与 `ElCascader` 一致，支持 `default` / `empty` / `prefix` 等全部插槽；未传插槽时直接透传。

## 暴露

`ref<CascaderExpose>`：`refresh()` 触发远程请求；`options` 读取当前选项。

## 常见问题

- **需要手动刷新**：调用 `cascaderRef.value?.refresh()` 即可。
- **懒加载怎么配？** 使用原生 `props.lazy` 与 `lazyLoad` 即可，`fd-cascader` 不限制原生能力。
- **参数联动？** 直接改变 `params` 对象即可触发自动刷新，内部使用深度对比避免重复请求。
