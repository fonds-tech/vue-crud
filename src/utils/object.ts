import type { Ref } from "vue"
import { mergeWith } from "lodash-es"
import { isFunction } from "@fonds/utils"
import { isRef, toValue } from "vue"

export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

/**
 * 统一解析普通值、Ref 或函数返回值。
 */
export function getValue<T>(value: T | Ref<T> | ((...args: unknown[]) => T), ...args: unknown[]): T {
  if (isRef(value)) {
    return toValue(value)
  }

  if (isFunction(value)) {
    return value(...args)
  }

  return value
}

/**
 * 合并对象，数组类型直接覆盖。
 */
export function mergeObject<T extends Record<string, unknown>>(target: T, source?: Partial<T>): T {
  if (!source) {
    return target
  }

  return mergeWith(target, source, (_: unknown, srcValue: unknown) => {
    if (isUnknownArray(srcValue)) {
      return srcValue.slice()
    }

    return undefined
  })
}
