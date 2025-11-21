import type { VNodeChild, CSSProperties, Component as VueComponent } from "vue"
import type {
  FormProps,
  FormInstance,
  FormItemProp,
  FormItemRule,
  FormItemProps,
  FormValidateCallback,
} from "element-plus"

/**
 * 深度可选类型。
 */
export type DeepPartial<T> = T extends Record<string, any>
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T

/**
 * 表单模型类型。
 */
export type FormModel<T extends Record<string, unknown> = Record<string, unknown>> = T

/**
 * 表单可选字段名。
 */
export type FormField<T extends FormModel = FormModel> = keyof T | string

/**
 * 表单关闭行为。
 */
export type FormCloseAction = "close" | "save" | (string & {})

/**
 * 表单使用模式。
 */
export type FormMode = "add" | "update" | "info" | (string & {})

/**
 * 渲染上下文。
 */
export interface FormRenderContext<T extends FormModel = FormModel> {
  /**
   * 当前表单模型。
   */
  model: T
  /**
   * 当前表单项。
   */
  item?: FormItem<T>
  /**
   * 当前字段标识。
   */
  field?: FormField<T>
}

/**
 * 可渲染内容。
 */
export type FormRenderContent<T extends FormModel = FormModel>
  = | VNodeChild
    | ((ctx: FormRenderContext<T>) => VNodeChild)

/**
 * 组件属性解析函数。
 */
export type FormComponentPropsResolver<T extends FormModel = FormModel>
  = | Record<string, any>
    | ((ctx: FormRenderContext<T>) => Record<string, any>)

/**
 * 组件事件解析函数。
 */
export type FormComponentEventsResolver<T extends FormModel = FormModel>
  = | Record<string, (...args: any[]) => any>
    | ((ctx: FormRenderContext<T>) => Record<string, (...args: any[]) => any>)

/**
 * 组件插槽内容解析函数。
 */
export type FormComponentSlotsResolver<T extends FormModel = FormModel>
  = | Record<string, FormRenderContent<T>>
    | ((ctx: FormRenderContext<T>) => Record<string, FormRenderContent<T>>)

/**
 * 组件样式解析函数。
 */
export type FormComponentStyleResolver<T extends FormModel = FormModel>
  = | CSSProperties
    | ((ctx: FormRenderContext<T>) => CSSProperties)

/**
 * 组件选项解析函数。
 */
export type FormComponentOptionsResolver<T extends FormModel = FormModel>
  = | any[]
    | ((ctx: FormRenderContext<T>) => any[])

/**
 * 表单项组件描述。
 */
export interface FormComponent<T extends FormModel = FormModel> {
  /**
   * 组件定义，可为标签名、组件或渲染函数。
   */
  is?:
    | string
    | VueComponent
    | VNodeChild
    | ((ctx: FormRenderContext<T>) => string | VueComponent | VNodeChild)
  /**
   * 组件 props。
   */
  props?: FormComponentPropsResolver<T>
  /**
   * 组件事件。
   */
  on?: FormComponentEventsResolver<T>
  /**
   * 组件样式。
   */
  style?: FormComponentStyleResolver<T>
  /**
   * 组件插槽。
   */
  slots?: FormComponentSlotsResolver<T>
  /**
   * 组件选项数据。
   */
  options?: FormComponentOptionsResolver<T>
  /**
   * 组件 ref 回调。
   */
  ref?: (el?: any) => void
  /**
   * 挂载在父组件插槽名。
   */
  slot?: string | ((ctx: FormRenderContext<T>) => string)
}

/**
 * 钩子执行阶段。
 */
export type FormHookPhase = "bind" | "submit"

/**
 * 预置钩子关键字。
 */
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
    | (string & {})

/**
 * 钩子函数。
 */
export type FormHookFn<T extends FormModel = FormModel> = (
  value: any,
  ctx: { model: T, field: FormField<T>, method: FormHookPhase },
) => any

/**
 * 钩子管道片段。
 */
export type FormHookPipe<T extends FormModel = FormModel> = FormHookKey | FormHookFn<T>

