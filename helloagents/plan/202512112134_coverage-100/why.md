# 变更提案: 覆盖率 100% 补测

## 需求背景
当前全局覆盖率约 96.9%（行 98.29%、分支 89.55%）。多个组件、hooks、utils 存在分支/异常路径未测，目标是将所有组件相关代码的覆盖率提升到 100%。

## 变更内容
1. 为 search/table/upsert/form 等组件补充分支与异常路径测试，涵盖 render/lifecycle/options 等。
2. 为 hooks（useCrud/useDetail/useForm/useSearch/useTable/useUpsert/useBrowser/useParent）补齐边界场景测试。
3. 为 utils（component/dataset 等）补测罕见分支和兜底逻辑。
4. 修正可能阻碍覆盖的轻量逻辑问题（如防御分支、默认值）并保持行为不变。

## 影响范围
- **模块:** search、table、upsert、form、context-menu、grid、hooks、utils
- **文件:** 以覆盖率报告未覆盖行/分支为准
- **测试:** Vitest 单测新增/补充

## 核心场景
### 需求: 提升组件与 hooks 覆盖率
**模块:** search/table/upsert/form/hooks/utils
通过新增和完善单测覆盖所有条件/异常分支，确保覆盖率 100%。

#### 场景: 组件分支与异常路径补测
- 条件: 依据 coverage 报告列出的未覆盖行/分支
- 预期结果: 所有组件分支与异常路径均被测试验证

#### 场景: hooks 边界输入补测
- 条件: hooks 在空配置/空上下文/自定义上下文下调用
- 预期结果: hooks 返回值与副作用均符合预期且被覆盖

#### 场景: utils 罕见分支补测
- 条件: utils 的兜底/错误输入分支
- 预期结果: 分支全部被触发并通过断言

## 风险评估
- **风险:** 部分分支难以触达或存在隐含副作用，补测可能需要微调实现
- **缓解:** 以测试驱动补测，必要时做最小化重构并保持对外行为一致，逐步运行覆盖率报告校验
