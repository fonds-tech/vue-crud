import type Mitt from "../../utils/mitt"

/**
 * CRUD 组件尺寸
 * @description 'large' | 'default' | 'small'
 */
export type CrudSize = "large" | "default" | "small"

/**
 * CRUD 样式配置
 */
export interface CrudStyle {
  /** 组件尺寸 */
  size: CrudSize
  /** 表单样式配置 */
  form?: {
    /** 表单项占位列数 */
    span?: number
    /** 标签宽度 */
    labelWidth?: number | string
    /** 标签位置 */
    labelPosition?: "left" | "right" | "top"
    /** 表单插件配置 */
    plugins?: Array<Record<string, any>>
  }
}

/**
 * CRUD 事件定义
 */
export interface CrudEvents {
  [key: string]: (...args: any[]) => any
}

/**
 * API 接口路径映射
 */
export interface CrudApi {
  /** 新增接口路径 */
  add: string
  /** 分页查询接口路径 */
  page: string
  /** 列表查询接口路径 */
  list: string
  /** 更新接口路径 */
  update: string
  /** 删除接口路径 */
  delete: string
  /** 详情查询接口路径 */
  detail?: string
  [key: string]: string | undefined
}

/**
 * 分页参数字段映射
 */
export interface CrudPaginationDict {
  /** 当前页码字段名 */
  page: string
  /** 每页条数字段名 */
  size: string
  [key: string]: string
}

/**
 * 搜索参数字段映射
 */
export interface CrudSearchDict {
  /** 关键词字段名 */
  keyWord?: string
  /** 查询字段名 */
  query?: string
  [key: string]: string | undefined
}

/**
 * 排序参数字段映射
 */
export interface CrudSortDict {
  /** 排序方式字段名 */
  order?: string
  /** 排序字段名 */
  prop?: string
  [key: string]: string | undefined
}

/**
 * 界面文本标签配置
 */
export interface Label {
  /** 新增按钮/标题文本 */
  add: string
  /** 列表标题文本 */
  list: string
  /** 更新按钮/标题文本 */
  update: string
  /** 删除按钮/标题文本 */
  delete: string
  /** 详情标题文本 */
  detail?: string
  /** CRUD 模块总标题 */
  title?: string
  [key: string]: string | undefined
}

/**
 * 字典配置 (包含 API、分页、搜索、排序、标签等映射)
 */
export interface Dict {
  /** 主键字段名 */
  primaryId: string
  /** API 接口配置 */
  api: CrudApi
  /** 分页字段配置 */
  pagination?: CrudPaginationDict
  /** 搜索字段配置 */
  search?: CrudSearchDict
  /** 排序字段配置 */
  sort?: CrudSortDict
  /** 文本标签配置 */
  label: Label
}

/**
 * 权限配置
 */
export interface Permission {
  /** 是否允许新增 */
  add?: boolean
  /** 是否允许分页查询 */
  page?: boolean
  /** 是否允许列表查询 */
  list?: boolean
  /** 是否允许删除 */
  delete?: boolean
  /** 是否允许更新 */
  update?: boolean
  /** 是否允许查看详情 */
  detail?: boolean
  [key: string]: any
}

/**
 * CRUD 核心配置
 */
export interface Config {
  /** 字典配置 */
  dict: Dict
  /** 权限配置 */
  permission: Permission
  /** 样式配置 */
  style: CrudStyle
  /** 事件配置 */
  events?: CrudEvents
  /**
   * 刷新列表时的回调
   * @param params 查询参数
   * @param ctx 上下文控制对象
   */
  onRefresh?: (
    params: Record<string, any>,
    ctx: {
      /** 执行下一步（发送请求） */
      next: (params: Record<string, any>) => Promise<any>
      /** 完成回调 */
      done: () => void
      /** 自定义渲染数据 */
      render: (data: any, pagination?: any) => void
    },
  ) => void
  /**
   * 删除操作时的回调
   * @param selection 选中的行数据
   * @param ctx 上下文控制对象
   */
  onDelete?: (
    selection: any[],
    ctx: {
      /** 执行下一步（发送请求） */
      next: (data: Record<string, any>) => Promise<any>
    },
  ) => void
}

/**
 * CRUD 查询参数
 */
export type CrudParams = Record<string, any>

/**
 * CRUD 服务层接口
 */
export type CrudService = Record<string, any>

/**
 * CRUD 初始化选项 (继承 Config)
 */
export interface CrudOptions extends Config {
  /** 自定义服务层实例 */
  service?: CrudService
}

/**
 * CRUD 实例引用 (Exposed Ref)
 */
export interface CrudRef {
  /** 当前选中的 ID */
  id: string | number | undefined
  /** 加载状态 */
  loading: boolean
  /** 当前选中的行数据 */
  selection: any[]
  /** 当前查询参数 */
  params: CrudParams
  /** 服务层实例 */
  service: CrudService
  /** 字典配置 */
  dict: Dict
  /** 权限配置 */
  permission: Permission
  /** 事件总线 */
  mitt: Mitt
  /** 完整配置项 */
  config: CrudOptions
  /**
   * 代理调用
   * @param name 方法名
   * @param data 参数
   */
  proxy: (name: string, data?: any[]) => void
  /**
   * 设置属性
   * @param key 键
   * @param value 值
   */
  set: (key: string, value: any) => void
  /**
   * 监听事件
   * @param name 事件名
   * @param callback 回调函数
   */
  on: (name: string, callback: (...args: any[]) => void) => void
  /**
   * 查看详情
   * @param data 行数据
   */
  rowInfo: (data: any) => void
  /**
   * 打开新增弹窗
   */
  rowAdd: () => void
  /**
   * 打开编辑弹窗
   * @param data 行数据
   */
  rowEdit: (data: any) => void
  /**
   * 追加数据
   * @param data 数据
   */
  rowAppend: (data: any) => void
  /**
   * 删除数据
   * @param selection 选中项
   */
  rowDelete: (...selection: any[]) => Promise<void> | void
  /**
   * 关闭弹窗/重置状态
   */
  rowClose: () => void
  /**
   * 刷新列表
   * @param params 查询参数
   */
  refresh: (params?: CrudParams) => Promise<any>
  /**
   * 获取权限状态
   * @param key 权限类型
   */
  getPermission: (key: "page" | "list" | "detail" | "update" | "add" | "delete") => boolean
  /**
   * 参数替换处理
   * @param params 原始参数
   */
  paramsReplace: (params: CrudParams) => CrudParams
  /**
   * 获取当前参数
   */
  getParams: () => CrudParams
  /**
   * 设置当前参数
   * @param data 参数对象
   */
  setParams: (data: CrudParams) => void
  /**
   * 动态应用配置
   * @param options 配置项
   */
  use?: (options: Partial<CrudOptions>) => void
  [key: string]: any
}
