# 变更提案: Vitest 警告再清理

## 需求背景
近期执行 `pnpm test -- --runInBand` 仍出现 Vue 警告（withDirectives 只能用于 render、ref owner context 缺失、resolveComponent 需在 render/setup 调用），影响测试输出的可读性。

## 变更内容
1. 消除 table 渲染用例中的 withDirectives/ref 警告。
2. 消除 form 渲染边缘用例中的 resolveComponent 警告。
3. 回归测试确认测试输出零警告。

## 影响范围
- **模块:** table、form
- **文件:** `src/components/table/__tests__/render.test.tsx`、`src/components/form/__tests__/render.test.tsx`、关联渲染辅助
- **API:** 无
- **数据:** 无

## 核心场景

### 需求: 清理残留测试警告
**模块:** table/form
在运行 `pnpm test -- --runInBand` 时，日志不出现 Vue warn。  
- 预期结果: 控制台无 Vue warn/stderr 输出。

## 风险评估
- **风险:** 调整测试渲染逻辑可能偏离真实组件行为。
- **缓解:** 仅修正警告源头，保持断言与现有逻辑不变；必要时用安全包装组件避免破坏行为。