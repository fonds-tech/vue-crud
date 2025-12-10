import type { ContextMenuItem, ContextMenuOptions } from "../types"
import { useRefs } from "@/hooks"
import { ref, watch, reactive, onBeforeUnmount } from "vue"
import {
  markTarget,
  positionMenu,
  normalizeList,
  registerOutsideClose,
  removeHoverHighlight,
} from "./helpers"

/**
 * Context Menu 核心逻辑组合式函数
 */
export function useContextMenuCore(props: {
  show: boolean
  event?: MouseEvent
  options?: ContextMenuOptions
}) {
  const { refs, setRefs } = useRefs<HTMLDivElement>()
  const list = ref<ContextMenuItem[]>(normalizeList(props.options?.list))
  const ids = ref<Set<string>>(new Set())
  const style = reactive({ top: "0px", left: "0px" })
  const visible = ref(false)
  const animationClass = ref("is-enter")
  const extraClass = ref<string | undefined>(props.options?.class)
  const hoverTarget = ref<HTMLElement | null>(null)
  const hoverClassName = ref("fd-context-menu__target")
  const cleanupFns: Array<() => void> = []

  // 定时器引用，用于清理
  let closeTimer: ReturnType<typeof setTimeout> | null = null

  function cleanup() {
    cleanupFns.splice(0).forEach(fn => fn())
  }

  function _removeHoverHighlight() {
    removeHoverHighlight(hoverTarget, hoverClassName)
  }

  function open(event: MouseEvent, options: ContextMenuOptions = {}) {
    if (!event)
      return { close }

    event.preventDefault?.()
    event.stopPropagation?.()

    // 清理之前的定时器
    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = null
    }

    animationClass.value = "is-enter"
    extraClass.value = options.class ?? props.options?.class
    visible.value = true
    ids.value = new Set()

    if (options.list?.length) {
      list.value = normalizeList(options.list)
    }

    const doc = options.document ?? (event.target as HTMLElement | null)?.ownerDocument ?? document
    const menuElement = refs["fd-context-menu"]

    cleanup()
    registerOutsideClose(doc, menuElement, close, cleanupFns)
    markTarget(event, options.hover ?? props.options?.hover, hoverTarget, hoverClassName)
    positionMenu(event, menuElement, style)

    return { close }
  }

  function close(immediate = false) {
    _removeHoverHighlight()
    cleanup()
    if (!visible.value)
      return

    // 清理之前的定时器
    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = null
    }

    animationClass.value = "is-leave"
    const delay = immediate ? 0 : 180
    closeTimer = setTimeout(() => {
      visible.value = false
      closeTimer = null
    }, delay)
  }

  function toggleItem(item: ContextMenuItem, id: string) {
    ids.value = new Set([id])
    if (item.disabled)
      return

    if (item.callback) {
      item.callback(() => close())
      return
    }

    if (item.children?.length) {
      item.showChildren = !item.showChildren
    }
    else {
      close()
    }
  }

  // 监听 props.options.list 变化
  watch(
    () => props.options?.list,
    (next) => {
      list.value = normalizeList(next)
    },
    { deep: true },
  )

  // 监听 props.options.class 变化
  watch(
    () => props.options?.class,
    (cls) => {
      if (cls)
        extraClass.value = cls
    },
  )

  // 监听 props.show 变化
  watch(
    () => props.show,
    (show) => {
      if (show && props.event) {
        open(props.event, props.options)
      }
      else if (!show) {
        close(true)
      }
    },
    { immediate: true },
  )

  // 组件卸载时清理
  onBeforeUnmount(() => {
    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = null
    }
    cleanup()
    _removeHoverHighlight()
  })

  return {
    // 引用
    refs,
    setRefs,
    // 状态
    list,
    ids,
    style,
    visible,
    animationClass,
    extraClass,
    // 方法
    open,
    close,
    toggleItem,
  }
}
