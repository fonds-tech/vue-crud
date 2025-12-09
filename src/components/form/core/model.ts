import type { FormRecord } from "../types"
import type { FormItemProp } from "element-plus"

/**
 * 将 prop 规范为路径数组
 * @param prop 字段标识
 */
export function toPathArray(prop?: FormItemProp): string[] | undefined {
  if (prop === undefined || prop === null)
    return undefined
  if (Array.isArray(prop))
    return prop.map(String)
  const path = String(prop).split(".").filter(Boolean)
  return path.length ? path : undefined
}

/**
 * 将 prop 转为字符串
 */
export function propToString(prop?: FormItemProp): string {
  const path = toPathArray(prop)
  return path?.join(".") ?? ""
}

/**
 * 读取模型值，支持嵌套路径
 */
export function getModelValue<T extends FormRecord = FormRecord>(model: T, prop?: FormItemProp) {
  const path = toPathArray(prop)
  if (!path?.length)
    return model
  let cursor: unknown = model
  for (const segment of path) {
    if (cursor == null || typeof cursor !== "object")
      return undefined
    cursor = (cursor as Record<string, unknown>)[segment]
  }
  return cursor
}

/**
 * 设置模型值，自动创建中间对象
 */
export function setModelValue<T extends FormRecord = FormRecord>(model: T, prop: FormItemProp, value: unknown) {
  const path = toPathArray(prop)
  if (!path?.length)
    return
  let cursor: Record<string, unknown> = model
  for (let i = 0; i < path.length; i++) {
    const key = path[i]!
    if (i === path.length - 1) {
      cursor[key] = value as never
      return
    }
    cursor[key] = cursor[key] ?? {}
    cursor = cursor[key] as Record<string, unknown>
  }
}

/**
 * 删除模型字段，支持嵌套路径
 */
export function deleteModelValue<T extends FormRecord = FormRecord>(model: T, prop: FormItemProp) {
  const path = toPathArray(prop)
  if (!path?.length)
    return

  let cursor: Record<string, unknown> = model

  // 遍历到目标字段的父级
  for (let i = 0; i < path.length - 1; i++) {
    const next = cursor[path[i]!]
    if (!next || typeof next !== "object")
      return
    cursor = next as Record<string, unknown>
  }

  // 删除目标字段
  delete cursor[path[path.length - 1]!]
}
