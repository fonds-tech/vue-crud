import type { Ref } from "vue"
import type { ContextMenuItem, ContextMenuOptions } from "../types"
import { nextTick } from "vue"
import { cloneDeep } from "lodash-es"

/**
 * 内部使用的菜单项状态接口
 * 扩展了 ContextMenuItem，添加了内部状态字段
 */
export interface InternalMenuItem extends ContextMenuItem {
  /**
   * 内部状态：是否显示子菜单
   * 仅用于内部管理，不暴露给外部
   */
  _showChildren?: boolean

  /**
   * 子菜单列表（递归类型）
   */
  children?: InternalMenuItem[]
}

/**
 * 规范化菜单项列表，确保每个项都有正确的内部状态
 * @param list - 原始菜单项列表
 * @returns 规范化后的内部菜单项列表
 */
export function normalizeList(list?: ContextMenuItem[]): InternalMenuItem[] {
  if (!list || list.length === 0) return []

  const data = cloneDeep(list) as InternalMenuItem[]

  const traverse = (items: InternalMenuItem[]): void => {
    for (const item of items) {
      item._showChildren = false
      if (item.children && item.children.length > 0) {
        traverse(item.children)
      }
    }
  }

  traverse(data)
  return data
}

/**
 * 移除目标元素的悬浮高亮
 * @param hoverTarget - 高亮目标元素的 ref 对象
 * @param hoverClassName - 高亮类名的 ref 对象
 */
export function removeHoverHighlight(
  hoverTarget: Ref<HTMLElement | null>,
  hoverClassName: Ref<string>,
): void {
  if (hoverTarget.value) {
    hoverTarget.value.classList?.remove(hoverClassName.value)
    hoverTarget.value = null
  }
}

/**
 * 标记触发菜单的目标元素，添加高亮样式
 * @param event - 鼠标事件
 * @param hoverOptions - 悬浮配置选项
 * @param hoverTarget - 高亮目标元素的 ref 对象
 * @param hoverClassName - 高亮类名的 ref 对象
 */
export function markTarget(
  event: MouseEvent,
  hoverOptions: ContextMenuOptions["hover"] | undefined,
  hoverTarget: Ref<HTMLElement | null>,
  hoverClassName: Ref<string>,
): void {
  removeHoverHighlight(hoverTarget, hoverClassName)
  if (!hoverOptions) return

  const config = hoverOptions === true ? {} : hoverOptions
  const className = config.className ?? "fd-context-menu__target"
  hoverClassName.value = className

  let target = event.target as HTMLElement | null

  // 使用 classList.contains 替代 className.includes，兼容 SVG 元素
  if (config.target) {
    while (target && !target.classList?.contains(config.target)) {
      target = target.parentElement
    }
  }

  if (target) {
    target.classList?.add(className)
    hoverTarget.value = target
  }
}

/**
 * 菜单定位样式接口
 */
interface MenuPositionStyle {
  top: string
  left: string
}

/**
 * 计算并设置菜单的显示位置，确保不超出可视区域
 * @param event - 鼠标事件，用于获取点击坐标
 * @param menuElement - 菜单 DOM 元素
 * @param style - 样式对象引用，用于更新 top/left
 */
export async function positionMenu(
  event: MouseEvent,
  menuElement: HTMLElement | null | undefined,
  style: MenuPositionStyle,
): Promise<void> {
  await nextTick()
  if (!menuElement) return

  const targetElement = event.target as HTMLElement | null
  const doc = targetElement?.ownerDocument ?? document
  const html = doc.documentElement
  const maxHeight = html.clientHeight
  const maxWidth = html.clientWidth

  let left = event.clientX
  let top = event.clientY

  const { clientHeight, clientWidth } = menuElement

  if (top + clientHeight > maxHeight) {
    top = Math.max(5, maxHeight - clientHeight - 5)
  }
  if (left + clientWidth > maxWidth) {
    left = Math.max(5, maxWidth - clientWidth - 5)
  }

  style.top = `${top}px`
  style.left = `${left}px`
}

/**
 * 注册点击外部关闭菜单的事件监听
 * @param doc - Document 对象
 * @param menuElement - 菜单 DOM 元素
 * @param close - 关闭回调函数
 * @param cleanupFns - 清理函数数组
 */
export function registerOutsideClose(
  doc: Document,
  menuElement: HTMLElement | null | undefined,
  close: () => void,
  cleanupFns: Array<() => void>,
): void {
  const handler = (event: MouseEvent): void => {
    const target = event.target as Node | null
    if (!menuElement || menuElement === target || menuElement.contains(target)) return
    close()
  }
  doc.addEventListener("mousedown", handler)
  cleanupFns.push(() => doc.removeEventListener("mousedown", handler))
}

/**
 * 注册 ESC 键关闭菜单的事件监听
 * @param doc - Document 对象
 * @param close - 关闭回调函数
 * @param cleanupFns - 清理函数数组
 */
export function registerEscapeClose(
  doc: Document,
  close: () => void,
  cleanupFns: Array<() => void>,
): void {
  const handler = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      close()
    }
  }
  doc.addEventListener("keydown", handler)
  cleanupFns.push(() => doc.removeEventListener("keydown", handler))
}
