import type { DetailData, DetailItem, DetailGroup, DetailSlots, DetailOptions, DetailComponent, DetailDescriptions, DetailComponentSlot } from "../interface"
import { merge } from "lodash-es"
import { resolve } from "@/utils"
import { isFunction } from "@fonds/utils"
import { h, markRaw } from "vue"

/** 判断是否为组件配置对象，避免将插槽名误判为组件。 */
export function isDetailComponent(target?: DetailComponentSlot): target is DetailComponent {
  return Boolean(target && typeof target === "object" && "is" in (target as Record<string, any>))
}

/** 读取自定义插槽名称，支持直接传入 slot 名或从组件配置中解析。 */
export function slotNameOf<D extends DetailData = DetailData>(value: DetailComponentSlot | undefined, data: D) {
  if (!value) return undefined
  if (typeof value === "string") return value
  if (typeof value === "object" && "slot" in (value as Record<string, any>)) return resolve((value as DetailComponent).slot, data)
  if (!isDetailComponent(value)) return undefined
  return resolve(value.slot, data)
}

/** 获取组件引用，排除纯字符串/slot 占位，确保返回可渲染的组件定义。 */
export function componentOf<D extends DetailData = DetailData>(value: DetailComponentSlot | undefined, data: D) {
  if (!value) return undefined
  if (typeof value === "string") return undefined
  if (typeof value === "object" && "slot" in (value as Record<string, any>)) return undefined
  if (isDetailComponent(value)) return resolve(value.is, data)
  const resolved = value
  return typeof resolved === "object" && resolved !== null ? markRaw(resolved) : resolved
}

/** 获取组件事件，避免未配置时返回 undefined。 */
export function componentEvents<D extends DetailData = DetailData>(value: DetailComponentSlot | undefined, data: D) {
  if (!value || !isDetailComponent(value)) return {}
  return (resolve(value.on, data) ?? {}) as Record<string, (...args: unknown[]) => unknown>
}

/** 获取组件 props，默认返回空对象，便于 v-bind 展开。 */
export function componentProps<D extends DetailData = DetailData>(value: DetailComponentSlot | undefined, data: D) {
  if (!value || !isDetailComponent(value)) return {}
  return resolve(value.props, data) ?? {}
}

/** 获取组件 style，未配置时返回 undefined 以避免覆盖默认样式。 */
export function componentStyle<D extends DetailData = DetailData>(value: DetailComponentSlot | undefined, data: D) {
  if (!value || !isDetailComponent(value)) return undefined
  return resolve(value.style, data)
}

/** 获取组件具名插槽，防御性处理非对象输入。 */
export function componentSlots<D extends DetailData = DetailData>(value: DetailComponentSlot | undefined, data: D): Record<string, DetailComponentSlot> {
  if (!value || !isDetailComponent(value)) return {} as Record<string, DetailComponentSlot>
  const slotsValue = resolve(value.slots, data)
  const resolved = slotsValue ?? {}
  if (typeof resolved === "object" && resolved !== null) return markRaw(resolved as Record<string, DetailComponentSlot>)
  return {} as Record<string, DetailComponentSlot>
}

/** 字段/分组 slots 统一处理，支持函数/对象两种写法。 */
export function slotsOf<D extends DetailData = DetailData>(target: { slots?: DetailSlots<D> } | undefined, data: D) {
  if (!target || typeof target !== "object" || !("slots" in target)) return {} as Record<string, DetailComponentSlot>
  const slotValue = (target as { slots?: DetailDescriptions["slots"] }).slots
  if (!slotValue) return {} as Record<string, DetailComponentSlot>
  const resolved = isFunction(slotValue) ? slotValue(data) : slotValue
  if (typeof resolved === "object" && resolved !== null) return markRaw(resolved as Record<string, DetailComponentSlot>)
  return {} as Record<string, DetailComponentSlot>
}

/** 渲染插槽值，如果是函数则调用，否则作为组件渲染。 */
export function renderSlotValue(value: any) {
  if (typeof value === "function") return value()
  return h(value as any, { "data-detail-slot": true })
}

/** 渲染组件插槽，优先使用用户插槽，其次渲染配置的组件。 */
export function renderComponentSlot<D extends DetailData>(
  componentSlot: any,
  data: D,
  extra: Record<string, any> = {},
  userSlots?: Record<string, ((props: any) => any) | undefined>,
) {
  const slotName = slotNameOf(componentSlot, data)
  if (slotName && userSlots?.[slotName]) {
    return userSlots[slotName]?.(extra)
  }
  const component = componentOf(componentSlot, data)
  if (component) {
    const childrenSlots = componentSlots(componentSlot, data)
    const vSlots = Object.fromEntries(Object.entries(childrenSlots).map(([childSlot, value]) => [childSlot, () => renderSlotValue(value)]))
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

export function buildGroups<D extends DetailData = DetailData>(options: DetailOptions<D>, uid?: number, data: D = {} as D) {
  if (!options.items.length) return []
  const fallbackName = uid ?? "fd-detail"
  const map = new Map<string | number, DetailItem<D>[]>()
  map.set(fallbackName, [])
  options.groups.forEach((group) => {
    if (group.name !== undefined) {
      map.set(group.name, [])
    }
  })
  options.items.forEach((item) => {
    const groupName = resolve(item.group, data)
    if (groupName !== undefined && map.has(groupName)) {
      map.get(groupName)!.push(item)
    }
    else {
      map.get(fallbackName)!.push(item)
    }
  })
  return Array.from(map.entries())
    .map(([name, items]) => {
      const meta = options.groups.find(group => group.name === name)
      const descriptions = merge({}, options.descriptions, meta?.descriptions) as DetailDescriptions
      const normalizedDescriptions = {
        ...descriptions,
        column: descriptions.column ?? 2,
      }
      return {
        name,
        items,
        title: meta ? resolve(meta.title, data) : descriptions.title,
        descriptions: normalizedDescriptions,
      } as DetailGroup<D> & { items: DetailItem<D>[], descriptions: DetailDescriptions }
    })
    .filter(group => group.items.length > 0)
}
