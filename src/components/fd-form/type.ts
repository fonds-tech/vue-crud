import type { Arrayable } from "element-plus/es/utils"
import type { GridProps, GridItemProps } from "../fd-grid/type"
import type { VNode, VNodeChild, CSSProperties, Component as VueComponent } from "vue"
import type {
  FormProps,
  FormInstance,
  FormItemProp,
  FormItemRule,
  FormItemProps,
  FormValidateCallback,
  FormValidationResult,
} from "element-plus"

/**
 * 表单配置对象
 */
export interface FormOptions<T extends FormRecord = FormRecord> {
  /**
   * 唯一键，用于强制刷新渲染
   */
  key: number
  /**
   * Element Plus Form 原生属性
   * @description label-width, label-position 等
   */
  form: Partial<Omit<FormProps, "model">>
  /**
   * 当前模式
   */
  mode: FormMode
  /**
   * 表单数据模型
   */
  model: T
  /**
   * 表单项列表
   */
  items: Array<FormItem<T>>
  /**
   * 分组配置
   */
  group: FormGroup<T>
  /**
   * 栅格配置 (fd-grid)
   */
  grid?: GridProps
  /**
   * 下一步回调
   * @description 仅在 steps 布局下有效
   */
  onNext?: (model: T, ctx: { next: () => void }) => void
  /**
   * 提交回调
   */
  onSubmit?: (model: T, errors: Record<string, any> | undefined) => void
}

/**
 * 表单数据记录类型
 * @description 键为字段名，值为任意类型的表单数据对象
 */
export type FormRecord = Record<string, any>

/**
 * 表单字段键类型
 * @description 可以是 FormRecord 的键或任意字符串路径
 */
export type FormField = keyof FormRecord | string

/**
 * 表单操作模式
 * @description 'add' 为新增模式，'update' 为编辑模式
 */
export type FormMode = "add" | "update"

/**
 * 表单模型类型别名
 */
export type FormModel = FormRecord

/**
 * 内置表单数据转换钩子的键名
 * @description
 * - `number`: 强制转换为数字类型 (bind/submit)
 * - `string`: 强制转换为字符串类型 (bind/submit)
 * - `split`: 字符串按逗号分割为数组 (bind)
 * - `join`: 数组按逗号合并为字符串 (submit)
 * - `boolean`: 强制转换为布尔值 (bind/submit)
 * - `booleanNumber`: 布尔值转换为 1/0 (submit) / 1/0 转换为布尔值 (bind)
 * - `datetimeRange`: 自动处理日期范围数组与起始/结束字段的映射 (bind/submit)
 * - `splitJoin`: 组合 split(bind) 和 join(submit) 的功能
 * - `json`: JSON 字符串与对象之间的转换 (bind: parse, submit: stringify)
 * - `empty`: 空字符串/空数组转换为 undefined (submit)
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

/**
 * 自定义表单钩子函数
 * @param value 当前字段的值
 * @param options 钩子上下文选项
 * @returns 转换后的值
 */
export type FormHookFn = (value: any, options: { model: FormRecord, field: string, method: "submit" | "bind" }) => any

/**
 * 单个表单钩子配置
 * @description 可以是内置钩子名或自定义函数
 */
export type FormHookPipe = FormHookKey | FormHookFn

/**
 * 表单数据转换钩子配置
 * @description 用于在数据绑定到表单(bind)和提交表单(submit)时对数据进行转换
 * - 可以是单个钩子
 * - 可以是钩子数组（按顺序执行）
 * - 可以是对象，分别指定 bind 和 submit 阶段的钩子
 */
export type FormHook
  = | FormHookPipe
    | FormHookPipe[]
    | {
      bind?: FormHookPipe | FormHookPipe[]
      submit?: FormHookPipe | FormHookPipe[]
    }

/**
 * 表单动态值类型
 * @description 值可以是静态的 T 类型，也可以是返回 T 类型的函数
 * @template T 值的类型
 * @template M 表单模型的类型
 */
export type FormMaybeFn<T, M extends FormRecord = FormRecord> = T | ((model: M) => T)

/**
 * 表单组件插槽内容类型
 * @description 支持字符串、Vue组件、表单组件配置对象、VNode 或渲染函数
 */
export type FormComponentSlot<T extends FormRecord = FormRecord>
  = | string
    | VueComponent
    | VNode
    | FormComponent<T>
    | (() => VNodeChild)

/**
 * 表单内部组件配置接口
 * @description 定义表单项中具体控件(Input, Select等)的渲染行为
 */
