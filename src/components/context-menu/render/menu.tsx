import type { Ref } from "vue"
import type { InternalMenuItem } from "../core/helpers"

/**
 * 渲染分隔线
 * @param id - 分隔线唯一标识
 * @returns JSX 元素
 */
function renderDivider(id: string): JSX.Element {
  return (
    <div
      key={id}
      class="fd-context-menu__divider"
      role="separator"
    />
  )
}

/**
 * 递归渲染菜单项列表
 * @param items - 菜单项列表
 * @param parentId - 父级 ID
 * @param level - 当前层级，用于控制缩进和样式
 * @param ids - 激活的菜单项 ID 集合
 * @param handleItemClick - 处理菜单项点击的回调函数
 * @param close - 关闭菜单的回调函数
 * @returns JSX 元素
 */
export function renderList(
  items: InternalMenuItem[],
  parentId: string,
  level: number,
  ids: Ref<Set<string>>,
  handleItemClick: (item: InternalMenuItem, id: string) => void,
  close: () => void,
): JSX.Element {
  return (
    <div class={["fd-context-menu__list", level > 1 && "is-append"]} role="menu">
      {items
        .filter(item => !item.hidden)
        .map((item, index) => {
          const id = `${parentId}-${index}`

          // 渲染分隔线
          if (item.type === "divider") {
            return renderDivider(id)
          }

          const hasChildren = Boolean(item.children && item.children.length > 0)
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
                  handleItemClick(item, id)
                }
              }}
              onKeydown={(event: KeyboardEvent) => {
                if (item.disabled) return

                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  handleItemClick(item, id)
                }

                if (event.key === "Escape") {
                  close()
                }

                // 键盘导航：上下箭头
                if (event.key === "ArrowDown") {
                  event.preventDefault()
                  const currentElement = event.currentTarget as HTMLElement
                  const nextElement = currentElement.nextElementSibling as HTMLElement | null
                  nextElement?.focus()
                }

                if (event.key === "ArrowUp") {
                  event.preventDefault()
                  const currentElement = event.currentTarget as HTMLElement
                  const prevElement = currentElement.previousElementSibling as HTMLElement | null
                  prevElement?.focus()
                }
              }}
            >
              {prefixIcon && <span class={["fd-context-menu__icon", prefixIcon]}></span>}
              <span class="fd-context-menu__label">{item.label}</span>
              {suffixIcon && <span class={["fd-context-menu__icon", suffixIcon]}></span>}
              {hasChildren && item._showChildren && item.children && renderList(
                item.children,
                id,
                level + 1,
                ids,
                handleItemClick,
                close,
              )}
            </div>
          )
        })}
    </div>
  )
}
