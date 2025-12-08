import type { DetailData, DetailSlots, DetailMaybeFn, DetailComponent, DetailDescriptions, DetailComponentSlot } from "../interface"
import { markRaw } from "vue"
import { isFunction } from "@/utils/check"

/** 解析静态值或动态函数返回值；依赖当前详情数据进行求值。 */
export function resolveMaybe<T, D extends DetailData = DetailData>(value: DetailMaybeFn<T, D> | undefined, data: D) {
  if (isFunction(value))
    return value(data)
  return value
}

/** 判断是否为组件配置对象，避免将插槽名误判为组件。 */
export function isDetailComponent(target?: DetailComponentSlot): target is DetailComponent {
  return Boolean(target && typeof target === "object" && "is" in (target as Record<string, any>))
}

/** 读取自定义插槽名称，支持直接传入 slot 名或从组件配置中解析。 */
export function slotNameOf<D extends DetailData = DetailData>(value: DetailComponentSlot | undefined, data: D) {
  if (!value)
    return undefined
  if (typeof value === "string")
    return value
  if (typeof value === "object" && "slot" in (value as Record<string, any>))
    return resolveMaybe((value as DetailComponent).slot, data)
  if (!isDetailComponent(value))
    return undefined
  return resolveMaybe(value.slot, data)
}

/** 获取组件引用，排除纯字符串/slot 占位，确保返回可渲染的组件定义。 */
export function componentOf<D extends DetailData = DetailData>(value: DetailComponentSlot | undefined, data: D) {
  if (!value)
    return undefined
  if (typeof value === "string")
    return undefined
  if (typeof value === "object" && "slot" in (value as Record<string, any>))
    return undefined
  if (isDetailComponent(value))
    return resolveMaybe(value.is, data)
  const resolved = value
  return typeof resolved === "object" && resolved !== null ? markRaw(resolved) : resolved
}

/** 获取组件事件，避免未配置时返回 undefined。 */
export function componentEvents<D extends DetailData = DetailData>(value: DetailComponentSlot | undefined, data: D) {
  if (!value || !isDetailComponent(value))
    return {}
  const raw = resolveMaybe(value.on, data) ?? {}
  return Object.fromEntries(
    Object.entries(raw).map(([key, handler]) => [`on${key.charAt(0).toUpperCase()}${key.slice(1)}`, handler]),
  )
}

/** 获取组件 props，默认返回空对象，便于 v-bind 展开。 */
export function componentProps<D extends DetailData = DetailData>(value: DetailComponentSlot | undefined, data: D) {
  if (!value || !isDetailComponent(value))
    return {}
  return resolveMaybe(value.props, data) ?? {}
}

/** 获取组件 style，未配置时返回 undefined 以避免覆盖默认样式。 */
export function componentStyle<D extends DetailData = DetailData>(value: DetailComponentSlot | undefined, data: D) {
  if (!value || !isDetailComponent(value))
    return undefined
  return resolveMaybe(value.style, data)
}

/** 获取组件具名插槽，防御性处理非对象输入。 */
export function componentSlots<D extends DetailData = DetailData>(value: DetailComponentSlot | undefined, data: D): Record<string, DetailComponentSlot> {
  if (!value || !isDetailComponent(value))
    return {} as Record<string, DetailComponentSlot>
  const slotsValue = resolveMaybe(value.slots, data)
  const resolved = slotsValue ?? {}
  if (typeof resolved === "object" && resolved !== null)
    return markRaw(resolved as Record<string, DetailComponentSlot>)
  return {} as Record<string, DetailComponentSlot>
}

/** 字段/分组 slots 统一处理，支持函数/对象两种写法。 */
export function slotsOf<D extends DetailData = DetailData>(target: { slots?: DetailSlots<D> } | undefined, data: D) {
  if (!target || typeof target !== "object" || !("slots" in target))
    return {} as Record<string, DetailComponentSlot>
  const slotValue = (target as { slots?: DetailDescriptions["slots"] }).slots
  if (!slotValue)
    return {} as Record<string, DetailComponentSlot>
  const resolved = isFunction(slotValue) ? slotValue(data) : slotValue
  if (typeof resolved === "object" && resolved !== null)
    return markRaw(resolved as Record<string, DetailComponentSlot>)
  return {} as Record<string, DetailComponentSlot>
}
