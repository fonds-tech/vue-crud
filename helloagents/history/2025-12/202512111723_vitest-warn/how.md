# 技术设计: vitest 警告清理

## 技术方案
### 核心技术
- Vue 3 + Vitest + happy-dom 测试环境

### 实现要点
- 表格/弹出类 stub：显式 `inheritAttrs: false`、声明 props 与 emits，避免多余属性和事件透传警告。
- 生命周期/ID 警告：确保调用 `useId`、`onMounted`、`onBeforeUnmount` 发生在组件上下文，必要时通过伪组件包装。
- 非法 props 用例：修正测试传参或在组件内部增加防御式分支以避免类型告警。
- 模板编译错误：修正无效 slot 闭合标签的测试 stub。

## 安全与性能
- 安全：仅调整测试与 stub，不改动生产逻辑；无外部依赖变更。
- 性能：无运行期性能影响。

## 测试与部署
- 测试：`pnpm test -- --runInBand`，确认无 Vue warn 输出。
- 部署：无构建/发布动作，仅测试基线清理。
