# 变更提案: 覆盖率提升

## 需求背景
当前单测覆盖率高但部分组件/钩子分支覆盖不足，需补充边界测试以提升分支可靠性并避免回归。

## 变更内容
1. 为 table 组件核心与渲染层补充分支与异常路径测试（列设置、工具栏、尺寸调整等）。
2. 为 search 组件生命周期与动作渲染补测边界。
3. 为 grid 栅格、context-menu、delete-button 补测未覆盖分支。
4. 为 hooks 与 utils/component 补测分支与异常路径。

## 影响范围
- **模块:** table、search、grid、context-menu、delete-button、hooks、utils
- **文件:** 对应测试文件及必要的测试辅助
- **API:** 无 HTTP API 变更
- **数据:** 无持久化数据变更

## 核心场景

### 需求: 覆盖率提升
**模块:** table
补测列设置与渲染边界。

#### 场景: 列设置与渲染透传
- 非 props 属性透传过滤
- 设置弹窗属性/事件透传
- 工具栏隐藏/显示分支

### 需求: 覆盖率提升
**模块:** search
补测生命周期与动作渲染。

#### 场景: 生命周期与动作
- onMounted/onBeforeUnmount 调用
- 动作禁用/隐藏/回调异常

### 需求: 覆盖率提升
**模块:** grid、context-menu、delete-button、hooks、utils
补测栅格尺寸、菜单透传、删除按钮分支、钩子与组件工具分支。

#### 场景: 边界与异常
- 栅格 gutter/cols 边界
- 菜单非 props attrs 过滤
- delete-button 权限/文本分支
- hooks 分支（crud/search/table 等）
- utils/component 分支行为

## 风险评估
- **风险:** 新增用例可能依赖 DOM 或异步行为导致不稳定
- **缓解:** 使用 happy-dom + mock 定位；避免真实定时器；必要时使用 fake timers 与稳定选择器
