import type { ContextMenuItem, ContextMenuOptions } from "../types"
import { nextTick } from "vue"
import { cloneDeep } from "lodash-es"

/**
 * 规范化菜单项列表，确保每个项都有 showChildren 属性
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
 */
export function removeHoverHighlight(
  hoverTarget: { value: HTMLElement | null },
  hoverClassName: { value: string },
) {
  if (hoverTarget.value) {
    hoverTarget.value.classList?.remove(hoverClassName.value)
    hoverTarget.value = null
  }
}

/**
 * 标记触发菜单的目标元素
 */
export function markTarget(
  event: MouseEvent,
  hoverOptions: ContextMenuOptions["hover"] | undefined,
  hoverTarget: { value: HTMLElement | null },
  hoverClassName: { value: string },
) {
  removeHoverHighlight(hoverTarget, hoverClassName)
  if (!hoverOptions)
    return

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
 * 定位菜单到合适的位置
 */
export async function positionMenu(
  event: MouseEvent,
  menuElement: HTMLElement | null | undefined,
  style: { top: string, left: string },
) {
  await nextTick()
  if (!menuElement)
    return

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
 * 注册外部点击关闭事件
 */
export function registerOutsideClose(
  doc: Document,
  menuElement: HTMLElement | null | undefined,
  close: () => void,
  cleanupFns: Array<() => void>,
) {
  const handler = (event: MouseEvent) => {
    const target = event.target as Node | null
    if (!menuElement || menuElement === target || menuElement.contains(target))
      return
    close()
  }
  doc.addEventListener("mousedown", handler)
  cleanupFns.push(() => doc.removeEventListener("mousedown", handler))
}
