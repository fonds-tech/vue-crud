import type { Ref } from "vue"
import type { SearchLifecycleParams } from "../interface"
import { onMounted, onBeforeUnmount, getCurrentInstance } from "vue"

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
  const instance = getCurrentInstance()

  const register = () => {
    registerEvents(params)
    if (typeof window !== "undefined") {
      window.addEventListener("resize", resizeHandler)
    }
  }

  const unregister = () => {
    unregisterEvents(params)
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", resizeHandler)
    }
  }

  if (!instance) {
    register()
    return unregister
  }

  onMounted(register)
  onBeforeUnmount(unregister)
}
