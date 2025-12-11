# 项目技术约定

---

## 技术栈
- **核心:** TypeScript (严格模式) / Vue 3 + Element Plus / Vite / Vitest / pnpm

---

## 开发约定
- **代码规范:** 遵循现有 eslint/prettier 配置，保持组合式 API 与 JSX 测试一致性
- **命名约定:** 组件与钩子保持小写短横线文件名，导出的标识符遵循驼峰/大写常量
- **测试:** 使用 Vitest + happy-dom，优先补充分支与边界用例

---

## 错误与日志
- **策略:** 组件内部统一抛出用户友好警告，测试通过 stub 验证
- **日志:** 避免在组件中遗留调试输出

---

## 测试与流程
- **测试:** `pnpm test` 运行全量单测并输出覆盖率
- **Stub 约定:** 测试用 Element Plus stub 应提供根元素并声明常用 props/emit，避免 extraneous attrs/未声明事件警告；调用生命周期相关 Composable 时若无组件实例需添加安全降级
- **提交:** 遵循 Conventional Commits，确保同时更新知识库
