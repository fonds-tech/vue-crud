# Project Context - Vue CRUD

## Purpose

**Vue CRUD** 是一个面向企业级业务台账场景的配置化 CRUD 解决方案。项目的核心目标是:

1. **提升开发效率**: 通过配置化方式减少 70% 以上的增删改查样板代码
2. **统一开发模式**: 提供"插件 + 组件 + Hooks"的标准化组合式方案
3. **保持高可定制性**: 支持插槽、事件、Hook 等多种扩展方式满足复杂业务需求
4. **工程化完善**: TypeScript 类型安全 + 完整的测试覆盖 + 代码规范保障

**适用场景**:

- 用户管理、商品管理、订单管理等标准 CRUD 业务
- 内容管理系统(CMS)、权限管理平台
- 数据配置台账、企业后台管理系统

## Tech Stack

### 核心框架

- **Vue 3** (^3.x) - 组合式 API + Reactivity System
- **TypeScript** (^5.x) - 完整的类型定义与类型推导
- **Element Plus** (^2.x) - 企业级 Vue 3 UI 组件库
- **Vue Router** (^4.x) - 官方路由解决方案

### 构建工具链

- **Vite** (^6.x) - 高性能前端构建工具
- **pnpm** (^10.x) - 高效的 monorepo 包管理器
- **vite-plugin-dts** - TypeScript 声明文件生成
- **unplugin-vue-components** - 自动导入组件
- **unplugin-icons** - 图标按需加载

### 测试与质量

- **Vitest** (^3.x) - 基于 Vite 的单元测试框架
- **@vue/test-utils** - Vue 组件测试工具
- **@vitest/coverage-v8** - 代码覆盖率报告
- **happy-dom** - 轻量级 DOM 模拟环境

### 代码规范

- **ESLint** + **@fonds/eslint-config** - 代码检查
- **Prettier** - 代码格式化
- **simple-git-hooks** + **lint-staged** - Git 提交前检查
- **@typescript/native-preview** - 原生 TypeScript 性能优化

### 文档工具

- **VitePress** (^1.x) - 静态站点生成器
- **Markdown** - 文档编写格式

### 辅助库

- **@fonds/utils** - 内部工具函数库
- **lodash-es** - 函数式工具库
- **sortablejs** + **vuedraggable** - 拖拽排序
- **uuid** - 唯一标识符生成
- **@iconify-json/tabler** - Tabler 图标库
- **sass** - CSS 预处理器

## Project Conventions

### Code Style

#### 文件命名

- **组件文件**: 使用 kebab-case,如 `add-button.tsx`、`context-menu.tsx`
- **类型文件**: `interface.ts` (接口定义)、`props.ts` (Props 定义)
- **Hook 文件**: `use-*.ts`,如 `use-crud.ts`、`use-table.ts`
- **测试文件**: `*.spec.tsx` 或 `*.test.tsx`

#### 组件结构规范

每个组件遵循统一的目录组织:

```
component-name/
├── index.ts              # 导出入口
├── interface.ts          # TypeScript 接口定义
├── component-name.ts     # Props 定义
├── component-name.tsx    # 组件实现 (JSX)
├── style.scss           # 样式文件
├── core/                # 核心逻辑层
│   ├── hooks.ts         # 组件内部 Hook
│   ├── service.ts       # 服务层
│   ├── helpers.ts       # 辅助函数
│   └── actions.ts       # 操作逻辑
├── render/              # 渲染层
│   └── *.tsx            # 子渲染组件
└── __tests__/           # 单元测试
    └── *.spec.tsx
```

#### 代码格式

- **缩进**: 2 空格
- **引号**: 双引号 (由 Prettier 自动格式化)
- **分号**: 不使用分号 (ESLint 配置)
- **行宽**: 100 字符
- **尾逗号**: ES5 风格

#### 命名约定

- **组件名**: PascalCase,如 `FdCrud`、`FdTable`
- **变量/函数**: camelCase,如 `tableData`、`handleClick`
- **常量**: UPPER_SNAKE_CASE,如 `DEFAULT_PAGE_SIZE`
- **类型/接口**: PascalCase,如 `CrudOptions`、`TableColumn`
- **泛型参数**: 单个大写字母或 PascalCase,如 `T`、`DataType`

#### Props 定义规范

```typescript
// 使用 ExtractPropTypes 提取类型
export const fdTableProps = {
  columns: { type: Array as PropType<ColumnItem[]>, default: () => [] },
  data: { type: Array as PropType<any[]>, default: () => [] },
  loading: { type: Boolean, default: false }
} as const

export type FdTableProps = ExtractPropTypes<typeof fdTableProps>
```

