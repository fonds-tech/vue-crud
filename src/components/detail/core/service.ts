import type { DetailData, DetailOptions } from "../interface"
import { ElMessage } from "element-plus"
import { pick, merge } from "lodash-es"
import { clone, isFunction } from "@fonds/utils"

interface ServiceParams<D extends DetailData = DetailData> {
  crud: {
    dict?: { primaryId?: string, api?: Partial<Record<string, string>> }
    service?: Record<string, any>
  }
  options: DetailOptions<D>
  data: { value: D }
  paramsCache: { value: Record<string, any> }
  loading: { value: boolean }
  visible: { value: boolean }
  setData: (value: D) => void
}

/** 创建详情与刷新流程，含并发防脏落地。 */
export function createDetailService<D extends DetailData = DetailData>(ctx: ServiceParams<D>) {
  const refreshToken = { value: 0 }
  const defaultErrorMessage = "详情查询失败"

  function getDetailApiName() {
    return ctx.crud.dict?.api?.detail ?? "detail"
  }

  function requestDetail(query: Record<string, any>, done: (value: Record<string, any>) => void, token: number) {
    const apiName = getDetailApiName()
    const service = ctx.crud.service?.[apiName]
    if (!isFunction(service)) {
      const error = new Error(`未在 CRUD service 中找到 ${apiName} 方法`)
      if (token === refreshToken.value) ctx.loading.value = false
      ElMessage.error(error.message)
      return Promise.reject(error)
    }
    ctx.paramsCache.value = clone(query)
    return service(query)
      .then((res: Record<string, any>) => {
        if (token === refreshToken.value) done(res ?? {})
        return res
      })
      .catch((err: any) => {
        if (token === refreshToken.value) ElMessage.error(defaultErrorMessage)
        throw err
      })
      .finally(() => {
        if (token === refreshToken.value) ctx.loading.value = false
      })
  }

  function runDetailFlow(params: Record<string, any>, defaultQuery: Record<string, any> = {}) {
    let requested = false
    const currentToken = ++refreshToken.value
    const done = (value: Record<string, any> = {}) => {
      ctx.setData(value as D)
      ctx.loading.value = false
    }
    const finalizeIfIdle = () => {
      if (!requested && currentToken === refreshToken.value) ctx.loading.value = false
    }
    const next = (query: Record<string, any>) => {
      requested = true
      ctx.loading.value = true
      ctx.paramsCache.value = clone(query)
      return requestDetail(query, done, currentToken)
    }

    if (isFunction(ctx.options.onDetail)) {
      try {
        const result = ctx.options.onDetail(params as D, { done, next, close: () => close() })
        return Promise.resolve(result)
          .catch((error: any) => {
            if (currentToken === refreshToken.value) ElMessage.error(defaultErrorMessage)
            throw error
          })
          .finally(finalizeIfIdle)
      }
      catch (error: any) {
        if (currentToken === refreshToken.value) ElMessage.error(defaultErrorMessage)
        finalizeIfIdle()
        return Promise.reject(error)
      }
    }

    const query = Object.keys(defaultQuery).length ? defaultQuery : params
    if (!Object.keys(query).length) {
      finalizeIfIdle()
      return
    }
    return next(query)
  }

  function close() {
    ctx.visible.value = false
    ctx.loading.value = false
  }

  function detail(row: DetailData) {
    if (!row || typeof row !== "object") {
      ElMessage.warning("无效的详情数据")
      return
    }
    const primaryKey = ctx.crud.dict?.primaryId ?? "id"
    const defaultQuery = pick(row, [primaryKey])
    if (defaultQuery[primaryKey] === undefined || defaultQuery[primaryKey] === null) {
      ElMessage.warning(`缺少主键字段 ${primaryKey}`)
      return
    }
    ctx.setData(row as D)
    ctx.visible.value = true
    ctx.loading.value = true
    return runDetailFlow(row, defaultQuery)
  }

  function refresh(params: Record<string, any> = {}) {
    const query = merge(clone(ctx.paramsCache.value), params)
    if (!Object.keys(query).length) {
      ctx.loading.value = false
      return
    }
    return runDetailFlow(query, query)
  }

  return {
    detail,
    refresh,
    close,
    runDetailFlow,
  }
}
