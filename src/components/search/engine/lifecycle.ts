import type { Ref } from "vue"
import { onMounted, onBeforeUnmount } from "vue"

/**
 * 搜索组件生命周期管理参数
 */
export interface SearchLifecycleParams {
  /** 视口宽度 */
  viewportWidth: Ref<number>
  /** 搜索处理器 */
  searchHandler: (params?: any) => void
  /** 重置处理器 */
  resetHandler: (params?: any) => void
  /** 获取模型处理器 */
  getModelHandler: (callback?: any) => void
  /** 事件总线 */
  mitt: {
    on: (event: string, handler: (...args: any[]) => void) => void
    off: (event: string, handler: (...args: any[]) => void) => void
    emit: (event: string, ...args: any[]) => void
  }
}

/**
 * 注册事件监听
 */
export function registerEvents(params: SearchLifecycleParams) {
  const { mitt, searchHandler, resetHandler, getModelHandler } = params
  mitt.on("search.search", searchHandler)
  mitt.on("search.reset", resetHandler)
  mitt.on("search.get.model", getModelHandler)
}

/**
 * 注销事件监听
 */
export function unregisterEvents(params: SearchLifecycleParams) {
  const { mitt, searchHandler, resetHandler, getModelHandler } = params
  mitt.off("search.search", searchHandler)
  mitt.off("search.reset", resetHandler)
  mitt.off("search.get.model", getModelHandler)
}

/**
 * 处理窗口尺寸变化
 */
export function handleResize(viewportWidth: Ref<number>) {
  if (typeof window === "undefined") return
  viewportWidth.value = window.innerWidth
}

/**
 * 搜索组件生命周期 Composable
 */
export function useSearchLifecycle(params: SearchLifecycleParams) {
  const { viewportWidth } = params

  const resizeHandler = () => handleResize(viewportWidth)

  onMounted(() => {
    registerEvents(params)
    if (typeof window !== "undefined") {
      window.addEventListener("resize", resizeHandler)
    }
  })

  onBeforeUnmount(() => {
    unregisterEvents(params)
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", resizeHandler)
    }
  })
}
