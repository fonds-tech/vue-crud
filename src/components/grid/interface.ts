import type { Ref, ComputedRef, InjectionKey } from "vue"

/** 栅格响应式断点配置 */
export interface ResponsiveValue {
  xxl?: number
  xl?: number
  lg?: number
  md?: number
  sm?: number
  xs?: number
}

/** 栅格容器属性 */
export interface GridProps {
  cols?: number | ResponsiveValue
  rowGap?: number | ResponsiveValue
  colGap?: number | ResponsiveValue
  collapsed?: boolean
  collapsedRows?: number
}

/** 栅格子项属性 */
export interface GridItemProps {
  span?: number | ResponsiveValue
  offset?: number | ResponsiveValue
  suffix?: boolean
}

/** 栅格子项的归一化数据 */
export interface GridItemData {
  span: number
  offset: number
  suffix?: boolean
}

/** Grid 提供给子项的上下文 */
export interface GridContextState {
  cols: ComputedRef<number>
  colGap: ComputedRef<number>
  displayIndexList: ComputedRef<number[]>
  overflow: ComputedRef<boolean>
  viewportWidth: Ref<number>
}

/** GridItem 注册与数据收集器 */
export interface GridCollector {
  registerItem: () => number
  collectItemData: (index: number, data: GridItemData) => void
  removeItemData: (index: number) => void
}

export const GRID_CONTEXT_KEY: InjectionKey<GridContextState> = Symbol("fd-grid-context")
export const GRID_COLLECTOR_KEY: InjectionKey<GridCollector> = Symbol("fd-grid-collector")