/**
 * 钩子配置。
 */
export type FormHook<T extends FormModel = FormModel>
  = | FormHookPipe<T>
    | FormHookPipe<T>[]
    | {
      bind?: FormHookPipe<T> | FormHookPipe<T>[]
      submit?: FormHookPipe<T> | FormHookPipe<T>[]
    }

/**
 * Tabs 标签项。
 */
export interface FormTabPane {
  /**
   * 标签文本。
   */
  label: string
  /**
   * 标签值。
   */
  value: string
  /**
   * 用于 merge prop 的自定义名称。
   */
  name?: string
  /**
   * 自定义图标。
   */
  icon?: VNodeChild
  /**
   * 懒加载标识。
   */
  lazy?: boolean
  /**
   * 自定义扩展。
   */
  [key: string]: any
}

/**
 * Tabs 组件配置。
 */
export interface FormTabsProps {
  /**
   * 标签列表。
   */
  labels?: FormTabPane[]
  /**
   * 标签文本对齐方式。
   */
  justify?: "left" | "center" | "right"
  /**
   * 标签激活色。
   */
  color?: string
  /**
   * 是否自动合并 prop。
   */
  mergeProp?: boolean
  /**
   * 标签宽度。
   */
  labelWidth?: string
  /**
   * 自定义错误提示。
   */
  error?: string
  /**
   * 是否展示错误信息。
   */
  showMessage?: boolean
  /**
   * 是否内联显示错误信息。
   */
  inlineMessage?: boolean
  /**
   * 标签尺寸。
   */
  size?: "large" | "default" | "small"
  /**
   * 其他 Element Plus Tabs 属性。
   */
  [key: string]: any
}

/**
 * 表单项上下文。
 */
export interface FormItemContext<T extends FormModel = FormModel> {
  /**
   * 表单模型。
   */
  model: T
  /**
   * 当前表单项定义。
   */
  item: FormItem<T>
}

/**
 * 表单项定义。
 */
export interface FormItem<T extends FormModel = FormModel>
  extends Partial<Omit<FormItemProps, "prop" | "rules" | "required">> {
  /**
   * 表单项类型。
   */
  type?: "tabs" | (string & {})
  /**
   * 字段标识。
   */
  field?: FormField<T>
  /**
   * 原生元素的 prop。
   */
  prop?: FormItemProp
  /**
   * 所属分组。
   */
  group?: string
  /**
   * 栅格占位。
   */
  span?: number
  /**
   * el-col 参数。
   */
  col?: Record<string, any>
  /**
   * 折叠状态。
   */
  collapse?: boolean
  /**
   * 是否自适应宽度。
   */
  flex?: boolean
  /**
   * 默认值。
   */
  value?: any
  /**
   * 标签文本。
   */
  label?: string
  /**
   * 自定义标签渲染。
   */
  renderLabel?: FormRenderContent<T>
  /**
   * 额外内容（前置）。
   */
  prepend?: FormRenderContent<T>
  /**
   * 额外内容（后置）。
   */
  append?: FormRenderContent<T>
  /**
   * 自定义帮助文本。
   */
  help?: string
  /**
   * 表单项组件配置。
   */
  component?: FormComponent<T>
  /**
   * 子表单项。
   */
  children?: FormItem<T>[]
  /**
   * 数据钩子。
   */
  hook?: FormHook<T>
  /**
   * 是否隐藏。
   */
  hidden?: boolean | ((ctx: FormItemContext<T>) => boolean)
  /**
   * 是否禁用。
   */
  disabled?: boolean | ((ctx: FormItemContext<T>) => boolean)
  /**
   * 是否必填。
   */
  required?: boolean | ((ctx: FormItemContext<T>) => boolean)
  /**
   * 验证规则。
   */
  rules?: FormItemRule | FormItemRule[]
  /**
   * 自定义属性。
   */
  [key: string]: any
}

/**
 * 表单操作按钮。
 */
