# 技术设计: 覆盖率 100% 补测

## 技术方案
### 核心技术
- Vitest + happy-dom
- Vue 3 + Element Plus 组件测试（JSX/TSX 与组合式 API）

### 实现要点
- 按覆盖率报告逐文件补测：优先 search/table → upsert/form/layout → hooks → utils/component/dataset → context-menu/grid/零散分支。
- 对难以触达的分支采用定向 mock/输入场景触发，保持现有行为不变；如需调整实现，仅做最小化、防御性改动。
- 每批补测后运行 `pnpm test -- --coverage` 验证增量，直到 100%。

## 架构设计
- 无架构变更，仅测试补齐与必要的轻量防御性调整。

## 架构决策 ADR
- 本次不涉及新增 ADR。

## API 设计
- 无对外 API 变更。

## 数据模型
- 无数据模型变更。

## 安全与性能
- 测试侧 mock 需隔离全局状态；避免对真实 DOM/window 造成副作用泄漏。

## 测试与部署
- 使用 Vitest 现有配置；补测完成后执行全量覆盖率检查确保 100%。
