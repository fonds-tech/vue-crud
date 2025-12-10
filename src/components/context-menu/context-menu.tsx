import type { PropType } from "vue"
import type { ContextMenuExpose, ContextMenuOptions } from "./types"
import { renderList } from "./render/menu"
import { useContextMenuCore } from "./core"
import { h, render, defineComponent } from "vue"
import "./style.scss"

export const ContextMenu = defineComponent({
  name: "fd-context-menu",
  props: {
    show: Boolean,
    event: { type: Object as PropType<MouseEvent>, default: undefined },
    options: { type: Object as PropType<ContextMenuOptions>, default: () => ({}) },
  },
  setup(props, { slots, expose }) {
    // 使用核心逻辑钩子
    const { setRefs, list, ids, style, visible, animationClass, extraClass, open, close, toggleItem } = useContextMenuCore(props)

    // 暴露给父组件的实例属性和方法
    expose({
      open,
      close,
    })

    // 返回渲染函数
    return () => {
      if (!visible.value) return null

      const content = slots.default ? slots.default() : renderList(list.value, "0", 1, ids, toggleItem, close)

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
 * 工具方法：动态创建并打开 Context Menu
 */
export const contextMenu = {
  open(event: MouseEvent, options: ContextMenuOptions = {}) {
    const doc = options.document ?? (event.target as HTMLElement | null)?.ownerDocument ?? document
    const host = doc.createElement("div")
    doc.body.appendChild(host)

    const vnode = h(ContextMenu, {
      show: true,
      event,
      options,
    })

    render(vnode, host)

    const exposed = vnode.component?.exposed as ContextMenuExpose | undefined

    if (exposed) {
      const originalClose = exposed.close
      exposed.close = () => {
        originalClose()
        setTimeout(() => {
          render(null, host)
          host.remove()
        }, 180)
      }
    }

    return exposed ?? { close: () => render(null, host) }
  },
}

export default ContextMenu
