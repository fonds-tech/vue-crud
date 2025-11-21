import { reactive, onMounted, onBeforeUnmount } from "vue"

interface BrowserState {
  width: number
  height: number
  isMini: boolean
}

const defaultWidth = typeof window !== "undefined" ? window.innerWidth : 1920
const defaultHeight = typeof window !== "undefined" ? window.innerHeight : 1080

/**
 * 监听窗口尺寸的简单浏览器信息 Hook。
 */
export function useBrowser(): BrowserState {
  const state = reactive<BrowserState>({
    width: defaultWidth,
    height: defaultHeight,
    isMini: defaultWidth <= 768,
  })

  const update = () => {
    if (typeof window === "undefined") {
      return
    }

    state.width = window.innerWidth
    state.height = window.innerHeight
    state.isMini = state.width <= 768
  }

  onMounted(() => {
    update()
    window.addEventListener("resize", update)
  })

  onBeforeUnmount(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", update)
    }
  })

  return state
}
