# 架构设计

## 总体架构
```mermaid
flowchart TD
    UI[组件层] --> Core[业务核心逻辑]
    Core --> Utils[工具与适配]
    UI --> Hooks[组合式钩子]
```

## 技术栈
- **前端:** Vue 3 + Element Plus + Vite
- **测试:** Vitest + happy-dom
- **构建:** pnpm / vite build

## 核心流程
```mermaid
sequenceDiagram
    participant User as 使用者
    participant Component as 组件
    participant Core as Core逻辑
    participant API as 远端API

    User->>Component: 交互(点击/输入)
    Component->>Core: 调用核心方法
    Core->>API: 请求/回调
    API-->>Core: 数据/状态
    Core-->>Component: 状态更新
    Component-->>User: 渲染结果
```

## 重大架构决策
完整的 ADR 存储在各变更的 how.md 中，本章节提供索引。

| adr_id | title | date | status | affected_modules | details |
|--------|-------|------|--------|------------------|---------|
| ADR-0001 | 初始化知识库骨架 | 2025-12-11 | ✅已采纳 | all | history/2025-12/202512111646_coverage/why.md |
