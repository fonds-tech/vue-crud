<!--
同步影响报告
- 版本变更: 未定义 → 1.0.0
- 修改原则: 占位符 → 代码质量与可维护性 / 测试标准与回归防护 / 用户体验一致性 / 性能与产物要求 / 文档与发布纪律
- 添加的部分: 工程约束与技术栈; 开发流程与质量门
- 删除的部分: 无
- 模板更新: .specify/templates/plan-template.md ✅; .specify/templates/spec-template.md ✅; .specify/templates/tasks-template.md ✅
- 后续 TODO: 无
-->

# vue-crud 宪章

## Core Principles

### 代码质量与可维护性（非妥协项）

所有提交必须通过 `pnpm lint`、`pnpm typecheck`，禁止绕过或静态禁用规则；代码需高内聚低耦合、无重复和死代码，复杂分支需配中文注释说明取舍；公共类型、暴露的组件/Hook API 需与文档示例同步，保证稳定性与可读性。

### 测试标准与回归防护

新增或变更行为必须附带 Vitest 单元/组件测试，至少覆盖主成功路径与 1 个失败/边界场景；关键交互（表格分页、搜索、权限分支、字典映射）需有集成级验证；`pnpm test` 与 `pnpm typecheck` 为合并门禁，失败不得合并；回归缺陷需添加复现用例后再修复。

### 用户体验一致性

UI/交互需与 Element Plus 设计语言保持一致（尺寸、间距、状态色），遵循项目默认的 i18n 文案与暗色/亮色模式；加载、空、错误、禁用状态必须显式展示，交互需提供可感知反馈（loading/disabled/toast）；破坏性 UX 变更需在文档与示例中体现迁移指引。

### 性能与产物要求

构建产物必须保持可 tree-shaking，禁止引入单个 gzip >50KB 的新依赖且未给出性能收益理由；常见交互（表格分页/筛选、对话框弹出/关闭）在示例数据量 ≤200 行时 p95 响应时间 <200ms（以本地现代笔记本和 happy-dom 环境为基准）；列表/表格渲染需避免 O(n²) 遍历，超过 500 行必须采用分批/虚拟化或服务端分页策略。

### 文档与发布纪律

外部 API、组件属性、事件或默认配置的任何改动必须同步更新 README/VitePress 文档与示例；所有可见变更遵循 SemVer，破坏性调整需要在变更说明中标记 BREAKING 并附迁移步骤；提案/规划/任务文件需反映上述原则的质量与性能约束。

## 工程约束与技术栈

- 技术栈：Vue 3 + TypeScript + Element Plus + Vite，包管理器强制使用 pnpm；保持 `tsconfig.json` 严格模式开启。
- 代码规范：统一使用 `@fonds/eslint-config` 与 Prettier 约定（2 空格、无分号、双引号、trailing comma、printWidth 180）；提交前 `simple-git-hooks` + `lint-staged` 自动执行检查。
- 测试与验证：Vitest（happy-dom）覆盖逻辑与组件，`pnpm test`/`pnpm typecheck`/`pnpm lint` 为最低交付门槛。
- 文档语言：仓库文档、注释、对外说明统一中文，专业名词需附中文解释。
- 依赖治理：新增依赖需证明必要性、尺寸与 tree-shaking 影响；构建脚本 `scripts/clean.mjs` 应在发布/构建前执行。

## 开发流程与质量门

- 规划阶段必须执行“Constitution Check”：确认代码质量、测试、用户体验、性能及文档纪律的满足路径与验收方式。
- 开发前明确成功度量：至少包含 UX 状态一致性、性能预算、测试覆盖目标；未定义不得进入实现。
- PR/变更合入条件：`pnpm lint && pnpm test && pnpm typecheck` 必须通过；如涉及性能敏感路径需附数据或理由；评审需逐条对照本宪章原则。
- 文档同步：功能或破坏性调整需同时更新 README、docs 及示例代码；缺失更新视为阻断合并。
- 发布与回归：发布前运行构建与核心用例回归；发现缺陷需先补测试再修复，避免无保护变更。

## Governance

本宪章优先于其他工程实践；任何对原则或治理流程的重大修改需先提出 Proposal/Spec 评审并依据 SemVer 升级版本。修订流程：提出变更理由 → 更新宪章草案 → 经维护者评审通过 → 标记 Ratified 日期与版本。所有 PR/变更必须显式验证与宪章一致，违背需提供豁免理由并在后续版本消除豁免。

**Version**: 1.0.0 | **Ratified**: 2025-12-04 | **Last Amended**: 2025-12-04
