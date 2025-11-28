import type Mitt from "../../utils/mitt"
import type { Dict, Config, Permission } from "../../types/config"

export type CrudParams = Record<string, any>

export type CrudService = Record<string, any>

export interface CrudRef {
  id: string | number | undefined
  loading: boolean
  selection: any[]
  params: CrudParams
  service: CrudService
  dict: Dict
  permission: Permission
  mitt: Mitt
  config: CrudOptions
  proxy: (name: string, data?: any[]) => void
  set: (key: string, value: any) => void
  on: (name: string, callback: (...args: any[]) => void) => void
  rowInfo: (data: any) => void
  rowAdd: () => void
  rowEdit: (data: any) => void
  rowAppend: (data: any) => void
  rowDelete: (...selection: any[]) => Promise<void> | void
  rowClose: () => void
  refresh: (params?: CrudParams) => Promise<any>
  getPermission: (key: "page" | "list" | "detail" | "update" | "add" | "delete") => boolean
  paramsReplace: (params: CrudParams) => CrudParams
  getParams: () => CrudParams
  setParams: (data: CrudParams) => void
  use?: (options: Partial<CrudOptions>) => void
  [key: string]: any
}

export interface CrudOptions extends Config {
  service?: any
}
