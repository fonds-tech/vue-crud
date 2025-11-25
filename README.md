<h1 align="center">CRUD Pro · Vue 3 企业级增删改查引擎</h1>

<p align="center">
面向业务台账场景的配置化 CRUD 解决方案，基于 Vue 3 + Element Plus 构建，内置搜索、表格、表单、详情、导入等模块，聚焦“快速拼装 + 高可定制”。
</p>

<p align="center">
  <a href="https://github.com/fonds-tech/vue-crud/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/fonds-tech/vue-crud/ci.yml?branch=main&logo=github&style=flat-square" alt="CI"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/fonds-tech/vue-crud?style=flat-square" alt="License"></a>
</p>

## 🎯 项目简介

`vue-crud` 提供一套“插件 + 组件 + Hooks”的组合式方案。你可以将插件作为全局能力注入应用，在页面中用 `fd-crud`
包裹搜索、表格、详情、弹窗等组件，通过配置驱动完成大多数企业后台的标准增删改查流程。示例站点位于 `src/views`，可直接运行 `pnpm dev` 体验真实交互。

## ✨ 核心特性

- **配置优先**：统一的 `dict / permission / events` 配置项管理接口字段、权限开关与回调，减少重复样板代码。
- **高内聚组件库**：`fd-crud`、`fd-search`、`fd-table`、`fd-detail`、`fd-upsert` 等十余个组件覆盖 CRUD 主流程，默认样式与 Element Plus 保持一致。
- **组合式 Hooks**：`useCrud / useTable / useSearch / useDetail` 等 Hook 帮助你在 `setup` 中注入服务、订阅事件、控制弹窗，保持代码可测试、易维护。
- **国际化与主题**：内置中英日等多语言字典（`src/locale`），并对暗黑模式、面板样式做了预设，开箱即用。
- **工程化能力**：Vite + TypeScript + pnpm + Vitest + ESLint + VitePress，配套 CI/CD、lint-staged、simple-git-hooks，保障代码质量与文档协同。

## 🏗️ 技术栈与目录

- **技术选型**：Vue 3、TypeScript、Element Plus、Vue Router、Vite、Vitest、VitePress。
- **关键目录**：
  - `src/components`：所有 `fd-*` 业务组件，实现渲染逻辑与类型定义。
  - `src/hooks`：组合式 Hook；如 `useCrud` 负责注入配置，`useTable` 负责列配置、数据加载。
  - `src/utils/test.ts`：示例服务 `TestService`，模拟真实接口。
  - `docs/`：VitePress 文档站，支持本地开发与静态化输出。
  - `scripts/clean.mjs`：构建前清理 `dist` 的辅助脚本。

## 🚀 快速开始（本仓库）

```bash
# 1. 克隆仓库
git clone https://github.com/fonds-tech/vue-crud.git
cd vue-crud

# 2. 安装依赖（推荐 pnpm >= 8，Node >= 18）
pnpm install

# 3. 启动示例站点
pnpm dev
```

更多脚本见下文“项目脚本”。

## 📦 安装到你的项目

```bash
pnpm add vue-crud element-plus vue
```

在入口文件中注册插件并传入配置：

```ts
import App from "./App.vue"
import { Crud } from "vue-crud"
import { createApp } from "vue"

const app = createApp(App)

app.use(Crud, {
  dict: {
    primaryId: "id",
    label: {
      add: "新增用户",
      list: "用户列表",
      delete: "删除",
      update: "编辑",
    },
    api: {
      page: "/api/user/page",
      add: "/api/user",
      update: "/api/user",
      delete: "/api/user/delete",
      info: "/api/user/info",
    },
    pagination: { page: "pageNo", size: "pageSize" },
    search: { keyWord: "keyword" },
  },
  permission: { add: true, delete: true, update: true, detail: true },
  style: { size: "default", form: { span: 12, labelWidth: 120 } },
  events: {
    "table:loaded": ({ list }) => console.log("数据已刷新", list.length),
  },
  onRefresh(params, ctx) {
    // 你可以在这里注入全局 loading、埋点，或自定义数据渲染策略
    return ctx.next(params)
  },
})

app.mount("#app")
```

## ⚙️ 典型页面搭建示例

```vue
<fd-crud>
  <fd-search ref="search" />

  <fd-table ref="table">
    <template #toolbar>
      <fd-add-button />
      <fd-delete-button />
      <fd-import />
    </template>
  </fd-table>

  <fd-detail ref="detail" />
  <fd-upsert ref="upsert" />
</fd-crud>
```

配合组合式 Hook：

