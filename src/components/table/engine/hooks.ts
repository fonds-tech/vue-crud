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
 * 存储已绑定的事件处理器引用，用于正确注销
 */
interface BoundHandlers {
  refresh: (payload: unknown) => void
  select: (...args: unknown[]) => void
  selectAll: (...args: unknown[]) => void
  clearSelection: () => void
  toggleFullscreen: (...args: unknown[]) => void
}

/**
 * 使用 WeakMap 存储组件实例与其绑定处理器的映射，避免闭包导致的内存泄漏
 */
const handlerRegistry = new WeakMap<HookHandlers, BoundHandlers>()

/**
 * 注册表格的事件监听器
 *
 * @param mitt - 事件发射器实例
 * @param handlers - 事件的处理程序
 */
export function registerEvents(mitt: MittLike | undefined, handlers: HookHandlers) {
  // 事件监听统一入口，确保 mitt 不存在时静默跳过，避免调用方未注入事件总线导致报错
  if (!mitt?.on) return

  // 创建绑定的处理器并缓存，确保注销时使用相同的引用
  const boundHandlers: BoundHandlers = {
    refresh: (payload: unknown) => handlers.refresh(payload),
    select: (...args: unknown[]) => {
      // select 事件可接受 payload/checked 任意数量，需解析布尔后交给处理器
      const [payload, checked] = args
      handlers.select(normalizeRowKey(payload), typeof checked === "boolean" ? checked : undefined)
    },
    selectAll: (...args: unknown[]) => {
      const [checked] = args
      handlers.selectAll(typeof checked === "boolean" ? checked : undefined)
    },
    clearSelection: () => handlers.clearSelection(),
    toggleFullscreen: (...args: unknown[]) => {
      const [full] = args
      handlers.toggleFullscreen(typeof full === "boolean" ? full : undefined)
    },
  }

  // 存储到注册表以便后续注销时获取相同引用
  handlerRegistry.set(handlers, boundHandlers)

  mitt.on("table.refresh", boundHandlers.refresh)
  mitt.on("table.select", boundHandlers.select)
  mitt.on("table.selectAll", boundHandlers.selectAll)
  mitt.on("table.clearSelection", boundHandlers.clearSelection)
  mitt.on("table.toggleFullscreen", boundHandlers.toggleFullscreen)

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
  if (!mitt?.off) {
    // 即使 mitt 不存在也要移除 document 监听器
    document.removeEventListener("click", handlers.closeContextMenu)
    return
  }

  // 从注册表获取绑定的处理器引用，确保正确移除
  const boundHandlers = handlerRegistry.get(handlers)
  if (boundHandlers) {
    mitt.off("table.refresh", boundHandlers.refresh)
    mitt.off("table.select", boundHandlers.select)
    mitt.off("table.selectAll", boundHandlers.selectAll)
    mitt.off("table.clearSelection", boundHandlers.clearSelection)
    mitt.off("table.toggleFullscreen", boundHandlers.toggleFullscreen)
    // 清理注册表
    handlerRegistry.delete(handlers)
  }

  document.removeEventListener("click", handlers.closeContextMenu)
}
