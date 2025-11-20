# fd-add-button 新增按钮

`<fd-add-button>` 基于 Element Plus `ElButton` 封装，用于触发 CRUD 场景中的新增操作：

- 自动读取 `crud.dict.label.add` 作为默认文本；
- 依据 `crud.getPermission('add')` 控制显隐；
- 点击时调用 `crud.rowAdd()`，无需手动注入逻辑。

## 基本示例

```vue
<template>
  <fd-crud ref="crud">
    <fd-add-button>新建用户</fd-add-button>
  </fd-crud>
</template>

<script setup lang="ts">
import type { CrudRef } from "vue-crud"
import { ref } from "vue"

const crud = ref<CrudRef>()
</script>
```

如果不传插槽文本，会默认显示 `crud.dict.label.add`。

## 与 useCrud 搭配

```ts
import { ref } from "vue"
import { useCrud } from "vue-crud"

const crud = useCrud(
  {
    dict: {
      label: {
        add: "添加",
        update: "编辑",
        delete: "删除",
      },
      api: {
        add: "/api/user",
        delete: "/api/user",
        page: "/api/user/page",
        update: "/api/user",
      },
    },
    permission: {
      add: true,
    },
  },
  ctx => ctx.refresh(),
)
```

## 插槽

| 名称      | 说明                       | 参数 |
| --------- | -------------------------- | ---- |
| `default` | 按钮文本，可插入自定义内容 | -    |

> 删除按钮请参考 `fd-delete-button` 组件，整体 CRUD 页面请参阅 `fd-crud` 文档。
