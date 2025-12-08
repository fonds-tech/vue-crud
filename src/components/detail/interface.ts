import type { TableDict } from "../table/interface"
import type { dialogProps } from "element-plus"
import type { DescriptionProps } from "element-plus/es/components/descriptions/src/description"
import type { VNodeChild, CSSProperties, ExtractPropTypes, Component as VueComponent } from "vue"

/**
 * 通用详情数据类型。
 * @description 采用 Record 以兼容任意业务字段，便于在详情组件中透传任意数据结构。
 */
export type DetailData = Record<string, any>

/**
 * 支持「静态值 / 动态函数」的联合类型。
 * @description 允许配置项为固定值，或根据当前详情数据动态计算的函数。
 * @template T 目标值的类型
 * @template D 详情数据对象的类型，默认为 DetailData
 */
export type DetailMaybeFn<T, D extends DetailData = DetailData> = T | ((data: D) => T)

/**
 * 详情组件支持的插槽内容类型。
 * @description 既支持字符串组件名，也支持 Vue 组件实例、DetailComponent 配置对象或渲染函数，提供最大灵活性。
 */
export type DetailComponentSlot = string | VueComponent | DetailComponent | (() => VNodeChild)

/**
 * 自定义渲染组件配置接口。
 * @description 用于在描述项内容区域或底部动作区域渲染自定义组件（支持 Element Plus 组件、Vue 组件或自定义组件）。
 * @template D 详情数据对象的类型
 */
export interface DetailComponent<D extends DetailData = DetailData> {
  /**
   * 组件类型。
   * @description 可以是 HTML 标签名、组件注册名或 Vue 组件对象。支持根据数据动态切换。
   */
  is?: DetailMaybeFn<string | VueComponent, D>
  /**
   * 事件监听器集合。
   * @description key 为事件名（不带 on 前缀，如 'click'），value 为事件处理函数。
   * 也支持传入函数返回一个事件对象映射。
   */
  on?: DetailMaybeFn<Record<string, (...args: any[]) => void>, D>
  /**
   * 插槽名称。
   * @description 指定该组件渲染到父级组件的哪个具名插槽中。
   */
  slot?: DetailMaybeFn<string | undefined, D>
  /**
   * 自定义内联样式。
   * @description 应用于该组件的 style 属性。
   */
  style?: DetailMaybeFn<CSSProperties | undefined, D>
  /**
   * 组件 Props 属性集合。
   * @description 传递给组件的 props 对象。
   */
  props?: DetailMaybeFn<Record<string, any>, D>
  /**
   * 组件内部的具名插槽配置。
   * @description 定义该组件内部的子插槽内容。
   */
  slots?: DetailMaybeFn<Record<string, DetailComponentSlot>, D>
}

/**
 * 插槽集合定义类型。
 * @description 用于定义一组插槽（如 Descriptions 的 slots 或分组 slots）。
 * 支持静态对象映射，或基于数据的动态函数返回映射。
 */
export type DetailSlots<D extends DetailData = DetailData> = DetailMaybeFn<Record<string, DetailComponentSlot>, D>

/**
 * 单个详情字段配置接口。
 * @description 定义详情展示中的一个数据项（Item），包含数据映射、显示标签、布局及渲染方式等。
 * @template D 详情数据对象的类型
 */
