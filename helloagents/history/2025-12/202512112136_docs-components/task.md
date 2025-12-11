# 任务清单: 组件文档全面补齐

目录: `helloagents/plan/202512112136_docs-components/`

---

## 1. 组件清单与基线
- [√] 1.1 列出 `src/components` 全量组件并与 `docs/components` 现有文件对齐，形成待补充名单

## 2. props/事件/slots 梳理
- [√] 2.1 `fd-crud`/核心容器类：提取 props/事件/slots，更新/确认 `docs/components/crud.md`
- [√] 2.2 搜索与表单：`fd-search`、`fd-form`、`fd-grid`、`fd-grid-item`，补齐/确认 API 与示例
- [√] 2.3 表格与操作：`fd-table`、`fd-context-menu`、`fd-select`，补齐/确认 API 与示例
- [√] 2.4 详情与弹窗：`fd-detail`、`fd-dialog`、`fd-upsert`，补齐/确认 API 与示例
- [√] 2.5 按钮与导入导出：`fd-add-button`、`fd-delete-button`、`fd-import`、`fd-export`，补齐 API 与示例
- [√] 2.6 其他输入组件：`fd-cascader`、`fd-option`（如存在）、补齐/确认 API 与示例

## 3. 示例与注意事项
- [√] 3.1 为每个组件添加最小示例片段，标注必要上下文或依赖
- [√] 3.2 在文档中增加注意事项（如依赖 `fd-crud` 上下文、权限/字典要求、异步调用限制）

## 4. 文档一致性与发布
- [√] 4.1 自查文档与源码一致性（类型、默认值、事件名），确保无遗漏组件
- [√] 4.2 更新知识库（helloagents/wiki/CHANGELOG）中相关索引/说明（如需），保持 SSOT

## 5. 测试
- [ ] 5.1 手动阅读检查：运行 `pnpm docs:dev`（如需要）目测文档渲染，确保示例片段无语法错误
