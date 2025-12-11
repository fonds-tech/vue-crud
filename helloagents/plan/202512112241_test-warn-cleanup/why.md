# 变更提案: 测试警告清理

## 需求背景
当前执行 `pnpm test` 虽然全部用例通过，但控制台输出大量 Vue 运行时警告（组件解析、注入缺失、生命周期调用环境、只读计算属性写入等），降低信噪比并可能掩盖真实问题，需要系统清理。

## 变更内容
1. 追踪并修复 Vue 动态组件/指令解析相关警告，确保在无渲染实例时也能安全返回。
2. 处理生命周期与注入缺失警告，完善 `useBrowser` 与 `useConfig` 等公共 Hook 的防御逻辑。
3. 修正列设置等模块的只读计算属性写入警告，避免无效写操作与副作用。
4. 补充必要的单元测试断言，确保警告被消除且行为不回退。

## 影响范围
- 模块: search 渲染、detail 渲染、form 渲染、table 设置、通用 hooks
- 文件: src/components/search/*, src/components/detail/render/content.tsx, src/components/form/render/slots.tsx, src/components/table/core/settings.ts, src/hooks/useBrowser.ts, src/hooks/useConfig.ts 等
- API: 对外 API 无变更，主要是内部防御和警告治理
- 数据: 无数据模型变更

## 核心场景
### 需求: 测试输出无警告
**模块:** 测试治理
- 在 CI 或本地执行 `pnpm test`，不出现 Vue 运行时警告，所有用例继续通过。

## 风险评估
- 风险: 误改动渲染路径导致组件行为变化或测试回归。
- 缓解: 逐点修复并补充针对警告来源的单测断言，回归完整 `pnpm test`。
