# 任务清单: 覆盖率提升

目录: `helloagents/plan/202512111646_coverage/`

---

## 1. table 覆盖率
- [ ] 1.1 在 `src/components/table/core/index.ts`、`src/components/table/render/*.tsx` 中补充分支测试，验证 why.md#场景-列设置与渲染透传
- [ ] 1.2 在 `src/components/table/core/methods.ts` 与 `src/components/table/core/settings.ts` 中补测未覆盖分支，验证 why.md#场景-列设置与渲染透传

## 2. search 覆盖率
- [ ] 2.1 在 `src/components/search/core/lifecycle.ts` 与 `src/components/search/core/index.ts` 补测生命周期分支，验证 why.md#场景-生命周期与动作
- [ ] 2.2 在 `src/components/search/render/action.tsx` 与 `src/components/search/search.tsx` 补测动作渲染与禁用分支，验证 why.md#场景-生命周期与动作

## 3. 其他组件分支
- [ ] 3.1 在 `src/components/grid/grid.tsx` 补测尺寸/间距边界，验证 why.md#场景-边界与异常
- [ ] 3.2 在 `src/components/context-menu/context-menu.tsx` 与 `src/components/context-menu/render/menu.tsx` 补测透传/事件分支，验证 why.md#场景-边界与异常
- [ ] 3.3 在 `src/components/delete-button/delete-button.tsx` 补测权限/文本分支，验证 why.md#场景-边界与异常

## 4. hooks 分支
- [ ] 4.1 在 `src/hooks/useCrud.ts`、`useSearch.ts`、`useTable.ts`、`useForm.ts`、`useUpsert.ts`、`useBrowser.ts`、`useParent.ts`、`useDetail.ts` 补测未覆盖分支，验证 why.md#场景-边界与异常

## 5. utils 分支
- [ ] 5.1 在 `src/utils/component.ts` 补测分支，验证 why.md#场景-边界与异常

## 6. 文档与测试
- [ ] 6.1 更新知识库覆盖率记录与历史索引
- [ ] 6.2 运行 `pnpm test` 确认通过并记录覆盖率结果
