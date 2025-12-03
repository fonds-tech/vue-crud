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
 * 表单配置对象接口
 * @description 定义整个动态表单的结构、行为和数据模型
 */
export interface FormOptions<T extends FormRecord = FormRecord> {
  /**
   * 唯一标识键
   * @description 用于强制重新渲染表单组件，通常在表单结构发生重大变化时更新此 key
   */
  key: number
  /**
   * Element Plus Form 原生属性配置
   * @description 包含 label-width, label-position, size 等原生属性
   * @see https://element-plus.org/zh-CN/component/form.html#form-attributes
   */
  form: Partial<Omit<FormProps, "model">>
  /**
   * 表单当前操作模式
   * @default 'add'
   */
  mode: FormMode
  /**
   * 表单数据模型对象
   * @description 存储表单的实时数据
   */
  model: T
  /**
   * 表单项（字段）配置列表
   * @description 核心配置，定义表单中包含哪些字段及其属性
   */
  items: Array<FormItem<T>>
  /**
   * 分组布局配置
   * @description 用于实现 Tabs 标签页或 Steps 步骤条布局
   */
  group: FormGroup<T>
  /**
   * 栅格布局配置
   * @description 控制表单整体的列数、间距等，基于 fd-grid 组件
   */
  grid?: GridProps
  /**
   * 下一步回调函数 (仅 Steps 模式)
   * @description 在步骤条模式下，点击“下一步”并通过校验后触发
   * @param values 当前表单数据
   * @param context 上下文对象
   * @param context.next 执行下一步切换的函数
   */
  onNext?: (values: T, context: { next: () => void }) => void
  /**
   * 表单提交回调函数
   * @description 点击提交按钮或调用 submit 方法并通过校验后触发
   * @param values 处理后的表单数据
   * @param errors 校验错误信息（如果有）
   */
  onSubmit?: (values: T, errors: Record<string, any> | undefined) => void
}

/**
 * 表单数据记录类型
 * @description 键为字段路径，值为任意数据
 */
export type FormRecord = Record<string, any>

/**
 * 表单字段标识类型
 * @description 可以是简单的属性名，也可以是点分隔的路径字符串
 */
export type FormField = keyof FormRecord | string

/**
 * 表单操作模式
 * @description
 * - 'add': 新增模式，通常显示所有字段，使用默认值
 * - 'update': 编辑模式，可能会禁用某些主键字段
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
 * 自定义表单钩子函数类型
 * @param value 当前字段的值
 * @param options 钩子上下文对象
 * @param options.model 完整的表单数据模型
 * @param options.field 当前字段的路径/键名
 * @param options.method 当前触发的阶段 ('bind' | 'submit')
 * @returns 转换后的值
 */
export type FormHookFn = (value: any, options: { model: FormRecord, field: string, method: "submit" | "bind" }) => any

/**
 * 单个表单钩子配置
 * @description 可以是内置钩子名称字符串，也可以是自定义函数
 */
export type FormHookPipe = FormHookKey | FormHookFn

/**
 * 表单数据转换钩子配置
 * @description 用于在数据绑定到表单(bind)和提交表单(submit)时对数据进行双向转换
 */
export type FormHook
  = | FormHookPipe
    | FormHookPipe[]
    | {
      /** 绑定阶段：数据源 -> 表单模型 */
      bind?: FormHookPipe | FormHookPipe[]
      /** 提交阶段：表单模型 -> 提交数据 */
      submit?: FormHookPipe | FormHookPipe[]
    }

/**
 * 动态属性值类型
 * @description 属性值可以是静态值，也可以是接收当前 model 并返回值的函数
 * @template T 值的静态类型
 * @template M 表单模型的类型
 */
export type FormMaybeFn<T, M extends FormRecord = FormRecord> = T | ((model: M) => T)

/**
 * 表单组件插槽内容类型
 * @description 支持多种形式的组件渲染内容
 */
