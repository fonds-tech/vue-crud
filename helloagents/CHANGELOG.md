# Changelog

本文件记录项目所有重要变更。格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 变更
- 补齐组件文档（fd-select/fd-cascader/导入导出/新增删除按钮），对齐源码的 props、权限与用法示例

## [1.0.3] - 2025-12-11

### 修复
- 清理剩余 Vitest Vue 警告：table 渲染用例内联 render 执行 withDirectives，form 插槽边缘用例在组件上下文解析动态组件，cascader 非函数 api 用例避免类型告警，确保测试输出零警告

## [1.0.2] - 2025-12-11

### 修复
- 清理 Vitest 输出中的 Vue 警告：完善测试 stub 属性/事件声明，修正无效模板与 props，增加 lifecycle 安全降级，确保测试运行零警告

## [1.0.1] - 2025-12-11

### 新增
- 初始化 HelloAGENTS 知识库骨架，准备覆盖率提升工作
- 增加多模块单测补充，提升分支覆盖率（grid、context-menu、search、table core、hooks、utils）
