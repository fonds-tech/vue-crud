import type { PropType } from "vue"
import type { ContextMenuItem, ContextMenuExpose, ContextMenuOptions } from "./type"
import { useRefs } from "@/hooks"
import { isString } from "@fonds/utils"
import { cloneDeep } from "lodash-es"
import { h, ref, watch, render, nextTick, reactive, defineComponent, onBeforeUnmount } from "vue"
import "./style.scss"

const COMPONENT_NAME = "fd-context-menu"
const HOVER_CLASS_NAME = "fd-context-menu__target"

function normalizeList(list?: ContextMenuItem[]): ContextMenuItem[] {
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

export const FdContextMenu = defineComponent({
  name: COMPONENT_NAME,
  props: {
    show: Boolean,
    event: { type: Object as PropType<MouseEvent>, default: undefined },
    options: { type: Object as PropType<ContextMenuOptions>, default: () => ({}) },
  },
  setup(props, { slots, expose }) {
    const { refs, setRefs } = useRefs<HTMLDivElement>()
    const list = ref<ContextMenuItem[]>(normalizeList(props.options?.list))
    const ids = ref("")
    const style = reactive({ top: "0px", left: "0px" })
    const visible = ref(false)
    const animationClass = ref("is-enter")
    const extraClass = ref<string | undefined>(props.options?.class)
    const hoverTarget = ref<HTMLElement | null>(null)
    const hoverClassName = ref(HOVER_CLASS_NAME)
    const cleanupFns: Array<() => void> = []

    function cleanup() {
      cleanupFns.splice(0).forEach(fn => fn())
    }

    function removeHoverHighlight() {
      if (hoverTarget.value) {
        hoverTarget.value.classList?.remove(hoverClassName.value)
        hoverTarget.value = null
      }
    }

    function registerOutsideClose(doc: Document) {
      cleanup()
      const handler = (event: MouseEvent) => {
        const root = refs[COMPONENT_NAME] as HTMLElement | undefined
        const target = event.target as Node | null
        if (!root || root === target || root.contains(target))
          return
        close()
      }
      doc.addEventListener("mousedown", handler)
      cleanupFns.push(() => doc.removeEventListener("mousedown", handler))
    }

    function markTarget(event: MouseEvent, hoverOptions?: ContextMenuOptions["hover"]) {
      removeHoverHighlight()
      if (!hoverOptions)
        return

      const config = hoverOptions === true ? {} : hoverOptions
      const className = config.className ?? HOVER_CLASS_NAME
      hoverClassName.value = className

      let target = event.target as HTMLElement | null
      if (config.target) {
        while (target && !(isString(target.className) && target.className.includes(config.target))) {
          target = target.parentElement
        }
      }

      if (target && isString(target.className)) {
        target.classList?.add(className)
        hoverTarget.value = target
      }
    }

    async function positionMenu(event: MouseEvent) {
      await nextTick()
      const menu = refs[COMPONENT_NAME] as HTMLElement | undefined
      if (!menu)
        return

      const doc = (event.target as HTMLElement | null)?.ownerDocument ?? document
      const body = doc.body
      const maxHeight = body.clientHeight
      const maxWidth = body.clientWidth

      let left = event.pageX ?? event.clientX
      let top = event.pageY ?? event.clientY

      const { clientHeight, clientWidth } = menu

      if (top + clientHeight > maxHeight) {
        top = Math.max(5, maxHeight - clientHeight - 5)
      }
      if (left + clientWidth > maxWidth) {
        left = Math.max(5, maxWidth - clientWidth - 5)
      }

      style.top = `${top}px`
      style.left = `${left}px`
    }

    function open(event: MouseEvent, options: ContextMenuOptions = {}) {
      if (!event)
        return { close }

      event.preventDefault?.()
      event.stopPropagation?.()

      animationClass.value = "is-enter"
      extraClass.value = options.class ?? props.options?.class
      visible.value = true
      ids.value = ""

      if (options.list?.length) {
        list.value = normalizeList(options.list)
      }

      const doc = (event.target as HTMLElement | null)?.ownerDocument ?? document
      registerOutsideClose(doc)
      markTarget(event, options.hover ?? props.options?.hover)
      positionMenu(event)

      return { close }
    }

    function close(immediate = false) {
      removeHoverHighlight()
      cleanup()
      if (!visible.value)
        return
      animationClass.value = "is-leave"
      const delay = immediate ? 0 : 180
      window.setTimeout(() => {
        visible.value = false
      }, delay)
    }

    function toggleItem(item: ContextMenuItem, id: string) {
      ids.value = id
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

    function renderList(items: ContextMenuItem[], parentId: string, level: number): JSX.Element {
      return (
        <div class={["fd-context-menu__list", level > 1 && "is-append"]}>
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
                    "is-active": ids.value.includes(id),
                    "is-ellipsis": item.ellipsis ?? true,
                    "is-disabled": item.disabled,
                  }}
                >
                  {prefixIcon && <span class={["fd-context-menu__icon", prefixIcon]}></span>}
                  <span
                    onClick={() => {
                      toggleItem(item, id)
                    }}
                  >
                    {item.label}
                  </span>
                  {suffixIcon && <span class={["fd-context-menu__icon", suffixIcon]}></span>}
                  {hasChildren && item.showChildren && renderList(item.children!, id, level + 1)}
                </div>
              )
            })}
        </div>
      )
    }

    watch(
      () => props.options?.list,
      (next) => {
        list.value = normalizeList(next)
      },
      { deep: true },
    )

    watch(
      () => props.options?.class,
      (cls) => {
        if (cls)
          extraClass.value = cls
      },
    )

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

    onBeforeUnmount(() => {
      cleanup()
      removeHoverHighlight()
    })

    expose({
      open,
      close,
    })

    return () => {
      if (!visible.value)
        return null

      const content = slots.default ? slots.default() : renderList(list.value, "0", 1)

      return (
        <div
          class={["fd-context-menu", animationClass.value, extraClass.value]}
          ref={setRefs(COMPONENT_NAME)}
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

export const ContextMenu = {
  open(event: MouseEvent, options: ContextMenuOptions = {}) {
    const doc = (event.target as HTMLElement | null)?.ownerDocument ?? document
    const host = doc.createElement("div")
    doc.body.appendChild(host)

    const vnode = h(FdContextMenu, {
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
        render(null, host)
        host.remove()
      }
    }

    return exposed ?? { close: () => render(null, host) }
  },
}

export default FdContextMenu
