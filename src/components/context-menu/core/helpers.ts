import type { Ref } from "vue"
import type { ContextMenuItem, ContextMenuOptions } from "../types"
import { nextTick } from "vue"
import { cloneDeep } from "lodash-es"

/**
 * 规范化菜单项列表，确保每个项都有 showChildren 属性
 * @param list 原始菜单项列表
 * @returns 规范化后的菜单项列表
 */
export function normalizeList(list?: ContextMenuItem[]): ContextMenuItem[] {
  const data = cloneDeep(list ?? [])
  const traverse = (items: ContextMenuItem[]) => {
    items.forEach((item) => {
      item.showChildren = false
      if (item.children?.length) {
        traverse(item.children)
      }
    })
  }
  traverse(data)
  return data
}

/**
 * 移除目标元素的悬浮高亮
 * @param hoverTarget 高亮目标元素的 ref 对象
 *
 * @param hoverClassName 高亮类名的 ref 对象
 */
export function removeHoverHighlight(hoverTarget: Ref<HTMLElement | null>, hoverClassName: Ref<string>) {
  if (hoverTarget.value) {
    hoverTarget.value.classList?.remove(hoverClassName.value)
    hoverTarget.value = null
  }
}

/**
 * 标记触发菜单的目标元素，添加高亮样式
 * @param event 鼠标事件
 * @param hoverOptions 悬浮配置选项
 * @param hoverTarget 高亮目标元素的 ref 对象
 * @param hoverClassName 高亮类名的 ref 对象
 */
export function markTarget(
  event: MouseEvent,
  hoverOptions: ContextMenuOptions["hover"] | undefined,
  hoverTarget: Ref<HTMLElement | null>,
  hoverClassName: Ref<string>,
) {
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
 * 计算并设置菜单的显示位置，确保不超出可视区域
 * @param event 鼠标事件，用于获取点击坐标
 * @param menuElement 菜单 DOM 元素
 * @param style 样式对象引用，用于更新 top/left
 * @param style.top 顶部位置
 * @param style.left 左侧位置
 */
export async function positionMenu(event: MouseEvent, menuElement: HTMLElement | null | undefined, style: { top: string, left: string }) {
  await nextTick()
  if (!menuElement) return

  const doc = (event.target as HTMLElement | null)?.ownerDocument ?? document
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
 * @param doc Document 对象
 * @param menuElement 菜单 DOM 元素
 * @param close 关闭回调函数
 * @param cleanupFns 清理函数数组
 */
export function registerOutsideClose(doc: Document, menuElement: HTMLElement | null | undefined, close: () => void, cleanupFns: Array<() => void>) {
  const handler = (event: MouseEvent) => {
    const target = event.target as Node | null
    if (!menuElement || menuElement === target || menuElement.contains(target)) return
    close()
  }
  doc.addEventListener("mousedown", handler)
  cleanupFns.push(() => doc.removeEventListener("mousedown", handler))
}
