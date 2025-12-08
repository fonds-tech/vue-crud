import type { CrudRef } from "../../crud/interface"
import type { UpsertState } from "./state"
import type { UpsertCloseAction } from "../interface"
import { ElMessage } from "element-plus"
import { clone, isFunction } from "@fonds/utils"

/**
 * Upsert 服务上下文
 */
interface UpsertServiceContext {
  crud: CrudRef
  state: UpsertState
  builder: ReturnType<typeof import("./form").createFormBuilder>
}

/**
 * 获取详情接口名称
 *
 * @param crud CRUD 上下文
 * @returns 详情 API 名称
 */
function getDetailApiName(crud: CrudRef) {
  return crud.dict?.api?.detail ?? "detail"
}

/**
 * 获取主键字段名
 *
 * @param crud CRUD 上下文
 * @returns 主键字段名
 */
function getPrimaryKey(crud: CrudRef) {
  return crud.dict?.primaryId ?? "id"
}

/**
 * 请求详情数据
 *
 * @param crud CRUD 上下文
 * @param query 查询参数
 * @param done 完成回调
 * @param loading 加载状态引用
 * @param loading.value 加载布尔值（El Loading 指令依赖）
 * @returns 详情数据 Promise
 */
function requestDetail(crud: CrudRef, query: Record<string, unknown>, done: (value: Record<string, unknown>) => void, loading: { value: boolean }) {
  const apiName = getDetailApiName(crud)
  const service = crud.service?.[apiName]
  if (typeof service !== "function") {
    const error = new Error(`未在 CRUD service 中找到 ${apiName} 方法`)
    ElMessage.error(error.message)
    loading.value = false
    return Promise.reject(error)
  }
  return service(query)
    .then((res: Record<string, unknown>) => {
      done(res ?? {})
      return res
    })
    .catch((err: unknown) => {
      let message = "详情查询失败"
      if (typeof err === "object" && err !== null && "message" in err) {
        const maybeMessage = (err as Record<string, unknown>).message
        if (typeof maybeMessage === "string") {
          message = maybeMessage
        }
      }
      ElMessage.error(message)
      throw err
    })
    .finally(() => {
      loading.value = false
    })
}

/**
 * Upsert 行为服务：open/append/update/submit 等。
 */
export function createUpsertService(context: UpsertServiceContext) {
  const { crud, state, builder } = context

  /**
   * 关闭弹窗
   *
   * @param action 关闭动作类型
   */
  function close(action: UpsertCloseAction = "cancel") {
    state.closeAction.value = action
    state.visible.value = false
  }

  /**
   * 打开弹窗
   * @param initialData 初始数据
   */
  async function open(initialData: Record<string, unknown> = {}) {
    state.closeAction.value = "cancel"
    state.visible.value = true
    await builder.applyForm(initialData)
  }

  /**
   * 打开新增模式
   *
   * @param data 初始表单数据
   */
  async function add(data: Record<string, unknown> = {}) {
    state.mode.value = "add"
    state.loading.value = false
    await open(data)
  }

  /**
   * 打开追加模式
   *
   * 本质为新增，但可能携带上下文（如父记录 ID）
   *
   * @param data 初始表单数据
   */
  async function append(data: Record<string, unknown> = {}) {
    state.mode.value = "add"
    state.loading.value = false
    await open(data)
  }

  /**
   * 打开编辑模式
   *
   * 自动处理详情查询逻辑
   *
   * @param row 编辑行数据
   */
  async function update(row: Record<string, unknown> = {}) {
    state.mode.value = "update"
    state.loading.value = true
    await open(row)
    const done = async (value: Record<string, unknown> = {}) => {
      state.loading.value = false
      await builder.applyForm(value)
    }
    const next = (query: Record<string, unknown>) => requestDetail(crud, query, done, state.loading)
    if (isFunction(state.options.onDetail)) {
      return state.options.onDetail(row, { mode: state.mode.value, done, next, close })
    }
    const primaryKey = getPrimaryKey(crud)
    if (row?.[primaryKey] === undefined) {
      const error = new Error(`缺少主键字段 ${primaryKey}`)
      ElMessage.error(error.message)
      state.loading.value = false
      return Promise.reject(error)
    }
    return next({ [primaryKey]: row[primaryKey] })
  }

  /**
   * 分步表单：下一步
   */
  function handleNext() {
    if (state.formRef.value?.next) {
      state.formRef.value.next()
    }
  }

  /**
   * 分步表单：上一步
   */
  function handlePrev() {
    if (state.formRef.value?.prev) {
      state.formRef.value.prev()
    }
  }

  /**
   * 提交表单
   *
   * 包含表单校验、自定义提交逻辑、默认提交逻辑
   *
   * @param extra 额外的提交数据
   * @returns 提交结果 Promise
   */
  async function submit(extra: Record<string, unknown> = {}) {
    const formRef = state.formRef.value
    if (!formRef) {
      return Promise.reject(new Error("表单未初始化"))
    }
    state.loading.value = true
    const result = await formRef.submit()
    const values: Record<string, unknown> = result && "values" in result ? result.values : {}
    const errors = result && "errors" in result ? result.errors : undefined
    if (errors && Object.keys(errors).length > 0) {
      state.loading.value = false
      return null
    }
    const payload: Record<string, unknown> = Object.assign({}, clone(values), clone(extra))
    const done = () => {
      state.loading.value = false
      close("submit")
      crud.refresh?.()
      ElMessage.success(crud.dict?.label?.saveSuccess ?? "保存成功")
    }
    const next = (data: Record<string, unknown>) => {
      const apiName = state.mode.value === "add" ? crud.dict?.api?.add ?? "add" : crud.dict?.api?.update ?? "update"
      const service = crud.service?.[apiName]
      if (typeof service !== "function") {
        const error = new Error(`未在 CRUD service 中找到 ${apiName} 方法`)
        ElMessage.error(error.message)
        state.loading.value = false
        return Promise.reject(error)
      }
      return service(data)
        .then((res: unknown) => {
          done()
          return res
        })
        .catch((err: unknown) => {
          state.loading.value = false
          throw err
        })
    }
    if (isFunction(state.options.onSubmit)) {
      const response = state.options.onSubmit(payload, { mode: state.mode.value, done, next, close })
      return Promise.resolve(response)
    }
    return next(payload)
  }

  /**
   * 处理代理事件
   *
   * 响应底层 CRUD 事件
   *
   * @param payload 事件载荷
   */
  function handleProxyEvent(payload: unknown) {
    if (!payload || typeof payload !== "object") return
    const name = "name" in payload && typeof (payload as { name?: unknown }).name === "string" ? (payload as { name?: string }).name : undefined
    const data = "data" in payload && Array.isArray((payload as { data?: unknown }).data) ? (payload as { data?: Array<Record<string, unknown>> }).data ?? [] : []
    switch (name) {
      case "add":
        add(data[0] ?? {})
        break
      case "append":
        append(data[0] ?? {})
        break
      case "edit":
        update(data[0] ?? {})
        break
      case "close":
        close("cancel")
        break
      default:
        break
    }
  }

  return {
    open,
    add,
    append,
    update,
    close,
    submit,
    handleNext,
    handlePrev,
    handleProxyEvent,
  }
}
