import type { Component } from "vue"
import type { FormItem, FormRenderContext } from "../types"
import { renderComponentSlotMap } from "./slots"
import { h, resolveDynamicComponent } from "vue"

/**
 * 渲染单个表单控件，完成组件解析、v-model 绑定与事件/插槽注入。
 * @param ctx 渲染上下文
 * @param item 表单项配置
 * @returns 控件 VNode 或 undefined
 */
export function renderControl(ctx: FormRenderContext, item: FormItem) {
  const { helpers } = ctx
  const component = helpers.is(item.component)
  if (component) {
    const resolved = (typeof component === "string" ? resolveDynamicComponent(component) : component) as Component
    const listeners = helpers.normalizeListeners(helpers.onListeners(item.component))
    const childSlots = renderComponentSlotMap(ctx, helpers.slotsOf(item.component), { item, model: ctx.model })

    return h(
      resolved,
      {
        ...helpers.formatProps.value(item),
        "ref": helpers.bindComponentRef(item.component),
        "modelValue": helpers.getModelValue(item.prop),
        "style": helpers.styleOf(item.component),
        "onUpdate:modelValue": (val: unknown) => helpers.setModelValue(item.prop, val),
        ...listeners,
      },
      childSlots,
    )
  }
}
