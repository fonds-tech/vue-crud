import type { Mitt } from "@fonds/utils"
import type { CrudRef, CrudOptions } from "../../types"
import { ref } from "vue"
import { merge, assign } from "lodash-es"
import { isArray, isFunction } from "@fonds/utils"
import { ElMessage, ElMessageBox } from "element-plus"

/* CRUD 助手依赖运行期 schema/服务交互，允许必要的动态类型操作 */

interface HelperOptions {
  mitt: Mitt
  crud: CrudRef
  config: CrudOptions
}

export function useHelper({ config, crud, mitt }: HelperOptions) {
  // 刷新随机值，避免脏数据
  const refreshRd = ref(0)

  // 获取权限
  function getPermission(key: "page" | "list" | "info" | "update" | "add" | "delete"): boolean {
    return Boolean(crud.permission?.[key])
  }

  // 根据字典替换请求参数
  function paramsReplace(params: Record<string, any>) {
    const { pagination = {}, search = {}, sort = {} } = crud.dict || {}

    // 请求参数
    const a: Record<string, any> = { ...params }

    // 字典
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
      if (i[0] === "_") {
        a[i.substring(1)] = a[i]

        delete a[i]
      }
    }

    return a
  }

  // 刷新请求
  function refresh(params: Record<string, any> = {}) {
    const { service, dict } = crud
    const pageService = service?.[dict.api.page]

    return new Promise((success, error) => {
      // 合并请求参数
      const reqParams = paramsReplace(assign(crud.params, params))

      // Loading
      crud.loading = true

      // 预防脏数据
      const rd = (refreshRd.value = Math.random())

      // 完成事件
      function done() {
        crud.loading = false
      }

      // 渲染
      function render(data: any | any[], pagination?: any) {
        const res = isArray(data) ? { list: data, pagination } : data
        done()
        success(res)
        mitt.emit("crud.refresh", res)
        const pageInfo = res?.pagination ?? {}
        mitt.emit("table.refresh", {
          list: Array.isArray(res?.list) ? res.list : [],
          page: pageInfo.page ?? pageInfo.currentPage,
          count: pageInfo.total ?? res?.count ?? (Array.isArray(res?.list) ? res.list.length : 0),
          pageSize: pageInfo.size ?? pageInfo.pageSize,
        })
      }

      // 下一步：支持缺省分页服务的兜底，避免 Loading 卡死
      function next(params: Record<string, any>): Promise<any> {
        return new Promise((resolve, reject) => {
          const hasService = Boolean(service)
          const shouldWarn = hasService && (crud.permission?.page ?? true)

          if (!pageService) {
            if (shouldWarn)
              ElMessage.warning(dict?.label?.pageMissing ?? "未配置分页服务，跳过刷新")
            done()
            resolve({})
            return
          }

          pageService(params)
            .then((res: any) => {
              if (rd !== refreshRd.value) {
                return
              }

              if (isArray(res)) {
                res = {
                  list: res,
                  pagination: { total: res.length },
                }
              }

              render(res)
              resolve(res)
            })
            .catch((err: any) => {
              ElMessage.error(err.message)
              error(err)
              reject(err)
            })
            .finally(done)
        })
      }

      // 刷新钩子
      if (config?.onRefresh) {
        config.onRefresh(reqParams, { next, done, render })
      }
      else {
        next(reqParams)
      }
    })
  }

  // 打开详情
  function rowInfo(data: any) {
    mitt.emit("crud.proxy", {
      name: "info",
      data: [data],
    })
  }

  // 打开新增
  function rowAdd() {
    mitt.emit("crud.proxy", {
      name: "add",
    })
  }

  // 打开编辑
  function rowEdit(data: any) {
    mitt.emit("crud.proxy", {
      name: "edit",
      data: [data],
    })
  }

  // 打开追加
  function rowAppend(data: any) {
    mitt.emit("crud.proxy", {
      name: "append",
      data: [data],
    })
  }

  // 关闭新增、编辑弹窗
  function rowClose() {
    mitt.emit("crud.proxy", {
      name: "close",
    })
  }

  // 删除请求
  function rowDelete(...selection: any[]) {
    const { service, dict } = crud

    // 参数
    const params = {
      ids: selection.map(e => e[dict.primaryId]),
    }

    // 下一步
    async function next(data: Record<string, any>) {
      return new Promise((resolve, reject) => {
        ElMessageBox({
          type: "warning",
          title: dict.label.tips,
          message: dict.label.deleteConfirm,
          confirmButtonText: dict.label.confirm,
          cancelButtonText: dict.label.close,
          showCancelButton: true,
          async beforeClose(action, instance, done) {
            if (action === "confirm") {
              instance.confirmButtonLoading = true

              await service[dict.api.delete]({ ...params, ...data })
                .then((res: any) => {
                  ElMessage.success(dict.label.deleteSuccess)

                  refresh()
                  resolve(res)
                })
                .catch((err: any) => {
                  ElMessage.error(err.message)
                  reject(err)
                })

              instance.confirmButtonLoading = false
            }

            done()
          },
        }).catch(() => null)
      })
    }

    // 删除钩子
    if (config?.onDelete) {
      config.onDelete(selection, { next })
    }
    else {
      next(params)
    }
  }

  // 代理
  function proxy(name: string, data?: any[]) {
    mitt.emit("crud.proxy", {
      name,
      data,
    })
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
      // 服务
      case "service":
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

      // 权限
      case "permission":
        if (isFunction(value)) {
          merge(crud.permission, value(crud))
        }
        else {
          merge(crud.permission, value)
        }
        break

      default:
        merge(crud[key], value)
        break
    }
  }

  // 监听事件
  function on(name: string, callback: (...args: any[]) => void) {
    mitt.on(`${name}-${crud.id}`, callback)
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
    rowDelete,
    rowClose,
    refresh,
    getPermission,
    paramsReplace,
    getParams,
    setParams,
  }
}

export type { HelperOptions }
