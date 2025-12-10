import type { Ref } from "vue"
import type { FormHelpers } from "./helpers"
import type { FormItem, FormRecord, FormOptions, MaybePromise, FormUseOptions, FormAsyncOptionsState } from "../types"
import { merge } from "lodash-es"

export function createInitialOptions(): FormOptions {
  return {
    key: 0,
    mode: "add",
    model: {},
    items: [],
    group: {},
    form: {
      labelWidth: "auto",
      scrollToError: true,
      validateOnRuleChange: true,
    },
    grid: {
      cols: 1,
      colGap: 0,
      rowGap: 0,
      collapsed: false,
      collapsedRows: 1,
    },
  }
}

interface MergeContext {
  options: FormOptions
  model: FormRecord
  step: Ref<number>
  helpers: Pick<FormHelpers, "isFormItemConfig">
}

/**
 * 合并外部 use 配置到内部响应式 options，并同步模型与步骤。
 * @param options 参数对象
 * @param options.options 当前表单配置
 * @param options.model 当前表单数据模型
 * @param options.step 步骤 Ref
 * @param options.helpers 辅助方法集合
 * @param useOptions 外部传入的配置
 */
export function mergeFormOptions({ options, model, step, helpers }: MergeContext, useOptions: FormUseOptions = {}) {
  if (useOptions.key !== undefined) {
    options.key = Number(useOptions.key)
  }
  if (useOptions.mode) {
    options.mode = useOptions.mode
  }
  if (useOptions.form) {
    options.form = merge({}, options.form, useOptions.form)
  }
  if (useOptions.grid) {
    options.grid = merge({}, options.grid, useOptions.grid)
  }
  if (useOptions.group) {
    options.group = merge({}, options.group, useOptions.group)
  }
  if (useOptions.items) {
    const nextItems: FormItem[] = useOptions.items.filter(helpers.isFormItemConfig)
    options.items.splice(0, options.items.length, ...nextItems)
  }
  if (useOptions.onNext) {
    options.onNext = useOptions.onNext
  }
  if (useOptions.onSubmit) {
    options.onSubmit = useOptions.onSubmit
  }
  if (useOptions.model) {
    Object.keys(model).forEach((key) => {
      delete model[key]
    })
    Object.assign(model, useOptions.model)
  }
  step.value = 1
}

const isPromiseLike = <T>(value: unknown): value is Promise<T> => Boolean(value && typeof (value as { then?: unknown }).then === "function")

/**
 * 确保选项状态存在
 */
export function ensureOptionState(optionState: Record<string, FormAsyncOptionsState>, key: string) {
  if (!optionState[key]) optionState[key] = { loading: false }
  return optionState[key]!
}

/**
 * 同步 options 状态：缓存当前 Promise，避免重复请求，处理竞态。
 */
export function syncOptions(optionState: Record<string, FormAsyncOptionsState>, key: string, value: MaybePromise<any[] | undefined>) {
  const state = ensureOptionState(optionState, key)

  if (isPromiseLike(value)) {
    if (state.pending === value && state.loading) return state

    const requestId = (state.requestId ?? 0) + 1
    state.pending = value
    state.requestId = requestId
    state.loading = true
    state.error = undefined

    value
      .then((data) => {
        if (state.requestId === requestId) {
          state.value = data
          state.loading = false
          state.pending = undefined
        }
      })
      .catch((error: unknown) => {
        if (state.requestId === requestId) {
          state.error = error
          state.loading = false
          state.pending = undefined
        }
      })

    return state
  }

  state.pending = undefined
  state.value = value as any[] | undefined
  state.loading = false
  state.error = undefined
  return state
}
