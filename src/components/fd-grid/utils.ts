import type { ResponsiveValue } from "./type"

interface BreakpointRule {
  key: keyof Exclude<ResponsiveValue, number>
  match: (width: number) => boolean
}

const BREAKPOINT_RULES: BreakpointRule[] = [
  { key: "xxl", match: width => width >= 1600 },
  { key: "xl", match: width => width >= 1200 },
  { key: "lg", match: width => width >= 992 },
  { key: "md", match: width => width >= 768 },
  { key: "sm", match: width => width >= 576 },
  { key: "xs", match: width => width < 576 },
]

/**
 * 解析响应式值：命中当前断点，否则向下寻找更小断点，再尝试向上回退
 */
export function resolveResponsiveValue(value: ResponsiveValue | undefined, width: number, fallback: number): number {
  if (typeof value === "number") {
    return value
  }

  if (!value) {
    return fallback
  }

  let matchedIndex = BREAKPOINT_RULES.findIndex(rule => rule.match(width))
  if (matchedIndex === -1) {
    matchedIndex = BREAKPOINT_RULES.length - 1
  }

  for (let index = matchedIndex; index < BREAKPOINT_RULES.length; index += 1) {
    const candidate = value[BREAKPOINT_RULES[index].key]
    if (typeof candidate === "number") {
      return candidate
    }
  }

  for (let index = matchedIndex - 1; index >= 0; index -= 1) {
    const candidate = value[BREAKPOINT_RULES[index].key]
    if (typeof candidate === "number") {
      return candidate
    }
  }

  return fallback
}

export function clampValue(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min
  }
  return Math.min(Math.max(value, min), max)
}
