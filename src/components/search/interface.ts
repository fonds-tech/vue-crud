import type { GridProps, GridItemProps } from "../grid"
import type { FormRef, FormRecord, FormUseOptions } from "../form/types"
import type { Ref, Slots, VNodeChild, ComputedRef, CSSProperties, Component as VueComponent } from "vue"

/**
 * fd-search use 方法的配置项
 */
export interface SearchOptions<T extends FormRecord = FormRecord> extends FormUseOptions<T> {
  /**
   * 搜索区域动作配置
   * @description 直接透传 fd-grid 的 props，自定义动作区域栅格
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
   * 栅格配置（映射至 fd-grid 的全部 props）
   */
  grid?: GridProps
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
   * 列配置（映射至 fd-grid-item 的 span/offset）
   */
  col?: Pick<GridItemProps, "span" | "offset">
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
  form: Ref<FormRef<T> | undefined>
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

/**
 * 搜索组件 Ref 类型
 * @description 继承 fd-form 的 Ref，并补充 fd-search 特有方法
 */
export type SearchRef<T extends FormRecord = FormRecord> = FormRef<T> & {
  readonly model: T
  use: (options?: SearchOptions<T>) => void
  search: (params?: Record<string, any>) => Promise<any>
  reset: (params?: Record<string, any>) => Promise<any>
  collapse: (state?: boolean) => void
  form: Ref<FormRef<T> | undefined>
}

// ============================================================
// 核心类型定义（内部使用）
// ============================================================

/**
 * 内部动作配置
 */
export interface InternalActionOptions<T extends FormRecord = FormRecord> {
  /** 动作项 */
  items: SearchAction<T>[]
  /** 动作区域栅格配置 */
  grid?: GridProps
}

/**
 * 内部完整配置
 */
export interface InternalOptions<T extends FormRecord = FormRecord> {
  /** 表单配置 */
  form: FormUseOptions<T>
  /** 动作配置 */
  action: InternalActionOptions<T>
  /** 搜索钩子 */
  onSearch?: SearchOptions<T>["onSearch"]
  /** 重置钩子 */
  onReset?: SearchOptions<T>["onReset"]
}

/**
 * 搜索核心接口
 */
export interface SearchCore {
  /** 表单引用 */
  formRef: Ref<FormRef<FormRecord> | undefined>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 折叠状态 */
  collapsed: Ref<boolean>
  /** 视口宽度 */
  viewportWidth: Ref<number>
  /** 配置项 */
  options: InternalOptions
  /** 表单模型 */
  formModel: ComputedRef<FormRecord>
  /** 解析后的动作列表 */
  resolvedActions: ComputedRef<SearchAction[]>
  /** 动作栅格属性 */
  actionGridProps: ComputedRef<{
    cols: number
    colGap: number
    rowGap: number
    collapsed: boolean
    collapsedRows: number
  }>
  /** 折叠标签 */
  collapseLabel: ComputedRef<string>
  /** 表单插槽 */
  formSlots: ComputedRef<Record<string, any>>
  /** crud 实例 */
  crud: any
  /** 事件总线 */
  mitt: any

  // 方法
  /** 解析动作列配置 */
  resolveActionCol: (action: SearchAction) => { span: number, offset: number }
  /** 获取动作项属性 */
  getActionItemProps: (action: SearchAction) => { span: number, offset: number }
  /** 获取动作插槽名 */
  getActionSlot: (action: SearchAction) => string | undefined
  /** 获取组件 is */
  getComponentIs: (action: SearchAction) => any
  /** 获取组件属性 */
  getComponentProps: (action: SearchAction) => Record<string, any>
  /** 获取组件事件 */
  getComponentEvents: (action: SearchAction) => Record<string, (...args: any[]) => void>
  /** 获取组件样式 */
  getComponentStyle: (action: SearchAction) => any
  /** 获取组件插槽 */
  getComponentSlots: (action: SearchAction) => Record<string, any>

  /** 初始化 */
  use: (options?: SearchOptions) => void
  /** 搜索 */
  search: (extra?: Record<string, any>) => Promise<any>
  /** 重置 */
  reset: (extra?: Record<string, any>) => Promise<any>
  /** 折叠切换 */
  collapse: (state?: boolean) => void
}

/**
 * 搜索组件生命周期管理参数
 */
export interface SearchLifecycleParams {
  /** 视口宽度 */
  viewportWidth: Ref<number>
  /** 搜索处理器 */
  searchHandler: (params?: any) => void
  /** 重置处理器 */
  resetHandler: (params?: any) => void
  /** 获取模型处理器 */
  getModelHandler: (callback?: any) => void
  /** 事件总线 */
  mitt: {
    on: (event: string, handler: (...args: any[]) => void) => void
    off: (event: string, handler: (...args: any[]) => void) => void
    emit: (event: string, ...args: any[]) => void
  }
}

/**
 * 搜索组件渲染上下文
 */
export interface SearchRenderContext {
  /** 搜索核心 */
  engine: SearchCore
  /** 组件插槽 */
  slots: Slots
}
