import type { dialogProps } from "element-plus"
import type { DescriptionProps } from "element-plus/es/components/descriptions/src/description"
import type { VNodeChild, CSSProperties, ExtractPropTypes, Component as VueComponent } from "vue"

/**
 * 通用详情数据类型
 * @description 使用 Record 以兼容任意业务字段
 */
export type DetailData = Record<string, any>

/**
 * 支持「静态值 / 动态函数」的联合类型
 * @template T 目标值类型
 * @template D 详情数据类型
 */
export type DetailMaybeFn<T, D extends DetailData = DetailData> = T | ((data: D) => T)

/**
 * 详情组件支持的插槽结构
 * @description 既支持字符串组件名，也支持组件实例或 render 函数
 */
export type DetailComponentSlot = string | VueComponent | DetailComponent | (() => VNodeChild)

/**
 * 自定义渲染组件配置
 */
export interface DetailComponent<D extends DetailData = DetailData> {
  /** 组件类型，可根据数据动态切换 */
  is?: DetailMaybeFn<string | VueComponent, D>
  /** 事件监听器集合 */
  on?: DetailMaybeFn<Record<string, (...args: any[]) => void>, D>
  /** 插槽名称，可让父级通过 slot 重写 */
  slot?: DetailMaybeFn<string | undefined, D>
  /** 自定义内联样式 */
  style?: DetailMaybeFn<CSSProperties | undefined, D>
  /** 组件 props */
  props?: DetailMaybeFn<Record<string, any>, D>
  /** 组件内部具名插槽 */
  slots?: DetailMaybeFn<Record<string, DetailComponentSlot>, D>
}

/** 插槽集合定义（字段/分组复用） */
export type DetailSlots<D extends DetailData = DetailData> = DetailMaybeFn<Record<string, DetailComponentSlot>, D>

/**
 * 单个详情字段配置
 */
export interface DetailItem<D extends DetailData = DetailData> {
  /** 对应数据字段 */
  field: keyof D | string
  /** 字段标题 */
  label?: DetailMaybeFn<string | undefined, D>
  /** 栅格占用 */
  span?: number
  /** 默认值（数据不存在时显示） */
  value?: DetailMaybeFn<any, D>
  /** 所属分组名称 */
  group?: DetailMaybeFn<string | number | undefined, D>
  /** 隐藏条件 */
  hidden?: DetailMaybeFn<boolean, D>
  /** 自定义格式化函数 */
  formatter?: (value: any, data: D) => any
  /** 插槽配置 */
  slots?: DetailSlots<D>
  /** 渲染组件配置 */
  component?: DetailComponent<D>
}

/**
 * 底部操作按钮配置
 */
export interface DetailAction<D extends DetailData = DetailData> {
  /** 按钮文本 */
  text?: DetailMaybeFn<string | undefined, D>
  /** 内置动作类型 */
  type?: "ok"
  /** 隐藏条件 */
  hidden?: DetailMaybeFn<boolean, D>
  /** 自定义渲染组件 */
  component?: DetailComponent<D>
}

/**
 * 分组配置
 */
export interface DetailGroup<D extends DetailData = DetailData> {
  /** 唯一名称 */
  name?: string | number
  /** 显示标题 */
  title?: DetailMaybeFn<string | undefined, D>
  /** 分组专属 descriptions 配置 */
  descriptions?: DetailDescriptions<D>
}

/** descriptions 组件配置，扩充 slots 字段 */
export type DetailDescriptions<D extends DetailData = DetailData> = Partial<DescriptionProps> & {
  slots?: DetailSlots<D>
}

type NativeDialogProps = Omit<ExtractPropTypes<typeof dialogProps>, "modelValue">

/** 弹窗配置（复用 fd-dialog 的 props） */
export type DetailDialogProps = Partial<NativeDialogProps> & {
  /** 加载态提示 */
  loadingText?: string
}

/**
 * 详情组件完整配置
 */
export interface DetailOptions<D extends DetailData = DetailData> {
  dialog: DetailDialogProps
  items: DetailItem<D>[]
  groups: DetailGroup<D>[]
  actions: DetailAction<D>[]
  descriptions: DetailDescriptions<D>
  onOpen?: () => void
  onBeforeOpen?: () => void
  onClose?: (data: D) => void
  onBeforeClose?: (data: D) => void
  onDetail?: (row: D, ctx: { done: (data: D) => void, next: (params: Record<string, any>) => Promise<any>, close: () => void }) => void
}

/** 深度 Partial，允许配置嵌套字段 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, any> ? DeepPartial<T[K]> : T[K]
}

/**
 * use 方法支持的参数
 */
export type DetailUseOptions<D extends DetailData = DetailData> = DeepPartial<DetailOptions<D>> & Record<string, any>

/**
 * 组件暴露的实例方法
 */
export interface DetailExpose<D extends DetailData = DetailData> {
  readonly data: D
  /** 合并配置 */
  use: (options: DetailUseOptions<D>) => void
  /** 关闭弹窗 */
  close: () => void
  /** 打开并根据行数据查询详情 */
  detail: (row: D) => void
  /** 刷新详情 */
  refresh: (params?: Record<string, any>) => void
  /** 手动设置详情数据 */
  setData: (value: D) => void
  /** 获取详情数据副本 */
  getData: () => D
  /** 清空数据与查询缓存 */
  clearData: () => void
}

/**
 * 详情组件实例引用
 */
export type DetailRef<D extends DetailData = DetailData> = DetailExpose<D>
