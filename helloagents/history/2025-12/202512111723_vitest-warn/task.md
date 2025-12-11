# 任务清单: vitest 警告清理

目录: `helloagents/plan/202512111723_vitest-warn/`

---

## 1. Stub 警告治理
- [√] 1.1 调整表格/弹出相关测试 stub，声明 props/emit 并禁用自动继承 attrs，消除 extraneous attrs 警告，验证 why.md#需求-清理测试警告

## 2. 生命周期与辅助函数
- [√] 2.1 为触发 `useId`、`onMounted` 等的测试场景增加组件上下文或安全降级，消除无实例警告，验证 why.md#需求-清理测试警告

## 3. 非法 props/模板修复
- [√] 3.1 修正 select 非函数 api 触发的类型警告（用合法占位或调整用例），验证 why.md#需求-清理测试警告
- [√] 3.2 修正 search 渲染用例中的无效 slot 闭合标签，验证 why.md#需求-清理测试警告

## 4. 文档与变更记录
- [√] 4.1 更新 `helloagents/CHANGELOG.md`，记录测试警告清理
- [√] 4.2 更新相关知识库条目（如涉及模块规范/测试约定），保持 SSOT

## 5. 测试
- [√] 5.1 运行 `pnpm test -- --runInBand`，确认输出无 Vue warn，验证 why.md#需求-清理测试警告
