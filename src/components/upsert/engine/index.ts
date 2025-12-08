/**
 * Upsert Engine 统一入口
 * @description 整合状态管理、服务层、表单构建、按钮逻辑等核心功能
 */

// 按钮逻辑
export { useUpsertActions } from "./actions"
// 表单构建
export { createFormBuilder } from "./form"

export type { FormBuilderContext } from "./form"

// 组件辅助
export { useComponentHelper } from "./helpers"

// 服务层
export { createUpsertService } from "./service"
// 状态管理
export { createUpsertState } from "./state"

export type { UpsertState } from "./state"
