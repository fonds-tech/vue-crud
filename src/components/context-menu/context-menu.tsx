import type { PropType } from "vue"
import type { ContextMenuExpose, ContextMenuControl, ContextMenuOptions } from "./types"
import { renderList } from "./render/menu"
import { useContextMenuCore } from "./core"
import { h, render, defineComponent } from "vue"
import "./style.scss"

/**
 * 右键菜单组件
 * 支持嵌套菜单、图标、禁用、快捷键等功能
 */
export const ContextMenu = defineComponent({
  name: "fd-context-menu",
  props: {
    /** 是否显示菜单 */
    show: Boolean,
    /** 触发菜单的鼠标事件 */
    event: { type: Object as PropType<MouseEvent>, default: undefined },
    /** 菜单选项配置 */
    options: { type: Object as PropType<ContextMenuOptions>, default: () => ({}) },
  },
  setup(props, { slots, expose }) {
    const {
      setRefs,
      list,
      ids,
      style,
      visible,
      animationClass,
      extraClass,
      open,
      close,
      handleItemClick,
    } = useContextMenuCore(props)

    expose({ open, close } satisfies ContextMenuExpose)

    return () => {
      if (!visible.value) return null

      const content = slots.default
        ? slots.default()
        : renderList(list.value, "0", 1, ids, handleItemClick, close)

      return (
        <div
          class={["fd-context-menu", animationClass.value, extraClass.value]}
          ref={setRefs("fd-context-menu")}
          style={style}
          onContextmenu={(e) => {
            e.preventDefault()
          }}
        >
          {content}
        </div>
      )
    }
  },
})

/**
 * 工具对象：包含命令式调用方法
 */
export const contextMenu = {
  /**
   * 动态创建并打开 Context Menu
   * @param event - 触发菜单的鼠标事件
   * @param options - 菜单配置选项
   * @returns 包含关闭方法的控制对象
   */
  open(event: MouseEvent, options: ContextMenuOptions = {}): ContextMenuControl {
    const targetElement = event.target as HTMLElement | null
    const doc = options.document ?? targetElement?.ownerDocument ?? document
    const host = doc.createElement("div")
    doc.body.appendChild(host)

    const vnode = h(ContextMenu, {
      show: true,
      event,
      options,
    })

    render(vnode, host)

    const exposed = vnode.component?.exposed as ContextMenuExpose | undefined

    const cleanup = (): void => {
      setTimeout(() => {
        render(null, host)
        host.remove()
      }, 180)
    }

    if (exposed) {
      const originalClose = exposed.close
      const wrappedClose = (): void => {
        originalClose()
        cleanup()
      }
      return { close: wrappedClose }
    }

    return {
      close: () => {
        render(null, host)
        host.remove()
      },
    }
  },
}

export default ContextMenu
