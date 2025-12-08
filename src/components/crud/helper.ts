import type Mitt from "../../utils/mitt"
import type { CrudRef, CrudParams, CrudOptions } from "./interface"
import { merge } from "lodash-es"
import { isFunction } from "@fonds/utils"

interface HelperOptions {
  mitt: Mitt
  crud: CrudRef
  config: CrudOptions
}

export function paramsReplace(dict: CrudRef["dict"], params: CrudParams): CrudParams {
  const { pagination = {}, search = {}, sort = {} } = dict || {}

  const a: Record<string, any> = { ...params }
  const originalUnderscoreKeys = new Set(
    Object.keys(params).filter(key => typeof key === "string" && key.startsWith("_")),
  )
  const b: Record<string, any> = { ...pagination, ...search, ...sort }

  for (const i in b) {
    if (a[i]) {
      if (i !== b[i]) {
        a[`_${b[i]}`] = a[i]
        delete a[i]
      }
    }
  }

  for (const i in a) {
    if (i[0] === "_" && originalUnderscoreKeys.has(i)) {
      a[i.substring(1)] = a[i]
      delete a[i]
    }
  }

  return a
}

export function createHelper({ config, crud, mitt }: HelperOptions) {
  // 代理
  function proxy(name: string, data?: any[]) {
    mitt.emit("crud.proxy", {
      name,
      data,
    })
  }

  // 获取权限
  function getPermission(key: "page" | "list" | "detail" | "update" | "add" | "delete"): boolean {
    return Boolean(crud.permission?.[key])
  }

  // 获取请求参数
  function getParams() {
    return crud.params
  }

  // 替换请求参数
  function setParams(data: Record<string, any>) {
    merge(crud.params, data)
  }

  // 设置
  function set(key: string, value: any) {
    if (!value) {
      return false
    }

    switch (key) {
      case "service": {
        Object.assign(crud.service, value)
        Object.setPrototypeOf(crud.service, Object.getPrototypeOf(value))
        if (value && typeof value === "object" && "_permission" in value) {
          const permissions = (value as { _permission?: Record<string, any> })._permission
          if (permissions) {
            Object.keys(permissions).forEach((name) => {
              crud.permission[name] = permissions[name]
            })
          }
        }
        break
      }

      case "permission":
        if (isFunction(value)) {
          merge(crud.permission, value(crud))
        }
        else {
          merge(crud.permission, value)
        }
        break

      default:
        merge((crud as any)[key], value)
        break
    }
  }

  // 监听事件
  function on(name: string, callback: (...args: any[]) => void) {
    mitt.on(`${name}-${crud.id}`, callback)
  }

  // 打开详情
  function rowInfo(data: any) {
    proxy("detail", [data])
  }

  // 打开新增
  function rowAdd() {
    proxy("add")
  }

  // 打开编辑
  function rowEdit(data: any) {
    proxy("edit", [data])
  }

  // 打开追加
  function rowAppend(data: any) {
    proxy("append", [data])
  }

  // 关闭新增、编辑弹窗
  function rowClose() {
    proxy("close")
  }

  // 默认值
  set("dict", config?.dict)
  set("service", config?.service)
  set("permission", config?.permission)

  return {
    proxy,
    set,
    on,
    rowInfo,
    rowAdd,
    rowEdit,
    rowAppend,
    rowDelete: undefined as unknown as CrudRef["rowDelete"], // 由 service.ts 覆盖
    rowClose,
    getPermission,
    paramsReplace: (params: CrudParams) => paramsReplace(crud.dict, params),
    getParams,
    setParams,
  }
}

export type { HelperOptions }
