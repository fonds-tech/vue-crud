import type { GridItemData, ResponsiveValue } from "./interface"

/** 默认响应式断点（同 Arco/常见布局约定） */
export const responsiveBreakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
} as const

const breakpointOrder = ["xxl", "xl", "lg", "md", "sm", "xs"] as const

/** 按视口宽度解析响应式数值，支持数值或断点对象 */
export function resolveResponsiveValue(
  value: number | ResponsiveValue | undefined,
  viewportWidth?: number,
  fallback = 0,
): number {
  if (typeof value === "number" && !Number.isNaN(value))
    return value

  if (value && typeof value === "object") {
    const width = typeof viewportWidth === "number" && !Number.isNaN(viewportWidth)
      ? viewportWidth
      : Number.POSITIVE_INFINITY

    for (const key of breakpointOrder) {
      const minWidth = responsiveBreakpoints[key]
      const candidate = (value as ResponsiveValue)[key]
      if (candidate !== undefined && width >= minWidth)
        return candidate as number
    }

    // 未匹配到合适断点时，取最靠前的已配置值作为兜底
    for (const key of [...breakpointOrder].reverse()) {
      const candidate = (value as ResponsiveValue)[key]
      if (candidate !== undefined)
        return candidate as number
    }
  }

  return fallback
}

/** 限制数值在安全范围内 */
function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

/** 归一化子项占用列数与偏移，防止越界 */
export function resolveItemData(cols: number, data: GridItemData): GridItemData {
  const originSpan = typeof data.span === "number" ? data.span : 1
  const originOffset = typeof data.offset === "number" ? data.offset : 0
  // offset 仅影响视觉偏移（marginLeft），不增加 gridColumn 的 span 值
  const offset = clamp(originOffset, 0, Math.max(cols - 1, 0))
  // span 保持独立，仅限制在合法范围内
  const span = clamp(originSpan, 1, Math.max(cols, 1))

  return {
    span,
    offset,
    suffix: Boolean(data.suffix),
  }
}

/** 计算折叠状态下需要展示的子项索引 */
export function calculateDisplayInfo(params: {
  cols: number
  collapsed: boolean
  collapsedRows: number
  items: GridItemData[]
}) {
  const cols = Math.max(1, params.cols)
  const collapsedRows = Math.max(1, params.collapsedRows)
  const items = params.items.map(item => resolveItemData(cols, item))

  if (!params.collapsed) {
    return {
      overflow: false,
      displayIndexList: items.map((_, index) => index),
    }
  }

  const capacity = cols * collapsedRows
  const displayIndexList: number[] = []
  let used = 0

  // 先保留后缀元素（如操作按钮）
  items.forEach((item, index) => {
    if (item.suffix) {
      used += item.span
      displayIndexList.push(index)
    }
  })

  // 再按顺序填充非后缀元素，直到容量耗尽
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.suffix)
      continue
    if (used + item.span > capacity)
      break
    used += item.span
    displayIndexList.push(i)
  }

  const overflow = items.some((item, index) => !item.suffix && !displayIndexList.includes(index))

  return {
    overflow,
    displayIndexList,
  }
}
