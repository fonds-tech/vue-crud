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
 * 管理菜单的状态、事件处理、定位和生命周期
 *
 * @param props 组件的 props
 * @param props.show 控制菜单显示状态
 * @param props.event 触发菜单的鼠标事件
 * @param props.options 菜单配置选项
 * @returns 包含组件状态和方法的对象
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

  /**
   * 执行所有清理函数
   */
  function cleanup() {
    cleanupFns.splice(0).forEach(fn => fn())
  }

  /**
   * 移除高亮样式
   */
  function _removeHoverHighlight() {
    removeHoverHighlight(hoverTarget, hoverClassName)
  }

  /**
   * 打开菜单
   * @param event 触发事件
   * @param options 配置选项
   */
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

  /**
   * 关闭菜单
   * @param immediate 是否立即关闭（无动画）
   */
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

  /**
   * 切换菜单项的展开/收起状态，或执行点击回调
   * @param item 菜单项数据
   * @param id 菜单项唯一标识
   */
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
    /** 元素引用集合 */
    refs,
    /** 设置元素引用的方法 */
    setRefs,
    /** 菜单项列表 */
    list,
    /** 当前激活的菜单项 ID 集合 */
    ids,
    /** 菜单容器样式（位置） */
    style,
    /** 菜单是否可见 */
    visible,
    /** 动画类名 */
    animationClass,
    /** 额外类名 */
    extraClass,
    /** 打开菜单方法 */
    open,
    /** 关闭菜单方法 */
    close,
    /** 切换菜单项方法 */
    toggleItem,
  }
}
