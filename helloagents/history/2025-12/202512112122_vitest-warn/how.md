# 技术设计: Vitest 警告再清理

## 技术方案
### 核心技术
- Vue 3 + JSX 渲染测试、Vitest + happy-dom

### 实现要点
- table 渲染测试：确保 withDirectives/ElLoading 指令封装在组件 render 内，避免将带指令 VNode 作为 hoisted 节点；为 ref 提供组件上下文包装。
- form 渲染测试：在 renderItemSlots 边缘用例中避免直接在测试上下文调用 resolveComponent，改用包装组件或动态组件占位以保持渲染上下文合法。
- 如需 mock/stub，维持现有入参记录方式，减少行为偏移。

## 安全与性能
- 安全：仅调整测试与渲染辅助，不触及生产 API。
- 性能：无运行期性能影响。

## 测试与部署
- 测试：`pnpm test -- --runInBand`，确认无 Vue warn/stderr。
- 部署：无发布动作，仅测试基线修复。