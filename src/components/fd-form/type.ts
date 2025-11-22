import type { Arrayable } from "element-plus/es/utils"
import type { VNodeChild, CSSProperties, Component as VueComponent } from "vue"
import type {
  FormProps,
  FormInstance,
  FormItemProp,
  FormItemRule,
  FormItemProps,
  FormValidateCallback,
  FormValidationResult,
} from "element-plus"

export type FormRecord = Record<string, any>
export type FormField = keyof FormRecord | string
export type FormMode = "add" | "update"
export type FormModel = FormRecord

export type FormHookKey
  = | "number"
    | "string"
    | "split"
    | "join"
    | "boolean"
    | "booleanNumber"
    | "datetimeRange"
    | "splitJoin"
    | "json"
    | "empty"

export type FormHookFn = (value: any, options: { model: FormRecord, field: string, method: "submit" | "bind" }) => any
export type FormHookPipe = FormHookKey | FormHookFn
export type FormHook
  = | FormHookPipe
    | FormHookPipe[]
    | {
      bind?: FormHookPipe | FormHookPipe[]
      submit?: FormHookPipe | FormHookPipe[]
    }

export type FormMaybeFn<T, M extends FormRecord = FormRecord> = T | ((model: M) => T)

export type FormComponentSlot<T extends FormRecord = FormRecord> = string | VueComponent | FormComponent<T> | (() => VNodeChild)

export interface FormComponent<T extends FormRecord = FormRecord> {
  is?: FormMaybeFn<string | VueComponent, T>
  on?: FormMaybeFn<Record<string, (...args: any[]) => void>, T>
  ref?: (instance?: unknown) => void
  slot?: FormMaybeFn<string | undefined, T>
  style?: FormMaybeFn<CSSProperties | undefined, T>
  props?: FormMaybeFn<Record<string, any>, T>
  slots?: FormMaybeFn<Record<string, FormComponentSlot<T>>, T>
  options?: FormMaybeFn<any[], T>
}

export type FormItemRuleWithMeta = FormItemRule & { _inner?: boolean }
export type InternalRule = FormItemRuleWithMeta

export interface FormItem<T extends FormRecord = FormRecord> extends Omit<FormItemProps, "prop" | "rules" | "required"> {
  field: keyof T | string
  label?: string
  value?: any
  span?: number
  offset?: number
  help?: string
  extra?: FormMaybeFn<string | undefined, T>
  tooltip?: string
  rules?: FormItemRuleWithMeta | FormItemRuleWithMeta[]
  hook?: FormHook
  slots?: FormMaybeFn<Record<string, FormComponentSlot<T>>, T>
  group?: string
  hidden?: FormMaybeFn<boolean, T>
  disabled?: FormMaybeFn<boolean, T>
  component: FormComponent<T>
  required?: FormMaybeFn<boolean, T>
}

export interface FormGroupChild<T extends FormRecord = FormRecord> {
  name: string
  title?: string
  component: FormComponent<T>
}

export interface FormGroup<T extends FormRecord = FormRecord> {
  type?: "tabs" | "steps"
  component?: FormComponent<T>
  children?: FormGroupChild<T>[]
}

export interface FormLayout {
  row: {
    gutter?: number
    justify?: "start" | "center" | "end" | "space-around" | "space-between"
    align?: "top" | "middle" | "bottom"
    collapsed?: boolean
    collapsedRows?: number
  }
  column: {
    span?: number
    offset?: number
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

export interface FormOptions<T extends FormRecord = FormRecord> {
  key: number
  form: Partial<Omit<FormProps, "model">>
  mode: FormMode
  model: T
  items: Array<FormItem<T>>
  group: FormGroup<T>
  layout: FormLayout
  onNext?: (model: T, ctx: { next: () => void }) => void
  onSubmit?: (model: T, errors: Record<string, any> | undefined) => void
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, any> ? DeepPartial<T[K]> : T[K]
}

export type FormUseOptions<T extends FormRecord = FormRecord> = DeepPartial<FormOptions<T>> & Record<string, any>

export interface FormActions<T extends FormRecord = FormRecord> {
  setMode: (mode: FormMode) => void
  getField: (field?: keyof T | string) => any
  setField: (field: keyof T | string, value: any) => void
  setItem: (field: keyof T | string, data: Partial<FormItem<T>>) => void
  bindFields: (data: Partial<T>) => void
  setData: (path: string, value: any) => void
  setOptions: (field: keyof T | string, value: any[]) => void
  getOptions: (field: keyof T | string) => any[] | undefined
  setProps: (field: keyof T | string, value: Record<string, any>) => void
  setStyle: (field: keyof T | string, style: Record<string, any>) => void
  hideItem: (field: keyof T | string | Array<keyof T | string>) => void
  showItem: (field: keyof T | string | Array<keyof T | string>) => void
  collapse: (state?: boolean) => void
  setRequired: (field: keyof T | string, required: boolean) => void
}

export interface FormMethods<T extends FormRecord = FormRecord> {
  validate: (callback?: FormValidateCallback) => FormValidationResult
  validateField: (props?: Arrayable<FormItemProp>, callback?: FormValidateCallback) => FormValidationResult
  resetFields: (props?: Arrayable<FormItemProp>) => void
  clearFields: (field?: Arrayable<FormItemProp>) => void
  clearValidate: (props?: Arrayable<FormItemProp>) => void
  setFields: (data: Record<string, any>) => void
  scrollToField: (prop: FormItemProp) => void
  submit: (
    callback?: (model: T, errors: Record<string, any> | undefined) => void,
  ) => Promise<{ values: T, errors: Record<string, any> | undefined }>
}

export interface FormExpose<T extends FormRecord = FormRecord> extends FormActions<T>, FormMethods<T> {
  id: string | number
  form?: FormInstance
  mode: FormMode
  model: T
  items: Array<FormItem<T>>
  use: (options?: FormUseOptions<T>) => void
  next: () => void
  prev: () => void
}

export type FormRef<T extends FormRecord = FormRecord> = FormExpose<T>
