import type { MaybeFn } from "../types/shared"
import { isFunction } from "@fonds/utils"

/**
 * 解析动态值
 *
 * 将「可能是函数也可能是静态值」的配置项统一解析为最终值。
 * 如果值是函数，则以上下文为参数调用并返回结果；否则直接返回值。
 *
 * @template T 值类型
 * @template C 上下文类型
 * @param value 静态值或返回值的函数
 * @param context 函数执行时的上下文参数
 * @returns 解析后的值
 *
 * @example
 * ```ts
 * // 静态值
 * resolve("hello", {}) // => "hello"
 *
 * // 动态值
 * resolve((ctx) => ctx.name, { name: "world" }) // => "world"
 *
 * // undefined
 * resolve(undefined, {}) // => undefined
 * ```
 */
export function resolve<T, C = unknown>(value: MaybeFn<T, C> | undefined, context: C): T | undefined {
  if (value === undefined) return undefined
  if (isFunction(value)) return (value as (context: C) => T)(context)
  return value as T
}

/**
 * 解析对象上的某个属性
 *
 * 从目标对象中读取指定属性，若属性值为函数则以上下文调用。
 * 适用于需要从配置对象中提取动态属性的场景。
 *
 * @template T 期望的返回类型
 * @template C 上下文类型
 * @param target 目标对象
 * @param key 属性名
 * @param context 上下文
 * @returns 解析后的属性值
 *
 * @example
 * ```ts
 * const config = {
 *   label: "静态标签",
 *   visible: (ctx) => ctx.show,
 * }
 *
 * resolveProp<string>(config, "label", {}) // => "静态标签"
 * resolveProp<boolean>(config, "visible", { show: true }) // => true
 * resolveProp<string>(config, "notExist", {}) // => undefined
 * ```
 */
export function resolveProp<T, C = unknown>(target: Record<string, unknown> | undefined, key: string, context: C): T | undefined {
  if (!target || typeof target !== "object") return undefined
  const value = target[key]
  if (isFunction(value)) return value(context) as T
  return value as T | undefined
}
