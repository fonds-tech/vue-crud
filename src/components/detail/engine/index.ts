/**
 * Detail Engine 统一入口
 * @description 整合状态管理、服务层、辅助函数等核心功能
 */

// 辅助函数
export * from "./helpers"

// 服务层
export { createDetailService } from "./service"

// 状态管理
export { createDetailState } from "./state"
export type { DetailState } from "./state"
