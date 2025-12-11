# fd-select 远程选择器

`<fd-select>` 在 Element Plus `ElSelect` 基础上封装了远程加载、选项映射与编程式刷新，适合作为 CRUD 场景下的标准下拉选择组件。

## 功能亮点

- **远程拉取**：传入 `api(params)` 即可获取选项，异常自动回退为空数组。
- **参数响应式**：`params` 变化会自动重新请求（`lodash.isEqual` 去抖重复请求）。
- **统一映射**：无论远程还是静态 `options`，都会按 `labelKey/valueKey` 重新映射，避免空值。
- **编程式控制**：`ref` 暴露 `refresh`、`options`，可手动刷新或直接读取最新选项。

## 基本示例

```vue
<fd-select
  v-model="form.status"
  :api="fetchStatus"
  :params="{ type: 'user' }"
  label-key="label"
  value-key="value"
  placeholder="请选择状态"
/>

<script setup lang="ts">
import type { SelectOption } from "vue-crud"
import { request } from "@/utils/request"

const fetchStatus = params => request.get<SelectOption[]>("/api/status", { params })
</script>
```

## Props

继承 `ElSelect` 的全部 props，并扩展（其余保持 Element Plus 原有含义）：

| 名称        | 说明                                         | 类型                         | 默认值  |
| ----------- | -------------------------------------------- | ---------------------------- | ------- |
| `api`       | 远程获取选项 `(params) => Promise<Option[]>` | `Function`                   | -       |
| `params`    | 请求参数对象                                 | `Record<string, unknown>`    | `{}`    |
| `immediate` | 组件创建后是否自动请求一次                   | `boolean`                    | `true`  |
| `labelKey`  | 选项对象中用于展示的字段                     | `string`                     | `label` |
| `valueKey`  | 选项对象中用于绑定值的字段                   | `string`                     | `value` |
| `options`   | 静态选项列表（远程结果优先覆盖）             | `Array<Record<string, any>>` | `[]`    |

> 未传 `api` 时使用静态 `options`；传入 `api` 但返回非数组会回退为空数组。

## 事件

沿用 Element Plus `ElSelect` 事件（如 `change`、`visible-change`、`clear` 等），无新增事件。

## 插槽

默认插槽及所有命名插槽会得到 `{ options, refresh }`，可自定义选项展示；不传插槽时直接透传到 `ElSelect`。

## 暴露

`ref<SelectExpose>`（透出于组件 `expose`）：`refresh()` 触发远程请求、`options` 读取当前选项。

## 常见问题

- **需要手动刷新**：调用 `selectRef.value?.refresh()`，或利用插槽注入的 `refresh`。
- **如何保留静态选项？** 未传 `api` 时使用 `options`；远程结果为空时会回退静态选项。
- **多选匹配不到值？** 确认 `valueKey` 与选项字段一致，组件会统一映射 `label/value`，避免空值。
