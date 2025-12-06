import type { GridProps } from "../fd-grid"
import type { Component, VNodeChild } from "vue"
import type { SearchAction, SearchOptions } from "./types"
import type { FormRef, FormRecord, FormUseOptions } from "../fd-form/types"
import FdForm from "../fd-form/form"
import FdGrid from "../fd-grid"
import FdGridItem from "../fd-grid-item"
import { merge } from "lodash-es"
import { useCore } from "@/hooks"
import { clone, isDef } from "@fonds/utils"
import { ElIcon, ElButton } from "element-plus"
import { isEmpty, isFunction } from "@/utils/check"
import { resolveResponsiveValue } from "../fd-grid/utils"
import { Search as IconSearch, ArrowUp as IconArrowUp, Loading as IconLoading, Refresh as IconRefresh, ArrowDown as IconArrowDown } from "@element-plus/icons-vue"
import {
  h,
  ref,
  watch,
  computed,
  reactive,
  useSlots,
  onMounted,

  defineComponent,
  onBeforeUnmount,
  resolveDynamicComponent,
} from "vue"

import "./style.scss"

const defaultActions: SearchAction[] = [{ type: "search" }, { type: "reset" }]
const defaultActionGap = 12

interface InternalActionOptions<T extends FormRecord = FormRecord> {
  items: SearchAction<T>[]
  grid?: GridProps
}

interface InternalOptions<T extends FormRecord = FormRecord> {
  form: FormUseOptions<T>
  action: InternalActionOptions<T>
  onSearch?: SearchOptions<T>["onSearch"]
  onReset?: SearchOptions<T>["onReset"]
}

function transformEvents(events: Record<string, (...args: any[]) => void> = {}) {
  const mapped: Record<string, (...args: any[]) => void> = {}
  Object.keys(events).forEach((key) => {
    const handler = events[key]
    if (handler) {
      const camel = `on${key[0].toUpperCase()}${key.slice(1)}`
      mapped[camel] = handler
    }
  })
  return mapped
}

function resolveMaybe<T,>(value: ((model: FormRecord) => T) | T | undefined, model: FormRecord): T | undefined {
  if (typeof value === "function") {
    return (value as (model: FormRecord) => T)(model)
  }
  return value
}

function resolveComponent(action: SearchAction, key: keyof NonNullable<SearchAction["component"]>, model: FormRecord) {
  const component = action.component
  if (!component) return undefined
  const value = component[key]
  return resolveMaybe(value as any, model)
}