export interface DetailItem<D extends DetailData = DetailData> {
  /**
   * 字段名 / 属性名。
   * @description 对应数据对象 D 中的 key，或者用于标识该项的唯一键。
   */
  prop: keyof D | string
  /**
   * 显示标签 / 标题。
   * @description 详情项左侧显示的文本标签。
   */
  label?: DetailMaybeFn<string | undefined, D>
  /**
   * 栅格占据列数。
   * @description 对应 Element Plus Descriptions Item 的 span 属性。
   * @default 1
   */
  span?: number
  /**
   * 自定义显示值。
   * @description 覆盖默认的 `data[prop]` 取值方式，可用于组合字段或自定义静态内容。
   */
  value?: DetailMaybeFn<any, D>
  /**
   * 分组标识。
   * @description 指定该字段所属的分组 name。如果不指定，则归入默认分组。
   */
  group?: DetailMaybeFn<string | number | undefined, D>
  /**
   * 是否隐藏。
   * @description 控制该详情项是否渲染。
   * @default false
   */
  hidden?: DetailMaybeFn<boolean, D>
  /**
   * 数据字典。
   * @description 用于将值（value）映射为标签（label）显示的字典数组。
   */
  dict?: DetailMaybeFn<TableDict[], D>
  /**
   * 格式化函数。
   * @description 自定义值的显示格式，优先级高于 dict。
   * @param value 当前字段的值
   * @param data 完整的详情数据对象
   */
  formatter?: (value: any, data: D) => any
  /**
   * 字段级插槽配置。
   * @description 为该详情项提供自定义插槽内容（如 default 插槽覆盖内容，label 插槽覆盖标签）。
   */
  slots?: DetailSlots<D>
  /**
   * 自定义渲染组件。
   * @description 在该详情项的内容区域渲染一个自定义组件。
   */
  component?: DetailComponent<D>
}

/**
 * 底部操作按钮配置接口。
 * @description 定义详情弹窗底部的操作按钮，支持内置类型或完全自定义。
 * @template D 详情数据对象的类型
 */
export interface DetailAction<D extends DetailData = DetailData> {
  /**
   * 按钮文本。
   */
  text?: DetailMaybeFn<string | undefined, D>
  /**
   * 按钮类型。
   * @description 目前支持 "ok"（确定/关闭按钮），也可扩展其他类型。
   */
  type?: "ok"
  /**
   * 是否隐藏按钮。
   * @default false
   */
  hidden?: DetailMaybeFn<boolean, D>
  /**
   * 自定义按钮组件配置。
   * @description 如果需要渲染非标准按钮或复杂交互组件，可配置此项。
   */
  component?: DetailComponent<D>
}

/**
 * 分组配置接口。
 * @description 定义详情展示的分组逻辑。支持自定义分组标题和独立的 Descriptions 配置。
 * @template D 详情数据对象的类型
 */
export interface DetailGroup<D extends DetailData = DetailData> {
  /**
   * 分组唯一标识。
   * @description 对应 DetailItem 中的 group 字段。
   */
  name?: string | number
  /**
   * 分组标题。
   * @description 显示在分组头部的标题文本。
   */
  title?: DetailMaybeFn<string | undefined, D>
  /**
   * 分组专属 Descriptions 配置。
   * @description 允许为该分组单独设置 Descriptions 的属性（如 column, border 等）。
   */
  descriptions?: DetailDescriptions<D>
}

/**
 * 扩展的 Descriptions 配置类型。
 * @description 基于 Element Plus DescriptionProps，增加了插槽配置支持。
 * @template D 详情数据对象的类型
 */
export type DetailDescriptions<D extends DetailData = DetailData> = Partial<DescriptionProps> & {
  /**
   * Descriptions 组件的插槽。
   * @description 可用于覆盖 title, extra 等具名插槽。
   */
  slots?: DetailSlots<D>
}

// 提取 Element Plus Dialog 的 Props 类型，排除 modelValue（由内部控制）
type NativeDialogProps = Omit<ExtractPropTypes<typeof dialogProps>, "modelValue">

/**
 * 详情弹窗 Props 定义。
 * @description 复用 fd-dialog 的 props，并增加组件特有的 loadingText 配置。
 */
export type DetailDialogProps = Partial<NativeDialogProps> & {
  /**
   * 加载状态时的提示文本。
   */
  loadingText?: string
}

/**
 * 详情组件完整配置接口。
 * @description 汇总了弹窗行为、字段定义、分组布局、底部动作及生命周期钩子。
 * @template D 详情数据对象的类型
 */