### Architecture Patterns

#### 1. 分层架构

```
表现层 (Presentation Layer)
  ├── Components (*.tsx)      - 组件渲染逻辑
  └── Views (*.vue)           - 页面级组件

业务逻辑层 (Business Logic Layer)
  ├── Hooks (use-*.ts)        - 组合式逻辑复用
  ├── Core/Actions            - 操作行为封装
  └── Core/Helpers            - 业务辅助函数

服务层 (Service Layer)
  ├── Core/Service            - 数据服务接口
  └── Utils/Test              - 模拟服务实现

数据层 (Data Layer)
  └── Interface/Types         - TypeScript 类型定义
```

#### 2. 设计模式应用

**插件模式 (Plugin Pattern)**

- `Crud` 插件作为全局能力注入 Vue 应用
- 通过 `app.use()` 注册,提供全局配置和 provide/inject 机制

**组合式模式 (Composition Pattern)**

- 所有 Hooks 使用 Vue 3 Composition API
- 通过 `useCrud`、`useTable` 等实现逻辑复用和关注点分离

**事件总线模式 (Event Bus Pattern)**

- 使用 `Mitt` 实现组件间通信
- 事件命名约定: `module:action`,如 `add:success`、`table:loaded`

**服务接口模式 (Service Interface Pattern)**

- 定义 `CrudService` 标准接口
- 业务代码注入具体实现,保持解耦

**配置驱动模式 (Configuration-Driven Pattern)**

- 通过 `dict`、`permission`、`events` 配置对象驱动组件行为
- 减少命令式代码,提升声明式配置比例

#### 3. 关键架构决策

**为什么选择 JSX 而非 SFC?**

- 组件库需要高度动态的渲染逻辑
- JSX 提供更好的类型推导和灵活性
- 保持与 Vue 3 h() 函数的一致性

**为什么使用 Provide/Inject?**

- 避免 props drilling,简化跨层级通信
- `fd-crud` 作为容器向子组件注入 `crudContext`
- 子组件通过 `inject` 获取配置和服务

**为什么独立 core/ 和 render/ 目录?**

- 分离业务逻辑与渲染逻辑
- 提升代码可测试性(core 层无需 DOM)
- 便于后续支持不同 UI 库适配

### Testing Strategy

#### 测试覆盖目标

- **核心模块**: ≥ 85% 覆盖率
- **辅助模块**: ≥ 70% 覆盖率
- **总体目标**: ≥ 80% 覆盖率

#### 测试分类

**单元测试 (Unit Tests)**

- 测试对象: Hooks、Helper 函数、Actions
- 工具: Vitest + @vue/test-utils
- 位置: `__tests__/*.spec.tsx`
- 示例文件:
  - `src/components/crud/core/__tests__/hooks.spec.ts`
  - `src/components/table/__tests__/helpers.spec.ts`

**组件测试 (Component Tests)**

- 测试对象: Vue 组件的渲染和交互
- 方法: `mount`、`shallowMount`
- 覆盖场景:
  - Props 传递与响应
  - 事件触发与处理
  - 插槽渲染
  - 条件渲染逻辑

**集成测试 (Integration Tests)**

- 测试对象: 组件间协作流程
- 示例: CRUD 完整流程(搜索 → 表格 → 详情 → 编辑)

#### 测试编写规范

```typescript
// 1. 使用 describe 分组
describe("useCrud", () => {
  // 2. 每个 it 测试单一功能点
  it("should initialize with default config", () => {
    const crud = useCrud({ service: new TestService() })
    expect(crud.loading.value).toBe(false)
  })

  // 3. 使用有意义的测试描述
  it("should emit add:success event after successful add", async () => {
    // ... 测试逻辑
  })
})

// 4. 使用 beforeEach 清理状态
beforeEach(() => {
  // 重置模拟数据
})
```

#### Mock 策略

- **服务层**: 使用 `TestService` 提供模拟数据
- **外部依赖**: 使用 `vi.mock()` 模拟
- **定时器**: 使用 `vi.useFakeTimers()`
- **DOM 事件**: 使用 `@vue/test-utils` 的事件触发器

#### 测试命令

```bash
pnpm test                    # 监听模式
pnpm test -- --run           # 单次运行
pnpm test -- --coverage      # 生成覆盖率报告
pnpm test -- --ui            # UI 界面模式
```

