# 技术设计: 测试警告清理

## 技术方案
### 核心技术
- Vue 3 渲染与指令解析：在无实例场景下安全降级。
- Element Plus 组件与图标：确保动态组件解析合法并避免被 reactive 包裹。
- Vitest + VTU：补充针对警告来源的断言，保证静默输出。

### 实现要点
1. 动态组件/指令解析防御：
   - search/detail 渲染路径使用 `getCurrentInstance` 或安全兜底，避免直接调用 `resolveComponent/resolveDirective` 触发警告。
   - 对动态组件配置使用 `markRaw/shallowRef`，避免组件对象被 reactive 包裹。
2. 生命周期与注入：
   - `useBrowser` 在无实例或无 window 时跳过生命周期注册并返回安全值。
   - `useConfig` 提供默认值避免 Vue 注入警告，再抛出自定义错误。
3. 只读计算属性写入：
   - 审核 table 列设置写入路径，避免对 computed 值直接赋值，必要时复制或使用原始数据源。
4. 测试与验证：
   - 针对修复点添加/调整用例，确保警告被消除。
   - 回归 `pnpm test` 确认无警告、无回归。

## 安全与性能
- 安全：仅调整前端渲染与 Hook 防御逻辑，无外部依赖与敏感数据操作。
- 性能：改动均为防御性判断与 markRaw，不影响热路径性能。

## 测试与部署
- 单测：运行 `pnpm test`（可关闭 coverage 加快验证）。
- 部署：前端包无额外部署步骤，修复后按现有流程发布。