export interface DetailOptions<D extends DetailData = DetailData> {
  /**
   * 弹窗属性配置。
   */
  dialog: DetailDialogProps
  /**
   * 详情字段列表配置。
   */
  items: DetailItem<D>[]
  /**
   * 分组列表配置。
   */
  groups: DetailGroup<D>[]
  /**
   * 底部操作按钮配置。
   */
  actions: DetailAction<D>[]
  /**
   * 全局 Descriptions 配置。
   * @description 作为所有分组的默认 Descriptions 配置。
   */
  descriptions: DetailDescriptions<D>
  /**
   * 弹窗打开后的回调（动画结束，内容可见）。
   */
  onOpen?: () => void
  /**
   * 弹窗打开前的回调（动画开始前）。
   */
  onBeforeOpen?: () => void
  /**
   * 弹窗关闭后的回调（动画结束，内容隐藏）。
   * @param data 关闭时的数据快照
   */
  onClose?: (data: D) => void
  /**
   * 弹窗关闭前的回调（可以拦截关闭吗？目前看只是通知）。
   * @param data 关闭前的数据快照
   */
  onBeforeClose?: (data: D) => void
  /**
   * 自定义详情数据获取流程。
   * @description 覆盖默认的数据加载逻辑。
   * @param row 触发详情的行数据（通常包含主键 ID）
   * @param ctx 上下文控制对象
   *  - `done`: 完成加载，将数据写入详情组件并结束 loading 状态
   *  - `next`: 继续调用默认的 service 接口进行查询
   *  - `close`: 直接关闭弹窗
   * @returns 返回 Promise 可让组件等待异步操作完成；不返回则视为同步处理。
   */
  onDetail?: (
    row: D,
    ctx: {
      done: (data: D) => void
      next: (params: Record<string, any>) => Promise<any>
      close: () => void
    },
  ) => Promise<any> | void
}

/**
 * `use` 方法的配置参数类型。
 * @description 支持 DeepPartial 深度部分合并，允许在运行时更新 Options 的部分配置。
 * @template D 详情数据对象的类型
 */
export type DetailUseOptions<D extends DetailData = DetailData> = import("../form/interface").DeepPartial<DetailOptions<D>> & Record<string, any>

/**
 * 详情组件暴露的实例方法接口 (Expose)。
 * @description 父组件可通过 ref 访问这些属性和方法来控制详情组件。
 * @template D 详情数据对象的类型
 */
export interface DetailExpose<D extends DetailData = DetailData> {
  /**
   * 当前详情数据的只读快照。
   * @readonly
   */
  readonly data: D
  /**
   * 动态更新组件配置。
   * @description 支持深度合并配置项，数组类型会整体替换。
   * @param options 部分配置对象
   */
  use: (options: DetailUseOptions<D>) => void
  /**
   * 关闭详情弹窗。
   * @description 同时会重置 loading 状态。
   */
  close: () => void
  /**
   * 打开弹窗并加载详情。
   * @description 会触发 onDetail 或默认的 service 查询。
   * @param row 包含查询主键或初始数据的行对象
   * @returns 返回 Promise 用于等待加载完成
   */
  detail: (row: D) => Promise<any> | void
  /**
   * 刷新当前详情数据。
   * @description 使用上一次的查询参数重新请求数据。
   * @param params 额外的查询参数（会与原有参数合并）
   * @returns 返回 Promise 用于等待刷新完成
   */
  refresh: (params?: Record<string, any>) => Promise<any> | void
  /**
   * 手动设置详情数据。
   * @description 直接修改组件内部的数据对象。
   * @param value 新的数据对象
   */
  setData: (value: D) => void
  /**
   * 获取当前数据的深拷贝。
   * @returns 数据对象的副本
   */
  getData: () => D
  /**
   * 清空数据。
   * @description 清空当前数据对象和查询缓存，但不会关闭弹窗。
   */
  clearData: () => void
}

/**
 * 详情组件的 Ref 类型别名。
 * @description 用于 TypeScript 中定义组件 ref 变量的类型。
 * @template D 详情数据对象的类型
 */
export type DetailRef<D extends DetailData = DetailData> = DetailExpose<D>