### Git Workflow

#### 分支策略

**主分支**

- `main` - 生产分支,受保护,仅通过 PR 合并
- `develop` - 开发分支(如有需要)

**功能分支**

- `feat/*` - 新功能开发,如 `feat/add-export-component`
- `fix/*` - Bug 修复,如 `fix/table-pagination-issue`
- `refactor/*` - 重构,如 `refactor/crud-component-structure`
- `docs/*` - 文档更新,如 `docs/add-api-reference`
- `test/*` - 测试补充,如 `test/improve-table-coverage`
- `chore/*` - 构建/工具配置,如 `chore/update-vite-config`

#### Commit 规范

遵循 **Conventional Commits** 格式:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**:

- `feat`: 新功能
- `fix`: Bug 修复
- `refactor`: 重构(不影响功能)
- `docs`: 文档更新
- `test`: 测试相关
- `chore`: 构建/工具配置
- `style`: 代码格式调整(不影响逻辑)
- `perf`: 性能优化

**Scope 范围**: 组件名或模块名,如 `crud`、`table`、`search`、`hooks`

**示例**:

```bash
feat(table): add column settings panel
fix(search): resolve form reset issue
refactor(crud): extract core logic to separate files
docs(readme): update installation guide
test(detail): improve coverage to 85%
```

#### PR 流程

1. **创建 PR**: 提供清晰的标题和描述
2. **自动检查**: CI 执行 lint、test、typecheck、build
3. **Code Review**: 至少一位维护者审核
4. **合并要求**:
   - ✅ 所有 CI 检查通过
   - ✅ 无冲突
   - ✅ Code Review 通过
   - ✅ 相关文档已更新

#### Pre-commit Hooks

通过 `simple-git-hooks` + `lint-staged` 自动执行:

```bash
# 1. 安装依赖(离线模式)
pnpm install --frozen-lockfile --ignore-scripts --offline

# 2. 对暂存文件执行 ESLint 修复
npx lint-staged  # 实际执行: eslint --fix
```

## Domain Context

### 业务场景理解

**CRUD 操作流程**:

1. **Create (新增)**: 用户点击"新增"按钮 → 打开弹窗表单 → 填写数据 → 提交 → 刷新表格
2. **Read (查询)**: 用户输入搜索条件 → 点击搜索 → 加载表格数据 → 支持分页、排序
3. **Update (编辑)**: 用户点击"编辑"按钮 → 加载详情数据 → 修改表单 → 提交 → 刷新表格
4. **Delete (删除)**: 用户选择数据 → 点击"删除" → 二次确认 → 删除成功 → 刷新表格

### 核心概念术语

| 术语                  | 说明                                              | 代码体现                    |
| --------------------- | ------------------------------------------------- | --------------------------- |
| **Dict (字典)**       | 字段映射配置,定义接口字段名、分页参数、标签文本等 | `CrudDict` 接口             |
| **Permission (权限)** | 控制增删改查详等操作的可见性                      | `CrudPermission` 接口       |
| **Service (服务)**    | 封装数据接口的服务层对象                          | `CrudService` 接口          |
| **Column (列)**       | 表格列配置,定义字段、标题、渲染方式等             | `ColumnItem` 类型           |
| **Item (项)**         | 搜索项、表单项、详情项的通用配置单元              | `SearchItem`、`FormItem` 等 |
| **Upsert**            | Update + Insert 的合称,表示新增/编辑统一表单      | `fd-upsert` 组件            |
| **Toolbar**           | 表格上方的操作按钮区域                            | `#toolbar` 插槽             |
| **Action (操作列)**   | 表格每行右侧的操作按钮(编辑、删除、详情等)        | `ActionConfig`              |

### 数据流向

```
用户交互
  ↓
组件 (Components)
  ↓
Hook (useCrud, useTable, etc.)
  ↓
Service (CrudService 实现)
  ↓
API 接口
  ↓
后端服务
```

**事件流向**:

```
Service 操作成功
  ↓
触发事件 (crud.mitt.emit)
  ↓
事件回调 (events 配置)
  ↓
刷新表格/关闭弹窗等
```

### 字段映射 (Dict)

`CrudDict` 用于适配不同后端接口的字段命名差异:

