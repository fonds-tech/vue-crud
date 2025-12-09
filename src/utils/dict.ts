import type { DictItem } from "../types/shared"

/**
 * 在字典中查找匹配项
 *
 * @param dict 字典数组
 * @param value 要匹配的值
 * @returns 匹配的字典项，未找到返回 undefined
 *
 * @example
 * ```ts
 * const statusDict = [
 *   { value: 1, label: "启用", type: "success" },
 *   { value: 0, label: "禁用", type: "danger" },
 * ]
 *
 * match(statusDict, 1) // => { value: 1, label: "启用", type: "success" }
 * match(statusDict, 2) // => undefined
 * ```
 */
export function match(dict: DictItem[] | undefined, value: unknown): DictItem | undefined {
  if (!dict || !Array.isArray(dict)) return undefined
  return dict.find(item => item.value === value)
}

/**
 * 检查是否有匹配项
 *
 * @param dict 字典数组
 * @param value 要匹配的值
 * @returns 是否存在匹配项
 */
export function has(dict: DictItem[] | undefined, value: unknown): boolean {
  return match(dict, value) !== undefined
}

/**
 * 获取匹配项的标签
 *
 * @param dict 字典数组
 * @param value 要匹配的值
 * @returns 匹配项的标签，未匹配返回空字符串
 */
export function label(dict: DictItem[] | undefined, value: unknown): string {
  return match(dict, value)?.label ?? ""
}

/**
 * 获取匹配项的颜色
 *
 * @param dict 字典数组
 * @param value 要匹配的值
 * @returns 匹配项的颜色，未匹配返回 undefined
 */
export function color(dict: DictItem[] | undefined, value: unknown): string | undefined {
  return match(dict, value)?.color
}

/**
 * 获取匹配项的类型
 *
 * @param dict 字典数组
 * @param value 要匹配的值
 * @returns 匹配项的类型，未匹配返回 undefined
 */
export function type(dict: DictItem[] | undefined, value: unknown): DictItem["type"] | undefined {
  return match(dict, value)?.type
}
