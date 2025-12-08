import type { RenderCtx } from "./content"
import type { DetailData, DetailAction, DetailOptions } from "../types"
import { h } from "vue"
import { ElButton } from "element-plus"
import { slotNameOf, componentOf, resolveMaybe, componentProps, componentSlots, componentStyle, componentEvents } from "../engine/helpers"

/** 判断显隐，支持布尔与函数隐藏条件。 */
function isVisible<D extends DetailData>(target: { hidden?: ((data: D) => boolean) | boolean }, data: D) {
  const hidden = target?.hidden
  if (typeof hidden === "function")
    return !hidden(data)
  return !hidden
}

function resolveActionText<D extends DetailData>(action: DetailAction<D>, options: DetailOptions<D>, data: D) {
  return resolveMaybe(action.text, data) ?? options.dialog.title ?? "确定"
}

function renderComponentSlot<D extends DetailData>(componentSlot: any, data: D, extra: Record<string, any> = {}, userSlots?: Record<string, ((props: any) => any) | undefined>) {
  const slotName = slotNameOf(componentSlot, data)
  if (slotName && userSlots?.[slotName]) {
    return userSlots[slotName]?.(extra)
  }
  const component = componentOf(componentSlot, data)
  if (component) {
    const childrenSlots = componentSlots(componentSlot, data)
    const vSlots = Object.fromEntries(
      Object.entries(childrenSlots).map(([childSlot, value]) => [
        childSlot,
        () => renderSlotValue(value),
      ]),
    )
    return h(
      component as any,
      {
        ...componentProps(componentSlot, data),
        style: componentStyle(componentSlot, data),
        ...componentEvents(componentSlot, data),
        ...extra,
      },
      vSlots,
    )
  }
  return null
}

function renderSlotValue(value: any) {
  if (typeof value === "function")
    return value()
  return h(value as any, { "data-detail-slot": true })
}

export function renderActions<D extends DetailData = DetailData>(ctx: RenderCtx<D>) {
  const baseActions = ctx.options.actions.length
    ? ctx.options.actions
    : []
  const hasOk = baseActions.some(action => action.type === "ok")
  const actions = hasOk ? baseActions : [...baseActions, { type: "ok", text: "确认" } as DetailAction<D>]

  return h(
    "div",
    { class: "fd-detail__footer" },
    actions.map((action, index) => {
      if (!isVisible(action, ctx.data.value))
        return null
      if (action.type === "ok") {
        return h(
          ElButton,
          {
            key: index,
            type: "primary",
            onClick: ctx.onClose,
          },
          () => resolveActionText(action, ctx.options, ctx.data.value),
        )
      }
      const slotName = slotNameOf(action.component, ctx.data.value)
      if (slotName && ctx.userSlots[slotName]) {
        return h(
          "template",
          { key: index },
          ctx.userSlots[slotName]?.({ index, data: ctx.data.value }),
        )
      }
      const comp = renderComponentSlot(action.component, ctx.data.value, { index, data: ctx.data.value }, ctx.userSlots)
      return comp ? h("template", { key: index }, comp) : null
    }),
  )
}
