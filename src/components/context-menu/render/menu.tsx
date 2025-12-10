import type { Ref } from "vue"
import type { ContextMenuItem } from "../types"

/**
 * 递归渲染菜单项列表
 * @param items 菜单项列表
 * @param parentId 父级 ID
 * @param level 当前层级，用于控制缩进和样式
 * @param ids 激活的菜单项 ID 集合
 * @param toggleItem 切换菜单项状态的回调函数
 * @param close 关闭菜单的回调函数
 * @returns JSX 元素
 */
export function renderList(
  items: ContextMenuItem[],
  parentId: string,
  level: number,
  ids: Ref<Set<string>>,
  toggleItem: (item: ContextMenuItem, id: string) => void,
  close: () => void,
): JSX.Element {
  return (
    <div class={["fd-context-menu__list", level > 1 && "is-append"]} role="menu">
      {items
        .filter(item => !item.hidden)
        .map((item, index) => {
          const id = `${parentId}-${index}`
          const hasChildren = Boolean(item.children && item.children.length)
          const suffixIcon = item.suffixIcon || (hasChildren ? "fd-icon-right" : undefined)
          const prefixIcon = item.prefixIcon

          return (
            <div
              key={id}
              class={{
                "fd-context-menu__item": true,
                "is-active": ids.value.has(id),
                "is-ellipsis": item.ellipsis ?? true,
                "is-disabled": item.disabled,
              }}
              role="menuitem"
              aria-disabled={item.disabled}
              tabindex={item.disabled ? -1 : 0}
              onClick={() => {
                if (!item.disabled) {
                  toggleItem(item, id)
                }
              }}
              onKeydown={(event) => {
                if (item.disabled) return
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  toggleItem(item, id)
                }
                if (event.key === "Escape") {
                  close()
                }
                // 键盘导航：上下箭头
                if (event.key === "ArrowDown") {
                  event.preventDefault()
                  const next = (event.currentTarget as HTMLElement).nextElementSibling as HTMLElement | null
                  next?.focus()
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault()
                  const prev = (event.currentTarget as HTMLElement).previousElementSibling as HTMLElement | null
                  prev?.focus()
                }
              }}
            >
              {prefixIcon && <span class={["fd-context-menu__icon", prefixIcon]}></span>}
              <span class="fd-context-menu__label">{item.label}</span>
              {suffixIcon && <span class={["fd-context-menu__icon", suffixIcon]}></span>}
              {hasChildren && item.showChildren && renderList(item.children!, id, level + 1, ids, toggleItem, close)}
            </div>
          )
        })}
    </div>
  )
}
