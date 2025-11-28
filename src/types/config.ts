export interface Dict {
  primaryId: string
  api: {
    add: string
    page: string
    list: string
    update: string
    delete: string
    detail?: string
    [key: string]: string | undefined
  }
  pagination?: {
    page: string
    size: string
    [key: string]: string
  }
  search?: {
    keyWord?: string
    query?: string
    [key: string]: string | undefined
  }
  sort?: {
    order?: string
    prop?: string
    [key: string]: string | undefined
  }
  label: Label
}

export interface Label {
  add: string
  list: string
  update: string
  delete: string
  detail?: string
  title?: string
  [key: string]: string | undefined
}

export interface Permission {
  add?: boolean
  page?: boolean
  list?: boolean
  delete?: boolean
  update?: boolean
  detail?: boolean
  [key: string]: any
}

export interface Config {
  dict: Dict
  permission: Permission
  style: {
    size: "large" | "default" | "small"
    form?: {
      span?: number
      labelWidth?: number | string
      labelPosition?: "left" | "right" | "top"
      plugins?: Array<Record<string, any>>
    }
  }
  events: {
    [key: string]: (...args: any[]) => any
  }
  onRefresh?: (
    params: Record<string, any>,
    ctx: {
      next: (params: Record<string, any>) => Promise<any>
      done: () => void
      render: (data: any, pagination?: any) => void
    },
  ) => void
  onDelete?: (
    selection: any[],
    ctx: {
      next: (data: Record<string, any>) => Promise<any>
    },
  ) => void
}

export type Options = Partial<Config>
