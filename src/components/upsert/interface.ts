import type { GridProps } from "../grid"
import type { dialogProps } from "element-plus"
import type { ExtractPropTypes } from "vue"
import type { FormRef, FormItem, FormGroup, FormRecord, DeepPartial, FormActions, FormMaybeFn, FormMethods, FormUseOptions, FormComponentSlot } from "../form/types"

/**
 * 排除 modelValue 的原生 Dialog 属性
 */
type NativeDialogProps = Omit<ExtractPropTypes<typeof dialogProps>, "modelValue">

/**
 * Upsert 弹窗配置属性
 *
 * 继承自 Element Plus Dialog 的属性，但排除了 modelValue
 */
export type UpsertDialogProps = Partial<NativeDialogProps> & {
  /**
   * 内容区高度
   */
  height?: string | number
  /**
   * 加载提示文案
   */
  loadingText?: string
}

/**
 * Upsert 模式：新增或更新
 */
export type UpsertMode = "add" | "update"

/**
 * Upsert 关闭触发动作
 *
 * - cancel: 取消/关闭
 * - submit: 提交成功关闭
 */
export type UpsertCloseAction = "cancel" | "submit"

/**
 * 底部操作按钮配置
 */
export interface UpsertAction<T extends FormRecord = FormRecord> {
  /**
   * 按钮文案，支持函数动态返回
   */
  text?: FormMaybeFn<string, T>
  /**
   * 按钮类型
   * - ok: 确认/提交
   * - cancel: 取消
   * - next: 下一步（分步表单）
   * - prev: 上一步（分步表单）
   */
  type?: "ok" | "cancel" | "next" | "prev"
  /**
   * 是否隐藏，支持函数动态判断
   */
  hidden?: FormMaybeFn<boolean, T>
  /**
   * 自定义组件或插槽配置
   */
  component?: FormComponentSlot<T>
}

/**
 * Upsert 核心配置选项
 */
export interface UpsertOptions<T extends FormRecord = FormRecord> {
  /**
   * 唯一标识，用于强制重新渲染
   */
  key: number
  /**
   * 当前模式
   */
  mode: UpsertMode
  /**
   * 表单通用配置（labelWidth 等）
   */
  form: FormUseOptions<T>["form"]
  /**
   * 表单数据模型
   */
  model: T
  /**
   * 表单项列表
   */
  items: Array<FormItem<T>>
  /**
   * 表单分组配置
   */
  group: FormGroup<T>
  /**
   * 栅格布局配置
   */
  grid?: GridProps
  /**
   * 底部操作按钮列表
   */
  actions: Array<UpsertAction<T>>
  /**
   * 弹窗配置
   */
  dialog: UpsertDialogProps
  /**
   * 分步表单下一步回调
   */
  onNext?: FormUseOptions<T>["onNext"]
  /**
   * 打开时的回调
   */
  onOpen?: (model: T, ctx: UpsertLifecycleContext<T>) => void
  /**
   * 打开前的回调
   */
  onBeforeOpen?: (model: T, ctx: UpsertLifecycleContext<T>) => void
  /**
   * 关闭时的回调
   */
  onClose?: (action: UpsertCloseAction, model: T, ctx: UpsertLifecycleContext<T>) => void
  /**
   * 关闭前的回调
   */
  onBeforeClose?: (action: UpsertCloseAction, model: T, ctx: UpsertLifecycleContext<T>) => void
  /**
   * 详情获取钩子
   *
   * 用于自定义获取详情数据的逻辑
   *
   * @param row 当前行数据（通常包含主键）
   * @param ctx 详情获取上下文
   */
  onDetail?: (row: Record<string, any>, ctx: UpsertDetailContext) => void
  /**
   * 提交钩子
   *
   * 用于自定义提交逻辑
   *
   * @param payload 表单提交的数据
   * @param ctx 提交上下文
   */
  onSubmit?: (payload: T, ctx: UpsertSubmitContext) => void
}

/**
 * useUpsert 钩子的参数
 *
 * 允许深度部分匹配 UpsertOptions，并支持任意扩展属性
 */
export type UpsertUseOptions<T extends FormRecord = FormRecord> = DeepPartial<UpsertOptions<T>> & Record<string, any>

/**
 * 生命周期上下文
 */
export interface UpsertLifecycleContext<T extends FormRecord = FormRecord> {
  /**
   * 当前模式
   */
  mode: UpsertMode
  /**
   * 关闭弹窗方法
   */
  close: (action?: UpsertCloseAction) => void
  /**
   * 表单实例引用
   */
  form?: FormRef<T>
}

/**
 * 详情获取上下文
 */
export interface UpsertDetailContext {
  mode: UpsertMode
  /**
   * 完成加载并回填数据
   */
  done: (data: Record<string, any>) => void
  /**
   * 继续执行默认的详情查询
   */
  next: (params: Record<string, any>) => Promise<any>
  /**
   * 关闭弹窗
   */
  close: (action?: UpsertCloseAction) => void
}

/**
 * 提交上下文
 */
export interface UpsertSubmitContext {
  mode: UpsertMode
  /**
   * 提交完成，停止 loading 并关闭弹窗
   */
  done: () => void
  /**
   * 继续执行默认的提交逻辑
   */
  next: (payload: Record<string, any>) => Promise<any>
  /**
   * 关闭弹窗
   */
  close: (action?: UpsertCloseAction) => void
}

/**
 * Upsert 暴露给父组件的实例方法
 */
export interface UpsertExpose<T extends FormRecord = FormRecord> extends FormActions<T>, FormMethods<T> {
  /**
   * 当前模式
   */
  mode: UpsertMode
  /**
   * 是否可见
   */
  visible: boolean
  /**
   * 是否加载中
   */
  loading: boolean
  /**
   * 表单数据模型
   */
  model: T
  /**
   * 内部表单实例
   */
  form?: FormRef<T>
  /**
   * 配置更新方法
   */
  use: (options: UpsertUseOptions<T>) => void
  /**
   * 打开新增弹窗
   */
  add: (data?: Partial<T>) => Promise<void>
  /**
   * 打开编辑弹窗
   */
  update: (row?: Record<string, any>) => Promise<void>
  /**
   * 打开追加弹窗（类似新增）
   */
  append: (row?: Record<string, any>) => Promise<void>
  /**
   * 关闭弹窗
   */
  close: (action?: UpsertCloseAction) => void
  /**
   * 触发提交
   *
   * @param extra 额外的提交数据，将合并到 payload 中
   * @returns 提交 Promise，解析为最终响应结果
   */
  submit: (extra?: Record<string, any>) => Promise<any>
}

export type UpsertRef<T extends FormRecord = FormRecord> = UpsertExpose<T>

export type { FormComponent as UpsertComponent, FormComponentSlot as UpsertComponentSlot, FormGroup as UpsertGroup, FormItem as UpsertItem } from "../form/types"