export interface FormComponent<T extends FormRecord = FormRecord> {
  /**
   * 组件类型或组件名
   * @example 'el-input', import('vue').Component
   */
  is?: FormMaybeFn<string | VueComponent | VNode | (() => VNodeChild), T>
  /**
   * 组件事件监听器
   * @example { change: (val) => console.log(val) }
   */
  on?: FormMaybeFn<Record<string, (...args: any[]) => void>, T>
  /**
   * 组件 ref 回调
   */
  ref?: (instance?: unknown) => void
  /**
   * 组件默认插槽内容
   */
  slot?: FormMaybeFn<string | undefined, T>
  /**
   * 组件内联样式
   */
  style?: FormMaybeFn<CSSProperties | undefined, T>
  /**
   * 组件 Props
   * @description 传递给组件的属性
   */
  props?: FormMaybeFn<Record<string, any>, T>
  /**
   * 组件具名插槽
   * @description 传递给组件的插槽内容
   */
  slots?: FormMaybeFn<Record<string, FormComponentSlot<T>>, T>
  /**
   * 选项数据
   * @description 通常用于 Select/Radio/Checkbox 等组件的数据源
   */
  options?: FormMaybeFn<any[], T>
}

/**
 * 带有元数据的表单校验规则
 */
export type FormItemRuleWithMeta = FormItemRule & { _inner?: boolean }
export type InternalRule = FormItemRuleWithMeta

/**
 * 表单项配置接口
 * @description 定义表单中每一个字段的显示、交互和校验逻辑
 */
export interface FormItem<T extends FormRecord = FormRecord> extends Omit<FormItemProps, "prop" | "rules" | "required"> {
  /**
   * 字段名
   * @description 对应 FormModel 中的属性路径
   */
  field: keyof T | string
  /**
   * 标签文本
   */
  label?: string
  /**
   * 默认值
   */
  value?: any
  /**
   * 栅格占据的列数 (共24格)
   * @default 24
   */
  span?: GridItemProps["span"]
  /**
   * 栅格左侧的间隔格数
   */
  offset?: GridItemProps["offset"]
  /**
   * 帮助文本
   * @description 显示在 Label 旁边的提示信息
   */
  help?: string
  /**
   * 额外信息
   * @description 显示在控件下方的辅助文本
   */
  extra?: FormMaybeFn<string | undefined, T>
  /**
   * 工具提示
   * @description 鼠标悬停时显示的提示信息
   */
  tooltip?: string
  /**
   * 校验规则
   * @description Element Plus 的校验规则对象或数组
   */
  rules?: FormItemRuleWithMeta | FormItemRuleWithMeta[]
  /**
   * 数据转换钩子
   * @description 配置字段值的转换逻辑
   */
  hook?: FormHook
  /**
   * 表单项插槽
   * @description 自定义 label 或 error 插槽
   */
  slots?: FormMaybeFn<Record<string, FormComponentSlot<T>>, T>
  /**
   * 分组名称
   * @description 用于 Tabs 或 Steps 布局时指定所属分组
   */
  group?: string | number
  /**
   * 是否隐藏
   * @description 动态控制表单项的显示/隐藏
   */
  hidden?: FormMaybeFn<boolean, T>
  /**
   * 是否禁用
   * @description 动态控制表单项的禁用状态
   */
  disabled?: FormMaybeFn<boolean, T>
  /**
   * 控件组件配置
   * @required
   */
  component: FormComponent<T>
  /**
   * 是否必填
   * @description 动态控制是否显示必填星号及应用必填规则
   */
  required?: FormMaybeFn<boolean, T>
}

/**
 * 表单分组子项配置
 * @description 用于 Tabs 或 Steps 的每个面板/步骤配置
 */
export interface FormGroupChild<T extends FormRecord = FormRecord> {
  /**
   * 分组唯一标识
   */
  name: string | number
  /**
   * 分组标题
   */
  title?: string
  /**
   * 分组内容的包装组件
   * @description 可以为分组内容自定义渲染组件
   */
  component?: FormComponent<T>
}

/**
 * 表单分组配置
 * @description 用于将表单项组织为 Tabs 标签页或 Steps 步骤条
 */
export interface FormGroup<T extends FormRecord = FormRecord> {
  /**
   * 分组类型
   * - 'tabs': 标签页形式
   * - 'steps': 步骤条形式
   */
  type?: "tabs" | "steps"
  /**
   * 分组容器组件配置
   * @description 例如配置 ElTabs 或 ElSteps 的属性
   */
  component?: FormComponent<T>
  /**
   * 分组列表定义
   */
  children?: FormGroupChild<T>[]
}

