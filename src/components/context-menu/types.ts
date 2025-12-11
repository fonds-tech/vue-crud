/**
 * 菜单项类型枚举
 * - 'item': 普通菜单项（默认）
 * - 'divider': 分隔线
 */
export type ContextMenuItemType = "item" | "divider"

/**
 * 菜单项配置接口
 */
export interface ContextMenuItem {
  /**
   * 菜单项类型
   * @default 'item'
   */
  type?: ContextMenuItemType

  /**
   * 菜单项显示的文本
   * type='divider' 时可选
   */
  label?: string

  /**
   * 前缀图标类名
   * @example 'fd-icon-edit'
   */
  prefixIcon?: string

  /**
   * 后缀图标类名
   * @example 'fd-icon-arrow-right'
   */
  suffixIcon?: string

  /**
   * 是否允许文本省略
   * @default true
   */
  ellipsis?: boolean

  /**
   * 是否禁用该菜单项
   * @default false
   */
  disabled?: boolean

  /**
   * 是否隐藏该菜单项
   * @default false
   */
  hidden?: boolean

  /**
   * 子菜单列表
   */
  children?: ContextMenuItem[]

  /**
   * 点击回调函数
   * 点击菜单项时执行，执行后默认自动关闭菜单
   */
  onClick?: () => void

  /**
   * 是否在点击后保持菜单打开
   * 设置为 true 时，点击后不会自动关闭菜单
   * @default false
   */
  keepOpen?: boolean
}

/**
 * 菜单悬浮高亮配置接口
 */
export interface ContextMenuHoverOptions {
  /**
   * 需要高亮的目标元素选择器类名
   * 菜单打开时会向上查找包含此类名的祖先元素并添加高亮样式
   */
  target?: string

  /**
   * 高亮时应用的类名
   * @default 'fd-context-menu__target'
   */
  className?: string
}

/**
 * 上下文菜单组件的 Props 选项接口
 */
export interface ContextMenuOptions {
  /**
   * 自定义菜单容器的类名
   */
  class?: string

  /**
   * 菜单项列表数据
   */
  list?: ContextMenuItem[]

  /**
   * 悬浮高亮配置
   * - true: 使用默认配置
   * - object: 自定义配置
   */
  hover?: boolean | ContextMenuHoverOptions

  /**
   * 指定挂载文档对象
   * 用于 iframe 或 shadow DOM 等场景
   * @default document
   */
  document?: Document
}

/**
 * 菜单打开后返回的控制对象
 */
export interface ContextMenuControl {
  /**
   * 关闭当前菜单
   */
  close: () => void
}

/**
 * 组件对外暴露的方法接口
 */
export interface ContextMenuExpose {
  /**
   * 打开菜单方法
   * @param event - 鼠标事件对象，用于定位菜单
   * @param options - 菜单选项配置
   * @returns 菜单控制对象
   */
  open: (event: MouseEvent, options?: ContextMenuOptions) => ContextMenuControl

  /**
   * 关闭菜单方法
   */
  close: () => void
}
