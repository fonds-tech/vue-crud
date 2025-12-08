import type Mitt from "../../utils/mitt"
import type { CrudRef, CrudParams, CrudOptions } from "./interface"
import { ref } from "vue"
import { assign } from "lodash-es"
import { isArray } from "@fonds/utils"
import { ElMessage, ElMessageBox } from "element-plus"

interface ServiceOptions {
  mitt: Mitt
  crud: CrudRef
  config: CrudOptions
  paramsReplace: (params: CrudParams) => CrudParams
}

export function createService({ config, crud, mitt, paramsReplace }: ServiceOptions) {
  // 刷新随机值，避免脏数据
  const refreshRd = ref(0)

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
      function next(nextParams: Record<string, any>): Promise<any> {
        return new Promise((resolve, reject) => {
          const hasService = Boolean(service)
          const shouldWarn = hasService && (crud.permission?.page ?? true)

          if (!pageService) {
            if (shouldWarn) ElMessage.warning(dict?.label?.pageMissing ?? "未配置分页服务，跳过刷新")
            done()
            success({})
            resolve({})
            return
          }

          pageService(nextParams)
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

  const api: { refresh: typeof refresh, rowDelete?: typeof rowDelete } = {
    refresh,
  }

  // 删除请求
  function rowDelete(...selection: any[]) {
    const { service, dict } = crud

    // 参数
    const params = {
      ids: selection.map(e => e?.[dict.primaryId]),
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

                  api.refresh()
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

  api.rowDelete = rowDelete

  return api
}

export type { ServiceOptions }