/**
 * 深度可选类型
 * @description 将对象的所有属性递归变为可选
 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, any> ? DeepPartial<T[K]> : T[K]
}

/**
 * useForm 钩子的配置选项
 * @description 允许传递部分 FormOptions 来初始化表单
 */
export type FormUseOptions<T extends FormRecord = FormRecord> = DeepPartial<FormOptions<T>>

/**
 * 表单操作动作接口
 * @description 用于编程式控制表单状态
 */
export interface FormActions<T extends FormRecord = FormRecord> {
  /**
   * 切换表单模式 (add/update)
   */
  setMode: (mode: FormMode) => void
  /**
   * 获取字段值
   */
  getField: (field?: keyof T | string) => any
  /**
   * 设置字段值
   */
  setField: (field: keyof T | string, value: any) => void
  /**
   * 更新表单项配置
   * @param field 字段名
   * @param data 新的配置部分
   */
  setItem: (field: keyof T | string, data: Partial<FormItem<T>>) => void
  /**
   * 批量绑定数据到表单模型
   */
  bindFields: (data: Partial<T>) => void
  /**
   * 设置深层数据
   * @param path 属性路径 (e.g. 'user.name')
   */
  setData: (path: string, value: any) => void
  /**
   * 设置组件选项数据
   * @description 快捷更新 Select/Radio 等组件的 options
   */
  setOptions: (field: keyof T | string, value: any[]) => void
  /**
   * 获取组件选项数据
   */
  getOptions: (field: keyof T | string) => any[] | undefined
  /**
   * 设置组件 Props
   */
  setProps: (field: keyof T | string, value: Record<string, any>) => void
  /**
   * 设置组件样式
   */
  setStyle: (field: keyof T | string, style: Record<string, any>) => void
  /**
   * 隐藏表单项
   */
  hideItem: (field: keyof T | string | Array<keyof T | string>) => void
  /**
   * 显示表单项
   */
  showItem: (field: keyof T | string | Array<keyof T | string>) => void
  /**
   * 切换折叠状态
   */
  collapse: (state?: boolean) => void
  /**
   * 设置字段是否必填
   */
  setRequired: (field: keyof T | string, required: boolean) => void
}

/**
 * 表单原生方法接口
 * @description 代理了 Element Plus Form 实例的方法
 */
export interface FormMethods<T extends FormRecord = FormRecord> {
  /**
   * 验证表单
   */
  validate: (callback?: FormValidateCallback) => FormValidationResult
  /**
   * 验证特定字段
   */
  validateField: (props?: Arrayable<FormItemProp>, callback?: FormValidateCallback) => FormValidationResult
  /**
   * 重置字段（恢复初始值并移除校验结果）
   */
  resetFields: (props?: Arrayable<FormItemProp>) => void
  /**
   * 清除字段值
   */
  clearFields: (field?: Arrayable<FormItemProp>) => void
  /**
   * 清除校验结果
   */
  clearValidate: (props?: Arrayable<FormItemProp>) => void
  /**
   * 批量设置字段值（不触发特殊逻辑）
   */
  setFields: (data: Record<string, any>) => void
  /**
   * 滚动到指定字段
   */
  scrollToField: (prop: FormItemProp) => void
  /**
   * 提交表单
   * @description 触发验证并执行 onSubmit 回调
   */
  submit: (
    callback?: (model: T, errors: Record<string, any> | undefined) => void,
  ) => Promise<{ values: T, errors: Record<string, any> | undefined }>
}

/**
 * 表单组件对外暴露的完整接口
 * @description 包含 ref 实例可调用的所有属性和方法
 */
export interface FormExpose<T extends FormRecord = FormRecord> extends FormActions<T>, FormMethods<T> {
  /**
   * 表单 ID
   */
  id: string | number
  /**
   * Element Plus Form 原始实例
   */
  form?: FormInstance
  /**
   * 当前模式
   */
  mode: FormMode
  /**
   * 当前数据模型
   */
  model: T
  /**
   * 表单项配置列表
   */
  items: Array<FormItem<T>>
  /**
   * 初始化/更新表单配置
   */
  use: (options?: FormUseOptions<T>) => void
  /**
   * 下一步 (Steps 模式)
   */
  next: () => void
  /**
   * 上一步 (Steps 模式)
   */
  prev: () => void
}

/**
 * 表单 Ref 类型别名
 * @description 在 Vue 组件中使用 ref<FormRef>()
 */
export type FormRef<T extends FormRecord = FormRecord> = FormExpose<T>
