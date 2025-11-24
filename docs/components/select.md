# fd-select 远程选择器

`<fd-select>` 在 Element Plus `ElSelect` 基础上封装了远程加载、搜索防抖、统一事件透出等逻辑，适合作为 CRUD 场景下的标准下拉选择组件。

## 功能亮点

- **即插即用的远程模式**：传入 `api` 方法即可完成选项请求，自动处理 loading、空状态与 error。
- **双向刷新**：`refreshOnFocus`、`refreshOnBlur` 控制聚焦/失焦时是否重新请求数据。
- **搜索防抖**：`debounce` 毫秒内只触发一次请求，可结合后端分页列表。
- **上下文透传**：`default` 插槽会注入 `options / refresh / loading` 等信息，方便自定义展示。

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

继承 `ElSelect` 的全部 props，并扩展：

| 名称             | 说明                                          | 类型                                                      | 默认值    |
| ---------------- | --------------------------------------------- | --------------------------------------------------------- | --------- |
| `api`            | 异步请求函数 `(params) => Promise<Option[]>`  | `Function`                                                | -         |
| `params`         | 请求参数/函数，函数形态可根据当前输入动态生成 | `Record<string, any> \| (payload) => Record<string, any>` | `{}`      |
| `searchField`    | 搜索关键字对应的参数名                        | `string`                                                  | `keyword` |
| `refreshOnBlur`  | 失焦时根据关键字刷新选项                      | `boolean`                                                 | `true`    |
| `refreshOnFocus` | 聚焦时根据关键字刷新选项                      | `boolean`                                                 | `true`    |
| `labelKey`       | 选项对象 label 字段                           | `string`                                                  | `label`   |
| `valueKey`       | 选项对象 value 字段                           | `string`                                                  | `value`   |
| `immediate`      | 组件创建后立即请求一次                        | `boolean`                                                 | `true`    |
| `debounce`       | 搜索防抖时间（毫秒）                          | `number`                                                  | `300`     |

> 当传入 `api` 时，组件自动开启 `filterable`，并根据是否设置 `remote` 选择使用 `remoteMethod` 或 `filterMethod`。

## 事件

| 事件                     | 说明                                                     |
| ------------------------ | -------------------------------------------------------- |
| `change(value, payload)` | 与 `ElSelect` 一致，额外返回命中的 option 或 option 数组 |
| `search(keyword)`        | 输入搜索词时触发                                         |
| `clear`                  | 清空时触发，同时重置缓存                                 |

## 插槽

默认插槽及所有命名插槽都会得到 `{ options, refresh, loading }`，例如：

```vue
<fd-select v-model="model.user" :api="fetchUsers">
  <template #default="{ options, loading }">
    <el-option-group v-for="group in options" :key="group.id" :label="group.label">
      <el-option v-for="item in group.children" :key="item.id" :label="item.name" :value="item.id" />
    </el-option-group>
    <el-empty v-if="!loading && !options.length" description="暂无数据" />
  </template>
</fd-select>
```

## 常见问题

- **需要手动刷新**：调用 `selectRef.value?.refresh(extraParams)`，或利用插槽注入的 `refresh` 函数。
- **如何保留静态选项？** 如果未传 `api`，组件会回退到 `props.options` 或 `attrs.options` 中的静态数据。
- **多选匹配不到 payload？** 确认 `valueKey` 与选项对象字段一致；`change` 回调会返回完整匹配列表，可直接更新外部状态。
