import type { RenderCtx } from "./content"
import type { DetailData, DetailAction, DetailOptions } from "../interface"
import { h } from "vue"
import { resolve } from "@/utils"
import { ElButton } from "element-plus"
import { slotNameOf, renderComponentSlot } from "../core/helpers"

/** 判断显隐，支持布尔与函数隐藏条件。 */
function isVisible<D extends DetailData>(target: { hidden?: ((data: D) => boolean) | boolean }, data: D) {
  const hidden = target?.hidden
  if (typeof hidden === "function") return !hidden(data)
  return !hidden
}

function resolveActionText<D extends DetailData>(action: DetailAction<D>, options: DetailOptions<D>, data: D) {
  return resolve(action.text, data) ?? options.dialog.title ?? "确定"
}

/**
 * 渲染单个操作按钮
 */
function renderActionItem<D extends DetailData>(action: DetailAction<D>, index: number, ctx: RenderCtx<D>): JSX.Element | null {
  if (!isVisible(action, ctx.data.value)) return null

  // 确认按钮
  if (action.type === "ok") {
    return (
      <ElButton key={index} type="primary" onClick={ctx.onClose}>
        {resolveActionText(action, ctx.options, ctx.data.value)}
      </ElButton>
    )
  }

  // 用户自定义插槽
  const slotName = slotNameOf(action.component, ctx.data.value)
  if (slotName && ctx.userSlots[slotName]) {
    return h("template", { key: index }, ctx.userSlots[slotName]?.({ index, data: ctx.data.value }))
  }

  // 动态组件（需使用 h 函数）
  const comp = renderComponentSlot(action.component, ctx.data.value, { index, data: ctx.data.value }, ctx.userSlots)
  return comp ? h("template", { key: index }, comp) : null
}

export function renderActions<D extends DetailData = DetailData>(ctx: RenderCtx<D>) {
  const baseActions = ctx.options.actions.length ? ctx.options.actions : []
  const hasOk = baseActions.some(action => action.type === "ok")
  const actions = hasOk ? baseActions : [...baseActions, { type: "ok", text: "确认" } as DetailAction<D>]

  return <div class="fd-detail__footer">{actions.map((action, index) => renderActionItem(action, index, ctx))}</div>
}
