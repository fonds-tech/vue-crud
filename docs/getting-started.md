# 快速开始

在几分钟内启动并使用 `vue-crud`，以下步骤默认你已经安装好 `pnpm` 与 Node.js 18+。

## 安装

```bash
pnpm add vue-crud
```

如果你的项目使用 Element Plus 或 VueUse，需要保证它们的版本满足 `peerDependencies`。

## 基础用法

```ts
import App from "./App.vue"
import VueCrud from "vue-crud"
import ElementPlus from "element-plus"
import { createApp } from "vue"

import "element-plus/dist/index.css"
import "vue-crud/style.css"

createApp(App)
  .use(ElementPlus)
  .use(VueCrud)
  .mount("#app")
```

## CRUD 页面骨架

```vue
<template>
  <fd-crud ref="crud">
    <fd-add-button>新建</fd-add-button>
    <fd-delete-button>批量删除</fd-delete-button>
  </fd-crud>
</template>

<script setup lang="ts">
import type { CrudOptions } from "vue-crud"
import { useCrud } from "vue-crud"
import { UserService } from "@/api/user"

const options: CrudOptions = {
  service: new UserService(),
  dict: {
    label: {
      add: "新增",
      delete: "删除",
      list: "用户列表",
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
    delete: true,
  },
}

const crud = useCrud(options, app => app.refresh())
</script>
```

## 本地开发文档

如果你修改了组件库，推荐在本仓库中直接运行：

```bash
pnpm docs:dev
```

构建静态站点：

```bash
pnpm docs:build
```

所有静态文件位于 `docs/.vitepress/dist`，可直接上传到任意静态托管服务。
