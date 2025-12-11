# 技术设计: 覆盖率提升

## 技术方案
### 核心技术
- Vitest + happy-dom 进行单测与覆盖率
- Vue Test Utils 进行组件渲染与事件模拟

### 实现要点
- 按模块补充分支用例，覆盖未触达行：table 渲染/核心、search lifecycle/action、grid 尺寸、context-menu 透传、delete-button 权限分支、hooks 边界、utils/component 组件安装分支。
- 使用 mock/stub 隔离外部依赖，控制定时器与异步。
- 保持现有 API 与行为不变，仅新增测试。

## 架构设计
无架构调整。

## 架构决策 ADR
暂无新增 ADR。

## API设计
无 API 变更。

## 数据模型
无数据变更。

## 安全与性能
- **安全:** 无外部请求；确保测试不引入敏感数据。
- **性能:** 控制测试用例数量，优先窄作用域。必要时使用 fake timers 提升稳定性。

## 测试与部署
- **测试:** `pnpm test` 全量，关注分支覆盖率提升。
- **部署:** 无部署动作。
