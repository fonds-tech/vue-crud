import type { VNodeChild, CSSProperties, Component as VueComponent } from "vue"
import type { FormProps, FormInstance, FormItemProp, FormItemRule, FormValidateCallback } from "element-plus"

export type FormRecord = Record<string, any>
export type FormModel = FormRecord
export type FormField = string
export type FormMode = "add" | "update" | "info" | (string & {})

export interface FormRenderContext {
  model: FormRecord
  field?: FormField
}

export type FormRenderContent = VNodeChild | ((ctx: FormRenderContext) => VNodeChild)

export type FormComponentResolver<R = any> = R | ((ctx: FormRenderContext) => R)

export interface FormComponent {
  is?: FormComponentResolver<string | VueComponent>
  props?: FormComponentResolver<Record<string, any>>
  style?: FormComponentResolver<CSSProperties>
  on?: FormComponentResolver<Record<string, (...args: any[]) => void>>
  slots?: FormComponentResolver<Record<string, FormRenderContent>>
  options?: FormComponentResolver<any[]>
  ref?: (el: any) => void
  slot?: string
}

export type FormHookKey = "number" | "string" | "split" | "join" | "boolean" | "booleanNumber" | "datetimeRange" | "splitJoin" | "json" | "empty" | (string & {})

export type FormHookFn = (value: any, ctx: { model: FormModel, field?: FormField, method: "bind" | "submit" }) => any

export type FormHook
  = | FormHookKey
    | FormHookFn
    | Array<FormHookKey | FormHookFn>
    | {
      bind?: FormHookKey | FormHookFn | Array<FormHookKey | FormHookFn>
      submit?: FormHookKey | FormHookFn | Array<FormHookKey | FormHookFn>
    }

export interface FormItem {
  field?: FormField
  label?: string
  span?: number
  extra?: FormRenderContent
  required?: FormComponentResolver<boolean>
  disabled?: FormComponentResolver<boolean>
  hidden?: FormComponentResolver<boolean>
  collapse?: boolean
  value?: any
  hook?: FormHook
  rules?: FormItemRule | FormItemRule[]
  component?: FormComponent
  children?: FormItem[]
  group?: string
}

export interface FormGroupPane {
  title: string
  component?: FormComponent
  children?: FormComponent[]
}

export interface FormGroup {
  type?: "steps" | "tabs"
  component?: FormComponent
  children?: FormGroupPane[]
}

export interface FormLayout {
  grid: {
    cols: Partial<Record<"xs" | "sm" | "md" | "lg" | "xl" | "xxl", number>>
    rowGap: number
    colGap: number
    collapsed: boolean
    collapsedRows: number
  }
  column: {
    span: number
  }
}

export interface FormOptions {
  key: number
  mode: FormMode
  form: Partial<FormProps>
  layout: FormLayout
  group?: FormGroup
  items: FormItem[]
  model: FormRecord
  onNext?: (model: FormRecord, ctx: { next: () => void }) => void
  onSubmit?: (model: FormRecord, errors?: Record<string, any>) => void
}

export type FormUseOptions<T extends FormRecord = FormRecord> = Partial<Omit<FormOptions, "key" | "model" | "items">> & {
  model?: Partial<T>
  items?: FormItem[]
}

export interface FormSubmitResult<T extends FormRecord = FormRecord> {
  model: T
  errors?: Record<string, any>
}

export interface FormRef<T extends FormRecord = FormRecord> {
  id: string | number | undefined
  form?: FormInstance
  model: T
  items: FormItem[]
  mode: FormMode
  use: (options: FormUseOptions<T>) => void
  next: () => void
  prev: () => void
  setMode: (mode: FormMode) => void
  getField: (field?: FormField) => any
  setField: (field: FormField, value: any) => void
  bindFields: (data?: Record<string, any>) => void
  setData: (path: string, value: any) => void
  setItem: (field: FormField, data: Partial<FormItem>) => void
  setProps: (field: FormField, props: Record<string, any>) => void
  setStyle: (field: FormField, style: CSSProperties) => void
  setOptions: (field: FormField, list: any[]) => void
  getOptions: (field: FormField) => any[]
  hideItem: (field: FormField | FormField[]) => void
  showItem: (field: FormField | FormField[]) => void
  collapse: (flag?: boolean) => void
  setRequired: (field: FormField, required: boolean) => void
  submit: (callback?: (model: T, errors?: Record<string, any>) => void) => Promise<FormSubmitResult<T>>
  validate: (callback?: FormValidateCallback) => ReturnType<FormInstance["validate"]>
  validateField: (props?: FormItemProp | FormItemProp[], callback?: FormValidateCallback) => ReturnType<FormInstance["validateField"]>
  resetFields: (props?: FormItemProp | FormItemProp[]) => void
  clearFields: (props?: FormItemProp | FormItemProp[]) => void
  clearValidate: (props?: FormItemProp | FormItemProp[]) => void
  scrollToField: (prop: FormItemProp) => void
}
