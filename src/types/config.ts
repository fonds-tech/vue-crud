export interface Dict {
  primaryId: string
  api: {
    add: string
    page: string
    list: string
    update: string
    delete: string
    detail: string
  }
  pagination: {
    page: string
    size: string
  }
  search: {
    keyWord: string
    query: string
  }
  sort: {
    order: string
    prop: string
  }
  label: Label
}

export interface Label {
  add: string
  list: string
  title: string
  update: string
  delete: string
  detail: string
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
    size: 'large' | 'default' | 'small'
  }
  events: {
    [key: string]: (...args: any[]) => any
  }
}

export type Options = Partial<Config>