```typescript
// 示例: 后端使用 pageNum/pageSize,前端统一为 page/size
dict: {
  pagination: {
    page: "pageNum",      // 前端传 page,后端接收 pageNum
    size: "pageSize",     // 前端传 size,后端接收 pageSize
    total: "totalCount"   // 后端返回 totalCount,前端读取为 total
  },
  primaryId: "id",        // 主键字段名
  label: {
    add: "新增用户",
    update: "编辑用户",
    delete: "删除用户"
  }
}
```

## Important Constraints

### 技术约束

1. **Vue 版本**: 必须 ≥ 3.3,利用 Composition API 和 `<script setup>`
2. **TypeScript**: 必须启用严格模式 (`strict: true`)
3. **Node 版本**: ≥ 18.0.0
4. **包管理器**: 强制使用 pnpm (通过 `packageManager` 字段锁定)
5. **浏览器兼容性**: 现代浏览器(ES2020+),不支持 IE

### 代码约束

1. **禁止使用 `any` 类型**: 除非明确标注为 `// eslint-disable-next-line`
2. **Props 必须有默认值**: 所有可选 Props 需提供 `default`
3. **组件必须有测试**: 新增组件需同步补充单元测试
4. **不允许直接修改 Props**: 遵循 Vue 单向数据流原则
5. **CSS 作用域**: 所有样式必须通过 BEM 命名或 CSS Modules 隔离

### 性能约束

1. **首屏加载**: 库产物大小 < 200KB (gzip)
2. **测试执行时间**: 完整测试套件 < 30 秒
3. **类型检查时间**: tsgo < 10 秒 (得益于 `@typescript/native-preview`)

### 业务约束

1. **权限控制**: 所有操作需遵守 `permission` 配置
2. **数据校验**: 表单提交前必须经过 Element Plus 校验
3. **错误处理**: Service 层异常需统一捕获并提示用户

## External Dependencies

### 必需依赖 (dependencies)

| 依赖                        | 版本    | 用途              | 重要性     |
| --------------------------- | ------- | ----------------- | ---------- |
| **vue**                     | ^3.x    | 核心框架          | ⭐⭐⭐⭐⭐ |
| **element-plus**            | ^2.x    | UI 组件库         | ⭐⭐⭐⭐⭐ |
| **@element-plus/icons-vue** | catalog | Element Plus 图标 | ⭐⭐⭐⭐   |
| **vue-router**              | ^4.x    | 路由管理          | ⭐⭐⭐⭐   |
| **lodash-es**               | catalog | 工具函数          | ⭐⭐⭐     |
| **sortablejs**              | catalog | 拖拽排序核心库    | ⭐⭐⭐     |
| **vuedraggable**            | catalog | Vue 3 拖拽组件    | ⭐⭐⭐     |
| **uuid**                    | catalog | 唯一标识符生成    | ⭐⭐       |
| **@fonds/utils**            | catalog | 内部工具库        | ⭐⭐⭐     |

### 开发依赖 (devDependencies)

**构建工具**:

- `vite` - 构建工具
- `@vitejs/plugin-vue` - Vue 插件
- `@vitejs/plugin-vue-jsx` - JSX 支持
- `vite-plugin-dts` - 类型声明生成
- `sass` - CSS 预处理器

**测试工具**:

- `vitest` - 测试框架
- `@vue/test-utils` - Vue 组件测试
- `@vitest/coverage-v8` - 覆盖率报告
- `happy-dom` - DOM 模拟

**代码质量**:

- `eslint` - 代码检查
- `@fonds/eslint-config` - ESLint 规则集
- `prettier` - 代码格式化
- `typescript` - 类型系统
- `@typescript/native-preview` - TS 性能优化

**工程化**:

- `simple-git-hooks` - Git Hooks
- `lint-staged` - 暂存文件检查
- `bumpp` - 版本管理
- `unplugin-vue-components` - 自动导入组件
- `unplugin-icons` - 图标按需加载

### Peer Dependencies (使用方需安装)

当其他项目安装 `vue-crud` 时,需同时安装:

- `vue` (^3.x)
- `element-plus` (^2.x)
- `@element-plus/icons-vue`

### 未来可能的依赖

- **@vueuse/core** - Vue Composition 工具集(考虑引入优化 Hooks)
- **pinia** - 状态管理(如需支持全局状态共享)
- **@tanstack/vue-virtual** - 虚拟滚动(大数据量表格优化)

### 依赖管理策略

- 使用 **pnpm workspace catalog** 统一版本管理
- 定期执行 `pnpm update` 更新依赖
- 慎重引入新依赖,评估包大小和维护状态
- 优先选择 Tree-shakable 的 ESM 依赖
