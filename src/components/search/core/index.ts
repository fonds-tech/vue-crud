import type { Slots } from "vue"
import type { FormRef, FormRecord } from "../../form/types"
import type { SearchCore, SearchAction, SearchOptions, InternalOptions } from "../interface"
import { merge } from "lodash-es"
import { useCore } from "@/hooks"
import { resolve } from "@/utils"
import { resolveComponent } from "./helpers"
import { useSearchLifecycle } from "./lifecycle"
import { resolveResponsiveValue } from "../../grid/utils"
import { ref, watch, computed, reactive } from "vue"
import { clone, isDef, isEmpty, isFunction } from "@fonds/utils"
import { mergeSearchOptions, createDefaultOptions } from "./options"

/**
 * 搜索核心 Composable
 */
export function useSearchCore(setupSlots: Slots): SearchCore {
  const { crud, mitt } = useCore()

  const formRef = ref<FormRef<FormRecord>>()
  const loading = ref(false)
  const collapsed = ref(false)
  const viewportWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1920)

  const options = reactive<InternalOptions>(createDefaultOptions())

  const formModel = computed<FormRecord>(() => formRef.value?.model ?? (options.form.model as FormRecord) ?? {})
  const resolvedActions = computed(() => (options.action.items.length ? options.action.items : [{ type: "search" }, { type: "reset" }] as SearchAction[]))

  const actionGridProps = computed(() => {
    const grid = options.action.grid ?? {}
    const colGap = Math.max(0, resolveResponsiveValue(grid.colGap ?? 12, viewportWidth.value, 12))
    const rowGap = Math.max(0, resolveResponsiveValue(grid.rowGap ?? 12, viewportWidth.value, 12))
    const cols = Math.max(1, resolveResponsiveValue(grid.cols ?? 24, viewportWidth.value, 24))
    const collapsedState = grid.collapsed ?? false
    const collapsedRows = Math.max(1, grid.collapsedRows ?? 1)
    return { cols, colGap, rowGap, collapsed: collapsedState, collapsedRows }
  })

  const collapseLabel = computed(() => (collapsed.value ? crud.dict?.label?.expand ?? "展开" : crud.dict?.label?.collapse ?? "折叠"))

  const formSlots = computed(() => {
    const vSlots: Record<string, any> = {}
    Object.keys(setupSlots).forEach((name) => {
      vSlots[name] = (scope?: Record<string, any>) => setupSlots[name]?.(scope ?? {})
    })
    return vSlots
  })

  // 解析方法
  const resolveActionCol = (action: SearchAction) => {
    const merged = action.col ?? {}
    return {
      span: resolveResponsiveValue(merged.span ?? 1, viewportWidth.value, 1),
      offset: resolveResponsiveValue(merged.offset ?? 0, viewportWidth.value, 0),
    }
  }

  const getActionItemProps = (action: SearchAction) => {
    const col = resolveActionCol(action)
    return { span: col.span, offset: col.offset }
  }

  const getActionSlot = (action: SearchAction): string | undefined =>
    resolve(action.slot, formModel.value) ?? resolveComponent(action, "slot", formModel.value)

  const getComponentIs = (action: SearchAction) => resolveComponent(action, "is", formModel.value)
  const getComponentProps = (action: SearchAction) => resolveComponent(action, "props", formModel.value) ?? {}
  const getComponentEvents = (action: SearchAction) => resolveComponent(action, "on", formModel.value) ?? {}
  const getComponentStyle = (action: SearchAction) => resolveComponent(action, "style", formModel.value)
  const getComponentSlots = (action: SearchAction) => resolveComponent(action, "slots", formModel.value) ?? {}

  // 格式化查询参数
  const formatQuery = (data: Record<string, any> = {}) => {
    const values = clone(data)
    Object.keys(values).forEach((key) => {
      const value = values[key]
      if (!isDef(value) || (typeof value === "string" && value.trim() === "")) {
        delete values[key]
      }
    })
    return values
  }

  // 设置参数
  const assignParams = (params: Record<string, any>) => {
    const current = crud.getParams?.() ?? {}
    const size = current.size ?? crud.params?.size

    Object.keys(crud.params).forEach((key) => {
      if (key !== "size") {
        delete crud.params[key]
      }
    })

    const nextParams: Record<string, any> = { page: 1, ...params }
    if (isDef(size)) {
      nextParams.size = size
    }

    crud.setParams(nextParams)
  }

  // 搜索
  const search = (extra: Record<string, any> = {}) =>
    new Promise((resolve, reject) => {
      formRef.value?.submit(async (model, errors) => {
        if (!isEmpty(errors)) {
          reject(errors)
          return
        }
        const payload = formatQuery(merge({}, model, extra))
        const next = async (params: Record<string, any> = {}) => {
          try {
            loading.value = true
            assignParams(params)
            const result = await crud.refresh(params)
            resolve(result)
            return result
          }
          finally {
            loading.value = false
          }
        }

        try {
          if (options.onSearch) {
            await options.onSearch(payload, { next })
          }
          else {
            await next(payload)
          }
        }
        catch (error) {
          reject(error)
        }
      })
    })

  // 重置
  const reset = (extra: Record<string, any> = {}) =>
    new Promise((resolve, reject) => {
      const runner = async () => {
        try {
          formRef.value?.resetFields?.()
          formRef.value?.bindFields?.(extra)
          const payload = formatQuery(formModel.value)
          const next = async (params: Record<string, any> = {}) => {
            assignParams(params)
            mitt.emit("table.clearSelection")
            const result = await crud.refresh(params)
            resolve(result)
            return result
          }

          if (options.onReset) {
            await options.onReset(payload, { next })
          }
          else {
            await next(payload)
          }
        }
        catch (error) {
          reject(error)
        }
      }

      runner()
    })

  // 初始化
  const use = (useOptions: SearchOptions = {}) => {
    if (!useOptions) return

    mergeSearchOptions(options, useOptions)
    collapsed.value = Boolean(options.form?.grid?.collapsed)
    formRef.value?.use(clone(options.form))
  }

  // 折叠
  const collapse = (state?: boolean) => {
    if (typeof state === "boolean") {
      collapsed.value = state
      formRef.value?.collapse?.(state)
    }
    else {
      collapsed.value = !collapsed.value
      formRef.value?.collapse?.()
    }
  }

  // 事件处理器
  const searchHandler = (params?: any) => search(params ?? {})
  const resetHandler = (params?: any) => reset(params ?? {})
  const getModelHandler = (callback?: any) => {
    if (isFunction(callback)) {
      callback(formModel.value)
    }
  }

  // 监听模型变化
  watch(
    () => formModel.value,
    (model) => {
      mitt.emit("search.model", model)
    },
    { deep: true },
  )

  // 生命周期
  useSearchLifecycle({
    viewportWidth,
    searchHandler,
    resetHandler,
    getModelHandler,
    mitt,
  })

  return {
    formRef,
    loading,
    collapsed,
    viewportWidth,
    options,
    formModel,
    resolvedActions,
    actionGridProps,
    collapseLabel,
    formSlots,
    crud,
    mitt,

    resolveActionCol,
    getActionItemProps,
    getActionSlot,
    getComponentIs,
    getComponentProps,
    getComponentEvents,
    getComponentStyle,
    getComponentSlots,

    use,
    search,
    reset,
    collapse,
  }
}

export { resolveComponent } from "./helpers"