export type FormComponentSlot<T extends FormRecord = FormRecord>
  = | string
    | VueComponent
    | VNode
    | FormComponent<T>
    | (() => VNodeChild)

/**
 * 表单内部组件详细配置
 * @description 定义表单项所使用的具体控件(如 Input, Select)的属性和行为
 */
export interface FormComponent<T extends FormRecord = FormRecord> {
  /**
   * 组件类型标识或组件本身
   * @example 'el-input', 'my-custom-component', import('vue').Component
   */
  is?: FormMaybeFn<string | VueComponent | VNode | (() => VNodeChild), T>
  /**
   * 组件事件监听器
   * @description 键为事件名(如 'change')，值为回调函数
   */
  on?: FormMaybeFn<Record<string, (...args: any[]) => void>, T>
  /**
   * 组件 Ref 回调
   * @description 获取组件实例引用
   */
  ref?: (instance?: unknown) => void
  /**
   * 命名插槽名称
   * @description 如果此组件是作为插槽内容渲染，指定插槽名称
   */
  slot?: FormMaybeFn<string | undefined, T>
  /**
   * 组件内联样式
   */
  style?: FormMaybeFn<CSSProperties | undefined, T>
  /**
   * 组件 Props
   * @description 传递给组件的 Props 对象
   */
  props?: FormMaybeFn<Record<string, any>, T>
  /**
   * 组件的子插槽配置
   * @description 定义传递给该组件内部的插槽内容
   */
  slots?: FormMaybeFn<Record<string, FormComponentSlot<T>>, T>
  /**
   * 选项数据
   * @description 专门用于 Select/Radio/Checkbox 等需要 options 数据的组件
   */
  options?: FormMaybeFn<any[], T>
}

/**
 * 带有元数据的校验规则
 * @description 扩展 Element Plus 的 Rule，增加内部标识
 */
export type FormItemRuleWithMeta = FormItemRule & {
  /** 是否为内部自动生成的规则（如 required） */
  _inner?: boolean
}
export type InternalRule = FormItemRuleWithMeta

/**
 * 表单项（字段）完整配置
 * @description 定义单个字段的显示逻辑、交互行为、校验规则等
 */
export interface FormItem<T extends FormRecord = FormRecord> extends Omit<FormItemProps, "rules" | "required"> {
  /**
   * 字段属性名
   * @description 对应 model 中的属性路径
   */
  prop: FormItemProp
  /**
   * 标签文本
   */
  label?: string
  /**
   * 字段默认值
   * @description 表单初始化或重置时使用的值
   */
  value?: any
  /**
   * 栅格列数
   * @default 1
   */
  span?: GridItemProps["span"]
  /**
   * 栅格左侧间隔列数
   * @default 0
   */
  offset?: GridItemProps["offset"]
  /**
   * 帮助文本
   * @description 显示在 label 旁边的问号图标提示
   */
  help?: string
  /**
   * 额外说明
   * @description 显示在表单控件下方的灰色说明文字
   */
  extra?: FormMaybeFn<string | undefined, T>
  /**
   * 工具提示
   * @description 鼠标悬停在表单项上时显示的 tooltip
   */
  tooltip?: string
  /**
   * 校验规则
   * @description Element Plus 校验规则，支持对象或数组
   */
  rules?: FormItemRuleWithMeta | FormItemRuleWithMeta[]
  /**
   * 数据转换钩子
   * @description 配置字段值的 bind/submit 转换逻辑
   */
  hook?: FormHook
  /**
   * 表单项层级的插槽
   * @description 自定义 label 或 error 插槽内容
   */
  slots?: FormMaybeFn<Record<string, FormComponentSlot<T>>, T>
  /**
   * 所属分组 ID
   * @description 在 Tabs/Steps 布局中，指定该字段属于哪个分组
   */
  group?: string | number
  /**
   * 是否隐藏字段
   * @description 动态控制字段是否渲染（v-if 效果，隐藏后不参与校验）
   */
  hidden?: FormMaybeFn<boolean, T>
  /**
   * 是否禁用字段
   * @description 动态控制控件的 disabled 状态
   */
  disabled?: FormMaybeFn<boolean, T>
  /**
   * 控件组件配置
   * @description 必须指定，定义字段使用的输入控件
   */
  component: FormComponent<T>
  /**
   * 是否必填
   * @description 动态控制必填状态，会自动生成 required 校验规则
   */
  required?: FormMaybeFn<boolean, T>
}