export interface FormOperationButton<T extends FormModel = FormModel> {
  /**
   * 按钮文本。
   */
  label: string
  /**
   * Element Plus 按钮类型。
   */
  type?: string
  /**
   * 透传属性。
   */
  props?: Record<string, any>
  /**
   * 点击事件。
   */
  onClick?: (ctx: { model: T }) => void
  /**
   * 自定义渲染。
   */
  render?: FormRenderContent<T>
}

/**
 * 表单底部操作配置。
 */
export interface FormOperationConfig<T extends FormModel = FormModel> {
  /**
   * 是否隐藏操作栏。
   */
  hidden?: boolean
  /**
   * 保存按钮文本。
   */
  saveButtonText?: string
  /**
   * 关闭按钮文本。
   */
  closeButtonText?: string
  /**
   * 水平排列方式。
   */
  justify?: CSSProperties["justifyContent"]
  /**
   * 自定义按钮列表。
   */
  buttons?: Array<FormCloseAction | FormOperationButton<T> | `slot-${string}`>
}

/**
 * 表单对话框配置。
 */
export interface FormDialogConfig {
  /**
   * 弹窗标题。
   */
  title?: FormRenderContent
  /**
   * 高度。
   */
  height?: string | number
  /**
   * 宽度。
   */
  width?: string | number
  /**
   * 是否隐藏头部。
   */
  hideHeader?: boolean
  /**
   * 自定义 Element Plus Dialog 属性。
   */
  [key: string]: any
}

/**
 * 表单事件。
 */
export interface FormEvents<T extends FormModel = FormModel> {
  /**
   * 打开时触发。
   */
  open?: (model: T) => void
  /**
   * 关闭前触发。
   */
  close?: (action: FormCloseAction, done: () => void) => void
  /**
   * 提交回调。
   */
  submit?: (model: T, helpers: { close: (action?: FormCloseAction) => void, done: () => void }) => void
  /**
   * 数据变更回调。
   */
  change?: (model: T, field: FormField<T>) => void
}

/**
 * 表单配置。
 */
export interface FormConfig<T extends FormModel = FormModel> {
  /**
   * 表单标题。
   */
  title?: FormRenderContent<T>
  /**
   * 表单高度。
   */
  height?: string | number
  /**
   * 表单宽度。
   */
  width?: string | number
  /**
   * 表单属性。
   */
  props: FormProps
  /**
   * 表单项列表。
   */
  items: FormItem<T>[]
  /**
   * 底部操作栏。
   */
  op: FormOperationConfig<T>
  /**
   * 弹窗配置。
   */
  dialog: FormDialogConfig
  /**
   * 事件回调。
   */
  on?: FormEvents<T>
  /**
   * 是否在打开时清理表单。
   */
  isReset?: boolean
  /**
   * 表单内部数据。
   */
  _data?: Record<string, any>
  /**
   * 表单默认数据。
   */
  form: T
  /**
   * 其他扩展。
   */
  [key: string]: any
}

/**
 * 表单插件。
 */
export type FormPlugin<T extends FormModel = FormModel> = (ctx: {
  /**
   * 组件暴露实例。
   */
  exposed: FormExpose<T>
  /**
   * 打开事件注册。
   */
  onOpen: (cb: () => void) => void
  /**
   * 关闭事件注册。
   */
  onClose: (cb: () => void) => void
  /**
   * 提交事件注册。
   */
  onSubmit: (cb: (model: T) => T | Promise<T>) => void
}) => void

/**
 * Tabs 运行时能力。
 */
export interface FormTabsExpose<T extends FormModel = FormModel> {
  /**
   * 当前激活值。
   */
  active?: string
  /**
   * 标签列表。
   */
  list: FormTabPane[]
  /**
   * 切换标签。
   */
  change: (value: string, validate?: boolean) => Promise<void>
  /**
   * 设置当前值。
   */
  set: (value?: string) => void
  /**
   * 清空状态。
   */
  clear: () => void
  /**
   * 是否已加载。
   */
  isLoaded: (value?: string) => boolean
  /**
   * 合并子项 prop。
   */
  mergeProp: (item: FormItem<T>) => void
  /**
   * 根据 prop 跳转分组。
   */
  toGroup: (options: { prop: FormField<T> }) => void
}

