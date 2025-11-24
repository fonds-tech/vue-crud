import type { ComputedRef, InjectionKey } from "vue"

export type GridBreakpoint = "xxl" | "xl" | "lg" | "md" | "sm" | "xs"

/** 响应式值配置 */
export type ResponsiveValue = number | Partial<Record<GridBreakpoint, number>>

export interface GridProps {
  cols?: ResponsiveValue
  rowGap?: ResponsiveValue
  colGap?: ResponsiveValue
  collapsed?: boolean
  collapsedRows?: number
}

export interface GridItemProps {
  span?: ResponsiveValue
  offset?: ResponsiveValue
  suffix?: boolean
}

export interface GridItemState {
  id: symbol
  span: ComputedRef<number>
  offset: ComputedRef<number>
  suffix: ComputedRef<boolean>
}

export interface GridContext {
  cols: ComputedRef<number>
  colGap: ComputedRef<number>
  rowGap: ComputedRef<number>
  collapsed: ComputedRef<boolean>
  collapsedRows: ComputedRef<number>
  width: ComputedRef<number>
  overflow: ComputedRef<boolean>
  visibilityMap: ComputedRef<Map<symbol, boolean>>
  registerItem: (state: GridItemState) => void
  unregisterItem: (id: symbol) => void
  isItemVisible: (id: symbol) => boolean
}

export const gridInjectionKey: InjectionKey<GridContext> = Symbol("fd-grid")
