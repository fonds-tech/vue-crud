import type { FormRef, FormRecord, FormUseOptions } from "./form"
import type { VNodeChild, CSSProperties, Component as VueComponent } from "vue"

export type SearchMaybeFn<T> = T | ((model: FormRecord) => T)
export type SearchSlotContent = VNodeChild | ((model: FormRecord) => VNodeChild)

export interface SearchActionComponent {
  is?: SearchMaybeFn<string | VueComponent>
  on?: SearchMaybeFn<Record<string, (...args: any[]) => void>>
  props?: SearchMaybeFn<Record<string, any>>
  style?: SearchMaybeFn<CSSProperties>
  slots?: SearchMaybeFn<Record<string, SearchSlotContent>>
}

export interface SearchAction {
  type?: "search" | "reset" | "collapse"
  text?: string
  span?: number
  offset?: number
  slot?: SearchMaybeFn<string | undefined>
  visible?: SearchMaybeFn<boolean>
  props?: Record<string, any>
  component?: SearchActionComponent
}

export interface SearchLayout {
  actions?: {
    gutter?: number
    justify?: "start" | "center" | "end" | "space-between" | "space-around"
    align?: "top" | "middle" | "bottom"
    span?: number
  }
}

export type SearchHook<T extends FormRecord = FormRecord> = (
  model: T,
  ctx: { next: (params?: Record<string, any>) => Promise<any> },
) => void | Promise<void>

export interface SearchUseOptions<T extends FormRecord = FormRecord> {
  form?: FormUseOptions<T>
  actions?: SearchAction[]
  layout?: SearchLayout
  onSearch?: SearchHook<T>
  onReset?: SearchHook<T>
}

export interface SearchRef<T extends FormRecord = FormRecord> extends Omit<FormRef<T>, "use"> {
  use: (options?: SearchUseOptions<T>) => void
  search: (params?: Record<string, any>) => Promise<unknown>
  reset: (params?: Record<string, any>) => Promise<unknown>
}
