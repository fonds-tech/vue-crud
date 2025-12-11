# 任务清单: 覆盖率 100% 补测

目录: `helloagents/plan/202512112134_coverage-100/`

---

## 1. 覆盖率分析基线
- [ ] 1.1 记录现有覆盖率缺口（已完成清单作为参考）

## 2. 组件补测（优先）
- [ ] 2.1 search 组件补测（search.tsx、core/lifecycle.ts、core/index.ts、render/action/index/slots）
- [ ] 2.2 table 组件补测（core/index/methods/settings/state、render/table/settings/actions/columns/pagination/toolbar）
- [ ] 2.3 upsert/form/layout 补测（core/actions/form/state、render/actions/layout/item/slots）
- [ ] 2.4 context-menu/grid/cascader/dialog 等零散分支补测

## 3. hooks 补测
- [ ] 3.1 useCrud/useDetail/useForm/useSearch/useTable/useUpsert/useBrowser/useParent 边界输入分支补测

## 4. utils 补测
- [ ] 4.1 utils/component.ts 罕见分支补测
- [ ] 4.2 utils/dataset.ts 边界值补测

## 5. 覆盖率复核
- [ ] 5.1 运行 `pnpm test -- --coverage` 验证 100% 覆盖率

## 6. 文档与变更记录
- [ ] 6.1 同步知识库/CHANGELOG 如有代码调整
