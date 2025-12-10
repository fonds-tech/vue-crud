/**
 * 菜单项配置接口
 */
export interface ContextMenuItem {
  /** 菜单项显示的文本 */
  label: string
  /** 前缀图标类名或组件 */
  prefixIcon?: string
  /** 后缀图标类名或组件 */
  suffixIcon?: string
  /** 是否允许文本省略，默认为 true */
  ellipsis?: boolean
  /** 是否禁用该菜单项 */
  disabled?: boolean
  /** 是否隐藏该菜单项 */
  hidden?: boolean
  /** 子菜单列表 */
  children?: ContextMenuItem[]
  /** 内部状态：是否显示子菜单 */
  showChildren?: boolean
  /** 点击回调函数，参数为关闭菜单的方法 */
  callback?: (close: () => void) => void
  /** 允许任意其他属性 */
  [key: string]: any
}

/**
 * 菜单悬浮高亮配置接口
 */
export interface ContextMenuHoverOptions {
  /** 需要高亮的目标元素选择器类名 */
  target?: string
  /** 高亮时应用的类名 */
  className?: string
}

/**
 * 上下文菜单组件的 Props 选项接口
 */
export interface ContextMenuOptions {
  /** 自定义菜单容器的类名 */
  class?: string
  /** 菜单项列表数据 */
  list?: ContextMenuItem[]
  /** 悬浮高亮配置，true 为默认配置 */
  hover?: boolean | ContextMenuHoverOptions
  /** 指定挂载文档对象，默认为当前 document */
  document?: Document
}

/**
 * 组件对外暴露的方法接口
 */
export interface ContextMenuExpose {
  /**
   * 打开菜单方法
   * @param event 鼠标事件对象
   * @param options 菜单选项配置
   */
  open: (event: MouseEvent, options?: ContextMenuOptions) => { close: () => void }
  /** 关闭菜单方法 */
  close: () => void
}