export default defineComponent({
  name: "fd-search",
  inheritAttrs: false,
  setup(_, { slots: setupSlots, expose }) {
    const slots = useSlots()
    const { crud, mitt } = useCore()

    const formRef = ref<FormRef<FormRecord>>()
    const loading = ref(false)
    const collapsed = ref(false)
    const viewportWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1920)

    const options = reactive<InternalOptions>({
      form: { model: {}, items: [], grid: { cols: 3, colGap: 12, rowGap: 12, collapsed: false, collapsedRows: 2 }, form: { labelWidth: "auto" } },
      action: { items: clone(defaultActions), grid: { cols: 2, colGap: 12, rowGap: 12 } },
    })

    const formModel = computed<FormRecord>(() => formRef.value?.model ?? (options.form.model as FormRecord) ?? {})
    const resolvedActions = computed(() => (options.action.items.length ? options.action.items : defaultActions))

    const actionGridProps = computed(() => {
      const grid = options.action.grid ?? {}
      const colGap = Math.max(0, resolveResponsiveValue(grid.colGap ?? defaultActionGap, viewportWidth.value, defaultActionGap))
      const rowGap = Math.max(0, resolveResponsiveValue(grid.rowGap ?? defaultActionGap, viewportWidth.value, defaultActionGap))
      const cols = Math.max(1, resolveResponsiveValue(grid.cols ?? 24, viewportWidth.value, 24))
      const collapsedState = grid.collapsed ?? false
      const collapsedRows = Math.max(1, grid.collapsedRows ?? 1)
      return {
        cols,
        colGap,
        rowGap,
        collapsed: collapsedState,
        collapsedRows,
      }
    })

    const collapseLabel = computed(() => (collapsed.value ? crud.dict?.label?.expand ?? "展开" : crud.dict?.label?.collapse ?? "折叠"))

    const formSlots = computed(() => {
      const vSlots: Record<string, any> = {}
      Object.keys(setupSlots).forEach((name) => {
        vSlots[name] = (scope?: Record<string, any>) => setupSlots[name]?.(scope ?? {})
      })
      return vSlots
    })

    const resolveActionCol = (action: SearchAction) => {
      const merged = action.col ?? {}
      return {
        span: resolveResponsiveValue(merged.span ?? 1, viewportWidth.value, 1),
        offset: resolveResponsiveValue(merged.offset ?? 0, viewportWidth.value, 0),
      }
    }

    const getActionItemProps = (action: SearchAction) => {
      const col = resolveActionCol(action)
      return {
        span: col.span,
        offset: col.offset,
      }
    }

    const getActionSlot = (action: SearchAction) => resolveMaybe(action.slot, formModel.value) ?? resolveComponent(action, "slot", formModel.value)
    const getComponentIs = (action: SearchAction) => resolveComponent(action, "is", formModel.value)
    const getComponentProps = (action: SearchAction) => resolveComponent(action, "props", formModel.value) ?? {}
    const getComponentEvents = (action: SearchAction) => resolveComponent(action, "on", formModel.value) ?? {}
    const getComponentStyle = (action: SearchAction) => resolveComponent(action, "style", formModel.value)
    const getComponentSlots = (action: SearchAction) => resolveComponent(action, "slots", formModel.value) ?? {}

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

    const use = (useOptions: SearchOptions = {}) => {
      if (!useOptions) return

      const { action, onSearch, onReset, ...formOptions } = useOptions

      if (action && Object.prototype.hasOwnProperty.call(action, "items")) {
        options.action.items.splice(0, options.action.items.length, ...(action.items ?? []))
      }

      if (action?.grid) {
        options.action.grid = options.action.grid ? merge({}, options.action.grid, action.grid) : clone(action.grid)
      }

      options.onSearch = onSearch
      options.onReset = onReset

      const formConfig = formOptions as FormUseOptions
      if (Object.keys(formConfig).length) {
        merge(options.form, formConfig)
      }

      collapsed.value = Boolean(options.form?.grid?.collapsed)

      formRef.value?.use(clone(options.form))
    }

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

    const searchHandler = (params?: any) => {
      search(params ?? {})
    }

    const resetHandler = (params?: any) => {
      reset(params ?? {})
    }

    const getModelHandler = (callback?: any) => {
      if (isFunction(callback)) {
        callback(formModel.value)
      }
    }

    const registerEvents = () => {
      mitt.on("search.search", searchHandler)
      mitt.on("search.reset", resetHandler)
      mitt.on("search.get.model", getModelHandler)
    }

    const unregisterEvents = () => {
      mitt.off("search.search", searchHandler)
      mitt.off("search.reset", resetHandler)
      mitt.off("search.get.model", getModelHandler)
    }

    const handleResize = () => {
      if (typeof window === "undefined") return
      viewportWidth.value = window.innerWidth
    }

    watch(
      () => formModel.value,
      (model) => {
        mitt.emit("search.model", model)
      },
      { deep: true },
    )

    onMounted(() => {
      registerEvents()
      if (typeof window !== "undefined") {
        window.addEventListener("resize", handleResize)
      }
    })

    onBeforeUnmount(() => {
      unregisterEvents()
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize)
      }
    })

    expose({
      get model() {
        return formModel.value
      },
      form: formRef,
      use,
      search,
      reset,
      collapse,
    })

    const renderActionSlots = (action: SearchAction) => {
      const slotName = getActionSlot(action)
      if (slotName && slots[slotName]) {
        return slots[slotName]?.({ model: formModel.value, action })
      }
      return null
    }

    const renderCustomSlots = (action: SearchAction) => {
      const componentSlots = getComponentSlots(action)
      const entries = Object.entries(componentSlots)
      if (!entries.length) return undefined
      const slotRender: Record<string, () => VNodeChild> = {}
      entries.forEach(([name, value]) => {
        slotRender[name] = () => {
          if (typeof value === "function") {
            return (value as () => any)()
          }
          const Dynamic = resolveDynamicComponent(value as string | Component)
          return h(Dynamic as Component)
        }
      })
      return slotRender
    }

    const renderComponent = (action: SearchAction) => {
      const componentIs = getComponentIs(action)
      if (!componentIs) return null
      const Dynamic = resolveDynamicComponent(componentIs as string | Component)
      const componentProps = getComponentProps(action)
      const componentEvents = transformEvents(getComponentEvents(action))
      const componentSlots = renderCustomSlots(action)
      return h(
        Dynamic as Component,
        {
          style: getComponentStyle(action),
          ...componentProps,
          ...componentEvents,
        },
        componentSlots,
      )
    }

    const renderAction = (action: SearchAction, actionIndex: number) => {
      const actionSlot = renderActionSlots(action)
      return (
        <FdGridItem key={actionIndex} class="fd-search__action-item" {...getActionItemProps(action)}>
          {action.type === "search" && (
            <ElButton type="primary" disabled={loading.value} onClick={() => search()}>
              <ElIcon class={["fd-search__icon", { "is-loading": loading.value }]}>
                {loading.value ? <IconLoading /> : <IconSearch />}
              </ElIcon>
              <span>{action.text || crud.dict?.label?.search || "搜索"}</span>
            </ElButton>
          )}

          {action.type === "reset" && (
            <ElButton onClick={() => reset()}>
              <ElIcon class="fd-search__icon">
                <IconRefresh />
              </ElIcon>
              <span>{action.text || crud.dict?.label?.reset || "重置"}</span>
            </ElButton>
          )}

          {action.type === "collapse" && (
            <ElButton onClick={() => collapse()}>
              <ElIcon class="fd-search__icon">
                {!collapsed.value ? <IconArrowUp /> : <IconArrowDown />}
              </ElIcon>
              <span>{collapseLabel.value}</span>
            </ElButton>
          )}

          {!action.type && actionSlot}

          {!action.type && !actionSlot && renderComponent(action)}
        </FdGridItem>
      )
    }

    return () => (
      <div class="fd-search">
        <FdForm ref={formRef} class="fd-search__form" v-slots={formSlots.value} />
        {resolvedActions.value.length > 0 && (
          <FdGrid class="fd-search__action" {...actionGridProps.value}>
            {resolvedActions.value.map((action, index) => renderAction(action, index))}
          </FdGrid>
        )}
      </div>
    )
  },
})
