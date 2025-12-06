/**
 * 类似 Mitt 事件发射器库的接口
 */
export interface MittLike {
  /** 注册事件处理程序 */
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  /** 注销事件处理程序 */
  off?: (event: string, handler?: (...args: unknown[]) => void) => void
  /** 发射事件 */
  emit?: (event: string, payload?: unknown) => void
}

/**
 * 定义表格钩子处理程序的接口
 */
export interface HookHandlers {
  /** 刷新表格的处理程序 */
  refresh: (payload?: unknown) => void
  /** 选择一行或多行的处理程序 */
  select: (rowKey?: string | number | Array<string | number>, checked?: boolean) => void
  /** 选择所有行的处理程序 */
  selectAll: (checked?: boolean) => void
  /** 清除选择的处理程序 */
  clearSelection: () => void
  /** 切换全屏模式的处理程序 */
  toggleFullscreen: (full?: boolean) => void
  /** 关闭上下文菜单的处理程序 */
  closeContextMenu: () => void
}

/**
 * 将有效载荷规范化为有效的行键或键数组
 *
 * @param payload - 要规范化的有效载荷
 * @returns 规范化后的行键
 */
function normalizeRowKey(payload: unknown): string | number | Array<string | number> | undefined {
  // 支持传入单个主键或主键数组，其他类型一律视为无效并返回 undefined
  if (Array.isArray(payload) && payload.every(item => typeof item === "string" || typeof item === "number")) {
    return payload as Array<string | number>
  }
  if (typeof payload === "string" || typeof payload === "number") return payload
  return undefined
}

/**
 * 注册表格的事件监听器
 *
 * @param mitt - 事件发射器实例
 * @param handlers - 事件的处理程序
 */
export function registerEvents(mitt: MittLike | undefined, handlers: HookHandlers) {
  // 事件监听统一入口，确保 mitt 不存在时静默跳过，避免调用方未注入事件总线导致报错
  mitt?.on?.("table.refresh", (payload: unknown) => handlers.refresh(payload))
  mitt?.on?.("table.select", (...args: unknown[]) => {
    // select 事件可接受 payload/checked 任意数量，需解析布尔后交给处理器
    const [payload, checked] = args
    handlers.select(normalizeRowKey(payload), typeof checked === "boolean" ? checked : undefined)
  })
  mitt?.on?.("table.selectAll", (...args: unknown[]) => {
    const [checked] = args
    handlers.selectAll(typeof checked === "boolean" ? checked : undefined)
  })
  mitt?.on?.("table.clearSelection", () => handlers.clearSelection())
  mitt?.on?.("table.toggleFullscreen", (...args: unknown[]) => {
    const [full] = args
    handlers.toggleFullscreen(typeof full === "boolean" ? full : undefined)
  })
  // 全局监听 document click 用于关闭自定义上下文菜单
  document.addEventListener("click", handlers.closeContextMenu)
}

/**
 * 注销表格的事件监听器
 *
 * @param mitt - 事件发射器实例
 * @param handlers - 要移除的处理程序
 */
export function unregisterEvents(mitt: MittLike | undefined, handlers: HookHandlers) {
  // 卸载所有表格相关事件与全局点击监听，防止组件销毁后内存泄漏
  mitt?.off?.("table.refresh")
  mitt?.off?.("table.select")
  mitt?.off?.("table.selectAll")
  mitt?.off?.("table.clearSelection")
  mitt?.off?.("table.toggleFullscreen")
  document.removeEventListener("click", handlers.closeContextMenu)
}