/**
 * 分组子项配置
 * @description 定义 Tabs 的面板或 Steps 的步骤
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
   * 分组内容的包装组件 (可选)
   */
  component?: FormComponent<T>
}

/**
 * 表单分组配置
 * @description 定义表单的整体布局模式 (Tabs / Steps)
 */
export interface FormGroup<T extends FormRecord = FormRecord> {
  /**
   * 分组类型
   * @description
   * - 'tabs': 标签页切换模式
   * - 'steps': 分步向导模式
   */
  type?: "tabs" | "steps"
  /**
   * 分组容器组件配置
   * @description 配置 ElTabs 或 ElSteps 的属性
   */
  component?: FormComponent<T>
  /**
   * 分组列表
   */
  children?: FormGroupChild<T>[]
}

/**
 * 深度可选类型辅助工具
 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, any> ? DeepPartial<T[K]> : T[K]
}

/**
 * useForm 初始化选项
 * @description 允许以部分配置初始化表单引擎
 */
export type FormUseOptions<T extends FormRecord = FormRecord> = DeepPartial<FormOptions<T>>

/**
 * 表单操作动作接口
 * @description 提供编程式修改表单配置和数据的方法
 */
export interface FormActions<T extends FormRecord = FormRecord> {
  /**
   * 切换表单模式
   * @param mode 表单模式 ('add' | 'update')
   */
  setMode: (mode: FormMode) => void
  /**
   * 获取指定字段的值
   * @param prop 字段 prop，省略则获取整个 model
   * @returns 字段值或整个 model
   */
  getField: (prop?: FormItemProp) => any
  /**
   * 设置指定字段的值
   * @param prop 字段 prop
   * @param value 要设置的值
   */
  setField: (prop: FormItemProp, value: any) => void
  /**
   * 更新表单项配置
   * @param prop 表单项 prop
   * @param data 新的配置部分 (Partial FormItem)
   */
  setItem: (prop: FormItemProp, data: Partial<FormItem<T>>) => void
  /**
   * 批量回填数据并重置状态
   * @param data 要回填的数据对象
   */
  bindFields: (data: Partial<T>) => void
  /**
   * 设置深层嵌套数据
   * @param path 属性路径 (e.g. 'user.name')
   * @param value 要设置的值
   */
  setData: (path: string, value: any) => void
  /**
   * 更新组件的 options 数据
   * @description 针对 Select/Radio 等组件
   * @param prop 表单项 prop
   * @param value 选项数组
   */
  setOptions: (prop: FormItemProp, value: any[]) => void
  /**
   * 获取组件的 options 数据
   * @param prop 表单项 prop
   * @returns 选项数组或 undefined
   */
  getOptions: (prop: FormItemProp) => any[] | undefined
  /**
   * 更新组件的 Props
   * @param prop 表单项 prop
   * @param value 要合并的 Props 对象
   */
  setProps: (prop: FormItemProp, value: Record<string, any>) => void
  /**
   * 更新组件的样式
   * @param prop 表单项 prop
   * @param style 样式对象
   */
  setStyle: (prop: FormItemProp, style: Record<string, any>) => void
  /**
   * 隐藏一个或多个字段
   * @param fields 单个或多个字段 prop
   */
  hideItem: (prop: FormItemProp | FormItemProp[]) => void
  /**
   * 显示一个或多个字段
   * @param fields 单个或多个字段 prop
   */
  showItem: (prop: FormItemProp | FormItemProp[]) => void
  /**
   * 切换栅格折叠状态
   * @param state 指定状态 (true: 折叠, false: 展开)，省略则切换
   */
  collapse: (state?: boolean) => void
  /**
   * 动态设置字段必填状态
   * @param prop 表单项 prop
   * @param required 是否必填
   */
  setRequired: (prop: FormItemProp, required: boolean) => void
}