/**
 * 表单提交辅助。
 */
export interface FormSubmitHelpers {
  /**
   * 关闭表单。
   */
  close: (action?: FormCloseAction) => void
  /**
   * 结束保存状态。
   */
  done: () => void
}

/**
 * 表单暴露实例。
 */
export interface FormExpose<T extends FormModel = FormModel> {
  /**
   * 组件名称。
   */
  name?: string
  /**
   * DOM/组件引用。
   */
  refs: Record<string, any>
  /**
   * el-form 实例。
   */
  Form: FormInstance | undefined
  /**
   * 表单数据。
   */
  form: T
  /**
   * 当前配置。
   */
  config: FormConfig<T>
  /**
   * 显示状态。
   */
  visible: boolean
  /**
   * 保存状态。
   */
  saving: boolean
  /**
   * 加载状态。
   */
  loading: boolean
  /**
   * 禁用状态。
   */
  disabled: boolean
  /**
   * Tabs 能力。
   */
  Tabs: FormTabsExpose<T>
  /**
   * 打开表单。
   */
  open: (options: FormOptions<T>, plugins?: FormPlugin<T>[]) => void
  /**
   * 关闭表单。
   */
  close: (action?: FormCloseAction) => void
  /**
   * 保存结束。
   */
  done: () => void
  /**
   * 清空表单。
   */
  clear: () => void
  /**
   * 重置表单。
   */
  reset: () => void
  /**
   * 打开加载状态。
   */
  showLoading: () => void
  /**
   * 关闭加载状态。
   */
  hideLoading: () => void
  /**
   * 设置禁用。
   */
  setDisabled: (flag?: boolean) => void
  /**
   * 处理嵌套数据。
   */
  invokeData: (data: Record<string, any>) => void
  /**
   * 绑定表单。
   */
  bindForm: (data: Partial<T>) => void
  /**
   * 获取字段值。
   */
  getForm: (field?: FormField<T>) => any
  /**
   * 设置字段值。
   */
  setForm: (field: FormField<T>, value: any) => void
  /**
   * 设置配置数据。
   */
  setData: (field: FormField<T>, value: any) => void
  /**
   * 更新选项。
   */
  setOptions: (field: FormField<T>, list: any[]) => void
  /**
   * 更新组件 props。
   */
  setProps: (field: FormField<T>, props: Record<string, any>) => void
  /**
   * 更新配置。
   */
  setConfig: (path: string, value: any) => void
  /**
   * 切换表单项。
   */
  toggleItem: (field: FormField<T>, flag?: boolean) => void
  /**
   * 隐藏表单项。
   */
  hideItem: (fields: FormField<T> | FormField<T>[]) => void
  /**
   * 显示表单项。
   */
  showItem: (fields: FormField<T> | FormField<T>[]) => void
  /**
   * 设置标题。
   */
  setTitle: (value: string) => void
  /**
   * 表单提交。
   */
  submit: (callback?: (model: T, helpers: FormSubmitHelpers) => void) => void
  /**
   * 验证表单。
   */
  validate: (callback?: FormValidateCallback) => ReturnType<FormInstance["validate"]>
  /**
   * 验证字段。
   */
  validateField: (
    props?: FormItemProp | FormItemProp[],
    callback?: FormValidateCallback,
  ) => ReturnType<FormInstance["validateField"]>
  /**
   * 重置字段。
   */
  resetFields: (props?: FormItemProp | FormItemProp[]) => void
  /**
   * 清除校验。
   */
  clearValidate: (props?: FormItemProp | FormItemProp[]) => void
  /**
   * 滚动到字段。
   */
  scrollToField: (prop: FormItemProp) => void
}

/**
 * 表单打开参数。
 */
export type FormOptions<T extends FormModel = FormModel> = DeepPartial<FormConfig<T>> & {
  /**
   * 自定义表单项。
   */
  items?: FormItem<T>[]
}
