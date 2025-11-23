import type { ColProps, RowProps } from "element-plus"
import type { FormRecord, FormUseOptions } from "../fd-form/type"
import type { Ref, VNodeChild, CSSProperties, Component as VueComponent } from "vue"

/**
 * fd-search use 方法的配置项
 */
export interface SearchOptions<T extends FormRecord = FormRecord> extends FormUseOptions<T> {
  /**
   * 搜索区域动作配置
   * @description 支持通过 row/col 自定义按钮布局
   */
  action?: SearchActionOptions<T>
  /**
   * 重置钩子，允许重置后执行业务逻辑
   */
  onReset?: SearchHook<T>
  /**
   * 搜索钩子，常用于补充额外参数或自定义请求
   */
  onSearch?: SearchHook<T>
}

/**
 * 搜索模型类型，直接复用 fd-form 的 FormRecord，便于与表单模型保持一致
 */
export type SearchModel = FormRecord

/**
 * 搜索配置中大量可传入函数的字段统一使用该类型
 * @description 允许直接给定静态值，也允许传入 (model) => value 的函数实现动态计算
 */
export type SearchMaybeFn<T, M extends FormRecord = FormRecord> = T | ((model: M) => T)

/**
 * 动作插槽类型，支持传入 VueComponent 或返回 VNode 的函数
 */
export type SearchActionSlot = VueComponent | (() => VNodeChild)

/**
 * 动作按钮的自定义渲染定义
 * @description 每个字段都支持 SearchMaybeFn，方便根据表单模型灵活计算
 */
export interface SearchActionComponent<T extends FormRecord = FormRecord> {
  /**
   * 自定义组件名称/实例
   * @example () => "el-link"
   */
  is?: SearchMaybeFn<string | VueComponent, T>
  /**
   * 动作组件事件，常用于 click/command 等交互
   */
  on?: SearchMaybeFn<Record<string, (...args: any[]) => void>, T>
  /**
   * 直接指定走外部插槽渲染，而不是组件
   */
  slot?: SearchMaybeFn<string | undefined, T>
  /**
   * 行内样式，支持根据表单状态动态计算
   */
  style?: SearchMaybeFn<CSSProperties | undefined, T>
  /**
   * 组件属性，如按钮类型、大小等
   */
  props?: SearchMaybeFn<Record<string, any>, T>
  /**
   * 组件子插槽，key 为插槽名，value 为组件或渲染函数
   */
  slots?: SearchMaybeFn<Record<string, SearchActionSlot>, T>
}

/**
 * 搜索动作区域的布局与按钮配置
 */
export interface SearchActionOptions<T extends FormRecord = FormRecord> {
  /**
   * 行配置 (el-row)，用于控制整体按钮容器的布局
   */
  row?: Partial<RowProps>
  /**
   * 列配置 (el-col)，可指定默认 span/offset 等属性
   */
  col?: Partial<ColProps>
  /**
   * 自定义动作按钮列表
   */
  items?: SearchAction<T>[]
}

/**
 * 搜索区域动作配置
 */
export interface SearchAction<T extends FormRecord = FormRecord> {
  /**
   * 内置动作类型：搜索 / 重置 / 折叠
   */
  type?: "search" | "reset" | "collapse"
  /**
   * 按钮文案
   */
  text?: string
  /**
   * 列配置 (el-col)，优先级高于 action.col
   */
  col?: Partial<ColProps>
  /**
   * 自定义插槽名称，优先于 component 渲染
   */
  slot?: SearchMaybeFn<string | undefined, T>
  /**
   * 自定义组件渲染控制项
   */
  component?: SearchActionComponent<T>
}

/**
 * 搜索/重置钩子
 * @description 除了拿到模型数据，还会透出 next(params) 帮助业务接管异步流程
 */
export type SearchHook<T extends FormRecord = FormRecord> = (model: T, ctx: { next: (params?: Record<string, any>) => Promise<any> }) => void | Promise<void>

/**
 * 组件实例通过 defineExpose 暴露的能力
 */
export interface SearchExpose<T extends FormRecord = FormRecord> {
  /**
   * readonly model 便于业务直接监听搜索条件变化
   */
  readonly model: T
  /**
   * fd-form 实例，可直接调用 form API（如 validate）
   */
  form: Ref<InstanceType<typeof import("../fd-form/index.vue")["default"]> | undefined>
  /**
   * 初始化方法，外部调用时可覆盖默认配置
   */
  use: (options?: SearchOptions<T>) => void
  /**
   * 手动触发搜索，允许附加额外参数
   */
  search: (params?: Record<string, any>) => Promise<any>
  /**
   * 手动触发重置，附带额外的默认值
   */
  reset: (params?: Record<string, any>) => Promise<any>
  /**
   * 控制折叠状态，传参则强制设置
   */
  collapse: (state?: boolean) => void
}
