# 变更提案: vitest 警告清理

## 需求背景
在执行 `pnpm test` 时出现大量 Vue 运行期警告（属性透传、生命周期钩子滥用、无效 prop 类型、模板编译错误等），影响测试可读性并掩盖真实问题，需要清理。

## 变更内容
1. 为 Element Plus 相关 stub 补充必要的 `inheritAttrs`/`props`/`emits` 以消除 extraneous attrs 与未声明事件警告。
2. 修正单测用例中不合法的模板/props 传递（如错误的 `api` 类型、无效 slot 闭合标签）。
3. 在使用 `useId`/生命周期钩子的测试辅助场景，确保在组件实例上下文中调用或提供安全降级。
4. 重新运行 Vitest 确认警告清零。

## 影响范围
- **模块:** form、table、search、select、hooks
- **文件:** 相关测试文件与测试 stub
- **API:** 无新增/变更 API
- **数据:** 无

## 核心场景

### 需求: 清理测试警告
**模块:** form/table/search/select/hooks  
在运行 `pnpm test` 时产生 Vue 警告。  
- 期望结果: 测试输出不再包含 Vue warn。

## 风险评估
- **风险:** 调整 stub 或测试逻辑可能与真实组件行为偏差。  
- **缓解:** 仅针对警告原因做最小改动，保持断言不变；必要时补充断言验证行为一致。