```ts
import { TestService } from "@/utils/test"
import { useCrud, useTable, useDetail, useSearch } from "vue-crud"

const crud = useCrud({ service: new TestService(), permission: { add: true } })
const search = useSearch({ /* 搜索项配置 */ })
const table = useTable({ columns: [/* 列定义 */] })
const detail = useDetail({ items: [/* 详情字段 */] })
```

## 🧱 组件能力一览

| 组件                                           | 作用                                           | 亮点                                                     |
| ---------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------- |
| `fd-crud`                                      | 场景容器，负责注入服务、权限、字典，并分发事件 | 内置 `Mitt` 事件总线、loading/selection 状态管理         |
| `fd-search`                                    | 搜索表单                                       | 支持网格布局、折叠、`items` 动态组件、action 区按钮预设  |
| `fd-table`                                     | 数据表格                                       | 列配置驱动，支持字典映射、操作列、toolbar 插槽、批量选择 |
| `fd-detail`                                    | 详情卡片                                       | 分组显示、组件式渲染字段、Span 栅格布局                  |
| `fd-upsert`                                    | 新增/编辑弹窗                                  | `items` 与校验规则配置化，可与表格事件联动               |
| `fd-form`/`fd-grid`/`fd-grid-item`             | 通用表单与布局容器                             | 提供与 Element Plus 完整联动的行列布局 API               |
| `fd-add-button`/`fd-delete-button`/`fd-import` | 常用操作按钮                                   | 自动读取 `permission` 与 `crud` 状态，零成本复用         |

更多组件请查阅 `src/components` 或 VitePress 文档。

## 🔩 服务与 Hook 约定

- **服务接口**：示例 `TestService` 提供 `page / add / update / delete / info / list` 方法，你可以在业务代码中注入自家的 API 封装对象即可。
- **Hook 回调**：
  - `useCrud(options, callback)`：第二个参数可拿到暴露的 crud 实例，常用于初始化刷新。
  - `useTable(options, callback)`：`options.columns` 支持 `dict`、`action`、`formatter` 等配置；回调中可以拿到 `table.reload()` 等方法。
  - `useSearch / useDetail / useForm`：与对应组件一一绑定，保持模板与逻辑松耦合。
- **事件流**：`crud.mitt` 对外暴露，在 `events` 配置中统一订阅 `add:success`、`delete:success` 等事件，方便跨组件通讯。

## 🛠️ 项目脚本

| 命令                                                      | 说明                                                    |
| --------------------------------------------------------- | ------------------------------------------------------- |
| `pnpm dev`                                                | 启动示例站点，实时调试组件与示例页面                    |
| `pnpm build`                                              | 执行 `build:clean` + `vite build`，生成库产物到 `dist/` |
| `pnpm test`                                               | 使用 Vitest 执行单元测试（依赖 happy-dom）              |
| `pnpm lint`                                               | 运行 ESLint（支持 `lint-staged` 自动修复）              |
| `pnpm typecheck` / `pnpm typecheck:test`                  | 运行 TypeScript 类型检查，后者针对测试配置              |
| `pnpm docs:dev` / `pnpm docs:build` / `pnpm docs:preview` | 文档站点开发、构建、预览                                |
| `pnpm release`                                            | 通过 bumpp 半自动打 tag、更新版本号                     |

## 📚 文档与部署

- 文档源文件位于 `docs/`，基于 [VitePress](https://vitepress.dev/zh/) 构建。
- 本地开发文档：`pnpm docs:dev`
- 构建静态文件：`pnpm docs:build`，产物路径 `docs/.vitepress/dist`
- 部署到 GitHub Pages 的 `workflow` 示例：

```yaml
- name: Install Dependencies
  run: pnpm install --frozen-lockfile
- name: Build Docs
  run: pnpm docs:build
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: docs/.vitepress/dist
```

## 🧪 质量保障

- **单元测试**：`pnpm test` 会加载 `src/components/*/__tests__`，建议为每个导出的组合式能力补充测试。
- **类型安全**：`tsconfig.build.json` + `vue-tsc` 保证组件类型提示准确；发布包会输出 `dist/types`。
- **代码规范**：`@fonds/eslint-config` + `simple-git-hooks` + `lint-staged` 实现提交前自动检查，保持仓库整洁。

## 🤝 贡献指南

1. Fork 并新建特性分支，命名建议 `feat/*`、`fix/*`。
2. 提交前运行 `pnpm lint && pnpm test && pnpm typecheck` 确保通过。
3. 如需更新文档，请同步修改 `docs/` 下的对应章节并附上示例。
4. PR 描述中请列出变更要点、破坏性变更提示及验证方式。

欢迎通过 Issue/PR 分享真实业务诉求，帮助我们共建更稳定的 CRUD 基础设施。

## 📄 许可证

本项目采用 [MIT 许可证](./LICENSE)。