/**
 * 表单原生方法接口
 * @description 代理 Element Plus Form 实例的常用方法
 */
export interface FormMethods<T extends FormRecord = FormRecord> {
  /**
   * 验证整个表单
   * @param callback 验证完成的回调函数
   * @returns 验证结果 Promise
   */
  validate: (callback?: FormValidateCallback) => FormValidationResult
  /**
   * 验证表单的特定字段
   * @param props 要验证的字段 prop 或 prop 数组
   * @param callback 验证完成的回调函数
   * @returns 验证结果 Promise
   */
  validateField: (props?: Arrayable<FormItemProp>, callback?: FormValidateCallback) => FormValidationResult
  /**
   * 重置表单字段
   * @description 将字段值重置为初始值，并移除校验结果
   * @param props 要重置的字段 prop 或 prop 数组，省略则重置所有
   */
  resetFields: (props?: Arrayable<FormItemProp>) => void
  /**
   * 清除字段值
   * @description 直接从 model 中移除字段属性，并清除校验状态（不同于 resetFields，不依赖初始值）
   * @param field 要清除的字段 prop 或 prop 数组，省略则清除所有
   */
  clearFields: (field?: Arrayable<FormItemProp>) => void
  /**
   * 清除校验结果
   * @param props 要清除校验的字段 prop 或 prop 数组，省略则清除所有
   */
  clearValidate: (props?: Arrayable<FormItemProp>) => void
  /**
   * 批量设置字段值
   * @description 直接将数据合并到 model 中，不会触发 bind hook
   * @param data 要设置的键值对数据
   */
  setFields: (data: Record<string, any>) => void
  /**
   * 滚动到指定字段
   * @param prop 目标字段的 prop
   */
  scrollToField: (prop: FormItemProp) => void
  /**
   * 提交表单
   * @description 执行流程：校验 -> 数据转换(submit hook) -> 触发 onSubmit 回调
   * @param callback 提交完成的回调，包含处理后的数据和可能的错误
   * @returns Promise 包含 values 和 errors
   */
  submit: (
    callback?: (model: T, errors: Record<string, any> | undefined) => void,
  ) => Promise<{ values: T, errors: Record<string, any> | undefined }>
}

/**
 * 表单组件暴露的公共接口 (Ref)
 * @description 包含所有操作动作、原生方法以及组件内部状态
 */
export interface FormExpose<T extends FormRecord = FormRecord> extends FormActions<T>, FormMethods<T> {
  /**
   * 表单唯一标识 ID
   */
  id: string | number
  /**
   * Element Plus Form 原生实例引用
   * @description 可用于访问未被封装的原生方法
   */
  form?: FormInstance
  /**
   * 当前表单模式 ('add' | 'update')
   */
  mode: FormMode
  /**
   * 表单数据模型
   * @description 响应式的表单数据对象
   */
  model: T
  /**
   * 表单项配置列表
   * @description 当前生效的表单项配置
   */
  items: Array<FormItem<T>>
  /**
   * 初始化或更新表单
   * @description 合并新的配置到当前表单，重置校验状态
   * @param options 表单配置选项 (Partial)
   */
  use: (options?: FormUseOptions<T>) => void
  /**
   * 进入下一步 (Steps 模式)
   * @description 触发当前步骤校验，通过后进入下一步
   */
  next: () => void
  /**
   * 返回上一步 (Steps 模式)
   */
  prev: () => void
}

/**
 * 表单组件 Ref 类型
 */
export type FormRef<T extends FormRecord = FormRecord> = FormExpose<T>
