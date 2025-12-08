import type { SearchEngine } from "../engine"
import type { SearchAction } from "../types"
import type { Slots, Component, VNodeChild } from "vue"
import { transformEvents } from "../engine"
import { h, resolveDynamicComponent } from "vue"

/**
 * 渲染动作插槽
 * @param engine 搜索引擎
 * @param action 动作配置
 * @param slots 组件插槽
 */
export function renderActionSlots(
  engine: SearchEngine,
  action: SearchAction,
  slots: Slots,
): VNodeChild | null {
  const slotName = engine.getActionSlot(action)
  if (slotName && slots[slotName]) {
    return slots[slotName]?.({ model: engine.formModel.value, action })
  }
  return null
}

/**
 * 渲染自定义组件插槽
 * @param engine 搜索引擎
 * @param action 动作配置
 */
export function renderCustomSlots(
  engine: SearchEngine,
  action: SearchAction,
): Record<string, () => VNodeChild> | undefined {
  const componentSlots = engine.getComponentSlots(action)
  const entries = Object.entries(componentSlots)
  if (!entries.length) return undefined

  const slotRender: Record<string, () => VNodeChild> = {}
  entries.forEach(([name, value]) => {
    slotRender[name] = () => {
      if (typeof value === "function") {
        return (value as () => any)()
      }
      const Dynamic = resolveDynamicComponent(value as string | Component)
      return h(Dynamic as Component)
    }
  })
  return slotRender
}

/**
 * 渲染自定义组件
 * @param engine 搜索引擎
 * @param action 动作配置
 */
export function renderComponent(
  engine: SearchEngine,
  action: SearchAction,
): VNodeChild | null {
  const componentIs = engine.getComponentIs(action)
  if (!componentIs) return null

  const Dynamic = resolveDynamicComponent(componentIs as string | Component)
  const componentProps = engine.getComponentProps(action)
  const componentEvents = transformEvents(engine.getComponentEvents(action))
  const componentSlots = renderCustomSlots(engine, action)

  return h(
    Dynamic as Component,
    {
      style: engine.getComponentStyle(action),
      ...componentProps,
      ...componentEvents,
    },
    componentSlots,
  )
}
