import type { InternalMenuItem } from "./helpers"
import type { ContextMenuControl, ContextMenuOptions } from "../types"
import { useRefs } from "@/hooks"
import { ref, watch, nextTick, reactive, onBeforeUnmount } from "vue"
import { markTarget, positionMenu, normalizeList, registerEscapeClose, registerOutsideClose, removeHoverHighlight } from "./helpers"

/**
 * 菜单位置样式接口
 */
interface MenuPositionStyle {
  top: string
  left: string
}

/**
 * Context Menu 核心 Props 接口
 */
interface ContextMenuCoreProps {
  /** 控制菜单显示状态 */
  show: boolean
  /** 触发菜单的鼠标事件 */
  event?: MouseEvent
  /** 菜单配置选项 */
  options?: ContextMenuOptions
}

/**
 * Context Menu 核心逻辑组合式函数
 * 管理菜单的状态、事件处理、定位和生命周期
 *
 * @param props - 组件的 props
 * @returns 包含组件状态和方法的对象
 */
export function useContextMenuCore(props: ContextMenuCoreProps) {
  const { refs, setRefs } = useRefs<HTMLDivElement>()
  const list = ref<InternalMenuItem[]>(normalizeList(props.options?.list))
  const ids = ref<Set<string>>(new Set())
  const style = reactive<MenuPositionStyle>({ top: "0px", left: "0px" })
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
  function cleanup(): void {
    cleanupFns.splice(0).forEach(fn => fn())
  }

  /**
   * 移除高亮样式
   */
  function removeHighlight(): void {
    removeHoverHighlight(hoverTarget, hoverClassName)
  }

  /**
   * 打开菜单
   * @param event - 触发事件
   * @param options - 配置选项
   * @returns 菜单控制对象
   */
  function open(event: MouseEvent, options: ContextMenuOptions = {}): ContextMenuControl {
    if (!event) return { close }

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

    if (options.list && options.list.length > 0) {
      list.value = normalizeList(options.list)
    }

    const targetElement = event.target as HTMLElement | null
    const doc = options.document ?? targetElement?.ownerDocument ?? document

    nextTick(() => {
      if (!visible.value) return

      const menuElement = refs["fd-context-menu"]

      cleanup()
      registerOutsideClose(doc, menuElement, close, cleanupFns)
      registerEscapeClose(doc, close, cleanupFns)
      markTarget(event, options.hover ?? props.options?.hover, hoverTarget, hoverClassName)
      positionMenu(event, menuElement, style)
    })

    return { close }
  }

  /**
   * 关闭菜单
   * @param immediate - 是否立即关闭（无动画）
   */
  function close(immediate = false): void {
    removeHighlight()
    cleanup()
    if (!visible.value) return

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
   * 切换菜单项的子菜单展开状态
   * @param item - 菜单项
   */
  function toggleShowChildren(item: InternalMenuItem): void {
    item._showChildren = !item._showChildren
  }

  /**
   * 处理菜单项点击
   * @param item - 菜单项数据
   * @param id - 菜单项唯一标识
   */
  function handleItemClick(item: InternalMenuItem, id: string): void {
    ids.value = new Set([id])

    // 禁用项或分隔线不响应点击
    if (item.disabled || item.type === "divider") return

    // 执行点击回调
    if (item.onClick) {
      item.onClick()
    }

    // 有子菜单时切换展开状态
    if (item.children && item.children.length > 0) {
      toggleShowChildren(item)
      return
    }

    // 默认自动关闭，除非设置了 keepOpen
    if (!item.keepOpen) {
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
      if (cls) extraClass.value = cls
    },
  )

  // 监听 props.show 变化
  watch(
    () => props.show,
    (show) => {
      if (show && props.event) {
        open(props.event, props.options)
      }
      if (!show) {
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
    removeHighlight()
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
    /** 处理菜单项点击 */
    handleItemClick,
  }
}
