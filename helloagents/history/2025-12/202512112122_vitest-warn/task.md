# 任务清单: Vitest 警告再清理

目录: `helloagents/plan/202512112122_vitest-warn/`

---

## 1. table 警告清理
- [√] 1.1 调整 `src/components/table/__tests__/render.test.tsx` 使 withDirectives/ref 渲染发生在组件上下文，消除 Vue warn，验证 why.md#需求-清理残留测试警告

## 2. form 警告清理
- [√] 2.1 调整 `src/components/form/__tests__/render.test.tsx` 边缘用例，避免直接调用 resolveComponent 引发警告，验证 why.md#需求-清理残留测试警告

## 3. 文档与记录
- [√] 3.1 更新 `helloagents/CHANGELOG.md`/相关知识库条目（如需），记录本次测试警告清理

## 4. 测试
- [√] 4.1 执行 `pnpm test -- --runInBand`，确认无 Vue warn/stderr 输出，验证 why.md#需求-清理残留测试警告
