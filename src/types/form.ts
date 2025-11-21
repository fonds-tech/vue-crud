import type { VNodeChild, CSSProperties, Component as VueComponent } from "vue"
import type { FormInstance, FormItemProp, FormItemRule, FormValidateCallback } from "element-plus"

export type FormModel<T extends Record<string, any> = Record<string, any>> = T
export type FormField<T extends FormModel = FormModel> = keyof T | string
export type FormMode = "add" | "update" | "info" | (string & {})

export interface FormRenderContext<T extends FormModel = FormModel> {
  model: T
  field?: FormField<T>
}

export type FormRenderContent<T extends FormModel = FormModel> = VNodeChild | ((ctx: FormRenderContext<T>) => VNodeChild)

export type FormComponentResolver<T extends FormModel = FormModel, R = any> = R | ((ctx: FormRenderContext<T>) => R)

export interface FormComponent<T extends FormModel = FormModel> {
  is?: FormComponentResolver<T, string | VueComponent>
  props?: FormComponentResolver<T, Record<string, any>>
  style?: FormComponentResolver<T, CSSProperties>
  on?: FormComponentResolver<T, Record<string, (...args: any[]) => void>>
  slots?: FormComponentResolver<T, Record<string, FormRenderContent<T>>>
  options?: FormComponentResolver<T, any[]>
  ref?: (el: any) => void
  slot?: string
}

export type FormHookKey = "number" | "string" | "split" | "join" | "boolean" | "booleanNumber" | "datetimeRange" | "splitJoin" | "json" | "empty" | (string & {})

export type FormHookFn<T extends FormModel = FormModel> = (value: any, ctx: { model: T, field?: FormField<T>, method: "bind" | "submit" }) => any

export type FormHook<T extends FormModel = FormModel>
  = | FormHookKey
    | FormHookFn<T>
    | Array<FormHookKey | FormHookFn<T>>
    | {
      bind?: FormHookKey | FormHookFn<T> | Array<FormHookKey | FormHookFn<T>>
      submit?: FormHookKey | FormHookFn<T> | Array<FormHookKey | FormHookFn<T>>
    }

export interface FormItem<T extends FormModel = FormModel> {
  field?: FormField<T>
  label?: string
  span?: number
  extra?: FormRenderContent<T>
  required?: FormComponentResolver<T, boolean>
  disabled?: FormComponentResolver<T, boolean>
  hidden?: FormComponentResolver<T, boolean>
  collapse?: boolean
  value?: any
  hook?: FormHook<T>
  rules?: FormItemRule | FormItemRule[]
  component?: FormComponent<T>
  children?: FormItem<T>[]
  group?: string
}

export interface FormGroupPane<T extends FormModel = FormModel> {
  title: string
  component?: FormComponent<T>
  children?: FormComponent<T>[]
}

export interface FormGroup<T extends FormModel = FormModel> {
  type?: "steps" | "tabs"
  component?: FormComponent<T>
  children?: FormGroupPane<T>[]
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

export interface FormOptions<T extends FormModel = FormModel> {
  key: number
  mode: FormMode
  form: Record<string, any>
  layout: FormLayout
  group?: FormGroup<T>
  items: FormItem<T>[]
  model: T
  onNext?: (model: T, ctx: { next: () => void }) => void
  onSubmit?: (model: T, errors?: Record<string, any>) => void
}

export type FormUseOptions<T extends FormModel = FormModel> = Partial<Omit<FormOptions<T>, "key" | "model" | "items">> & {
  model?: Partial<T>
  items?: FormItem<T>[]
}

export interface FormSubmitResult<T extends FormModel = FormModel> {
  model: T
  errors?: Record<string, any>
}

export interface FormRef<T extends FormModel = FormModel> {
  id: string | number | undefined
  form?: FormInstance
  model: T
  items: FormItem<T>[]
  mode: FormMode
  use: (options: FormUseOptions<T>) => void
  next: () => void
  prev: () => void
  setMode: (mode: FormMode) => void
  getField: (field?: FormField<T>) => any
  setField: (field: FormField<T>, value: any) => void
  bindFields: (data?: Record<string, any>) => void
  setData: (path: string, value: any) => void
  setItem: (field: FormField<T>, data: Partial<FormItem<T>>) => void
  setProps: (field: FormField<T>, props: Record<string, any>) => void
  setStyle: (field: FormField<T>, style: CSSProperties) => void
  setOptions: (field: FormField<T>, list: any[]) => void
  getOptions: (field: FormField<T>) => any[]
  hideItem: (field: FormField<T> | FormField<T>[]) => void
  showItem: (field: FormField<T> | FormField<T>[]) => void
  collapse: (flag?: boolean) => void
  setRequired: (field: FormField<T>, required: boolean) => void
  submit: (callback?: (model: T, errors?: Record<string, any>) => void) => Promise<FormSubmitResult<T>>
  validate: (callback?: FormValidateCallback) => ReturnType<FormInstance["validate"]>
  validateField: (props?: FormItemProp | FormItemProp[], callback?: FormValidateCallback) => ReturnType<FormInstance["validateField"]>
  resetFields: (props?: FormItemProp | FormItemProp[]) => void
  clearFields: (props?: FormItemProp | FormItemProp[]) => void
  clearValidate: (props?: FormItemProp | FormItemProp[]) => void
  scrollToField: (prop: FormItemProp) => void
}
