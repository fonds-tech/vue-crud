import type { VNodeChild, Component as VueComponent } from "vue"
import type {
  FormRef,
  FormItem,
  FormModel,
  SearchRef,
  CrudParams,
  FormRecord,
  SearchAction,
  SearchMaybeFn,
  FormUseOptions,
  SearchUseOptions,
} from "../../types"
import Form from "../form"
import { merge, cloneDeep } from "lodash-es"

import { useCore, useConfig } from "../../hooks"
import { ElCol, ElRow, ElButton } from "element-plus"
import { ArrowUp, ArrowDown, RefreshRight, Search as SearchIcon } from "@element-plus/icons-vue"
import { h, ref, watch, computed, nextTick, reactive, onMounted, defineComponent, onBeforeUnmount } from "vue"

type MaybeFn<T> = SearchMaybeFn<T>
type QueryParams = Record<string, unknown>

interface SearchResolvedOptions {
  form: FormUseOptions<FormRecord>
  actions: SearchAction[]
  layout: {
    actions: {
      gutter: number
      justify: "start" | "center" | "end" | "space-between" | "space-around"
      align: "top" | "middle" | "bottom"
      span: number
    }
  }
  onSearch?: (model: FormModel, ctx: { next: (params?: Record<string, any>) => Promise<any> }) => void | Promise<void>
  onReset?: (model: FormModel, ctx: { next: (params?: Record<string, any>) => Promise<any> }) => void | Promise<void>
}

const defaultActionLayout: SearchResolvedOptions["layout"]["actions"] = {
  gutter: 16,
  span: 8,
  justify: "start",
  align: "top",
}

function createDefaultSearchOptions(): SearchResolvedOptions {
  return {
    form: {
      model: {},
      items: [],
    },
    layout: {
      actions: { ...defaultActionLayout },
    },
    actions: [{ type: "search" }, { type: "reset" }, { type: "collapse" }],
  }
}

function resolveValue<T>(value: MaybeFn<T> | undefined, model: FormModel): T | undefined {
  if (typeof value === "function") {
    return (value as (payload: FormModel) => T)(model)
  }
  return value
}

function sanitizeQuery(query: QueryParams): QueryParams {
  const res: QueryParams = {}
  const entries = Object.entries(query)
  entries.forEach(([key, value]) => {
    if (value === undefined || value === null)
      return
    if (typeof value === "string" && value.trim().length === 0)
      return
    if (Array.isArray(value) && value.length === 0)
      return
    res[key] = value
  })
  return res
}

const forwardedMethods = [
  "getField",
  "setField",
  "bindFields",
  "setData",
  "setItem",
  "setProps",
  "setStyle",
  "setOptions",
  "getOptions",
  "hideItem",
  "showItem",
  "validate",
  "validateField",
  "resetFields",
  "clearFields",
  "clearValidate",
  "scrollToField",
  "setRequired",
  "submit",
  "next",
  "prev",
  "setMode",
] as const

type ForwardedMethodKey = (typeof forwardedMethods)[number]
type MethodProxy = {
  [K in ForwardedMethodKey]: (...args: Parameters<FormRef<FormRecord>[K]>) => ReturnType<FormRef<FormRecord>[K]>
}

export default defineComponent({
  name: "fd-search",
  emits: ["search", "reset"],
  setup(_, { slots, expose, emit }) {
    const formRef = ref<FormRef>()
    const loading = ref(false)
    const collapsed = ref(false)
    const initialModel = ref<QueryParams>({})
    const state = reactive<SearchResolvedOptions>(createDefaultSearchOptions())
    const lastResolved = ref<SearchResolvedOptions>(createDefaultSearchOptions())
    const { crud, mitt } = useCore()
    const { dict, style } = useConfig()

    const formModel = computed<FormModel>(() => formRef.value?.model ?? {})
    const actionList = computed(() => state.actions ?? [])

    function assignOptions(resolved: SearchResolvedOptions) {
      state.actions = resolved.actions
      state.layout = resolved.layout
      state.onSearch = resolved.onSearch
      state.onReset = resolved.onReset
      state.form = resolved.form
      collapsed.value = Boolean(resolved.form?.layout?.grid?.collapsed)
      initialModel.value = cloneDeep(resolved.form?.model ?? {}) as QueryParams
    }

    function applyFormOptions(resolved: SearchResolvedOptions) {
      void nextTick(() => {
        formRef.value?.use(resolved.form)
      })
    }

    function useSearch(useOptions: SearchUseOptions<FormModel> = {}) {
      const resolved = merge({}, lastResolved.value, useOptions) as SearchResolvedOptions
      resolved.form = merge({}, lastResolved.value.form ?? {}, useOptions.form ?? {}) as FormUseOptions<FormRecord>
      resolved.layout = {
        actions: {
          ...defaultActionLayout,
          ...(lastResolved.value.layout?.actions ?? {}),
          ...(useOptions.layout?.actions ?? {}),
        },
      }
      lastResolved.value = resolved
      assignOptions(resolved)
      applyFormOptions(resolved)
    }

    function syncCrudParams(payload: QueryParams) {
      const params = crud.getParams()
      Object.keys(params).forEach((key) => {
        if (!(key in payload) && key !== "page" && key !== "size") {
          delete params[key]
        }
      })
      Object.assign(params, payload as CrudParams)
    }

    async function runRefresh(params: QueryParams): Promise<unknown> {
      loading.value = true
      try {
        const replaced = crud.paramsReplace(params as CrudParams)
        syncCrudParams(replaced)
        return (await crud.refresh(replaced)) as unknown
      }
      finally {
        loading.value = false
      }
    }

    function collapse(flag?: boolean) {
      if (typeof flag === "boolean") {
        collapsed.value = flag
      }
      else {
        collapsed.value = !collapsed.value
      }
      formRef.value?.collapse(collapsed.value)
    }

    async function reset(payload: Record<string, any> = {}) {
      emit("reset")
      const model = sanitizeQuery({ ...initialModel.value, ...payload } as QueryParams) as FormModel
      formRef.value?.resetFields()
      formRef.value?.clearValidate()
      formRef.value?.bindFields(model as Record<string, any>)
      const next = async (params: Record<string, any> = model) => {
        return runRefresh(sanitizeQuery(params as QueryParams))
      }
      if (state.onReset) {
        await state.onReset(formModel.value, { next })
        return
      }
      await next(model)
    }

    async function search(payload: Record<string, any> = {}) {
      emit("search")
      if (!formRef.value) {
        return
      }
      const { model, errors } = await formRef.value.submit()
      if (errors && Object.keys(errors).length > 0) {
        throw errors
      }
      const query = sanitizeQuery({ ...model, ...payload } as QueryParams) as FormModel
      const next = async (params: Record<string, any> = query) => {
        return runRefresh(sanitizeQuery(params as QueryParams))
      }
      if (state.onSearch) {
        await state.onSearch(query, { next })
        return
      }
      await next(query)
    }

    function renderSlotAction(action: SearchAction) {
      const name = resolveValue(action.slot, formModel.value)
      if (typeof name !== "string" || name.length === 0) {
        return null
      }
      const slotRender = slots[name]
      if (typeof slotRender === "function") {
        return slotRender({ model: formModel.value })
      }
      return null
    }

    function renderComponentAction(action: SearchAction) {
      if (!action.component) {
        return null
      }
      const component = resolveValue(action.component.is, formModel.value)
      if (component === undefined || component === null) {
        return null
      }
      const props = resolveValue(action.component.props, formModel.value) ?? {}
      const events = resolveValue(action.component.on, formModel.value) ?? {}
      const styleValue = resolveValue(action.component.style, formModel.value)
      const slotMap = resolveValue(action.component.slots, formModel.value)
      const children = slotMap
        ? Object.fromEntries(Object.entries(slotMap).map(([name, content]) => [name, () => (typeof content === "function" ? (content as (model: FormModel) => VNodeChild)(formModel.value) : content)]))
        : undefined
      return h(component as VueComponent, { ...props, ...events, style: styleValue }, children)
    }

    function renderBuiltinAction(action: SearchAction) {
      const commonProps = {
        size: style.size,
        ...action.props,
      }
      if (action.type === "search") {
        return (
          <ElButton
            {...commonProps}
            type="primary"
            loading={loading.value}
            icon={SearchIcon}
            onClick={() => {
              void search()
            }}
          >
            {action.text ?? dict.label.search}
          </ElButton>
        )
      }
      if (action.type === "reset") {
        return (
          <ElButton
            {...commonProps}
            icon={RefreshRight}
            onClick={() => {
              void reset()
            }}
          >
            {action.text ?? dict.label.reset}
          </ElButton>
        )
      }
      if (action.type === "collapse") {
        return (
          <ElButton
            {...commonProps}
            icon={collapsed.value ? ArrowDown : ArrowUp}
            onClick={() => {
              void collapse()
            }}
          >
            {action.text ?? (collapsed.value ? dict.label.expand : dict.label.collapse)}
          </ElButton>
        )
      }
      return null
    }

    function renderActionContent(action: SearchAction) {
      const visible = resolveValue(action.visible, formModel.value)
      if (visible === false) {
        return null
      }
      return renderSlotAction(action) ?? renderComponentAction(action) ?? renderBuiltinAction(action)
    }

    function renderActions() {
      const row = state.layout.actions
      return (
        <ElRow gutter={row.gutter} justify={row.justify} align={row.align}>
          {actionList.value.map((action, index) => {
            const content = renderActionContent(action)
            if (!content) {
              return null
            }
            const span = action.span ?? row.span
            return (
              <ElCol span={span} offset={action.offset} key={index}>
                {content}
              </ElCol>
            )
          })}
        </ElRow>
      )
    }

    watch(
      formModel,
      (model) => {
        mitt.emit("search.model", cloneDeep(model))
      },
      { deep: true, immediate: true },
    )

    onMounted(() => {
      assignOptions(lastResolved.value)
      applyFormOptions(lastResolved.value)
    })

    function normalizeParams(input: unknown): Record<string, any> {
      if (typeof input === "object" && input !== null) {
        return input as Record<string, any>
      }
      return {}
    }

    const searchHandler = (params?: unknown) => {
      void search(normalizeParams(params))
    }
    const resetHandler = (params?: unknown) => {
      void reset(normalizeParams(params))
    }
    const getterHandler = (callback?: unknown) => {
      if (typeof callback === "function") {
        (callback as (model: FormModel) => void)(cloneDeep(formModel.value))
      }
    }
    mitt.on("search.search", searchHandler)
    mitt.on("search.reset", resetHandler)
    mitt.on("search.get.model", getterHandler)
    onBeforeUnmount(() => {
      mitt.off("search.search", searchHandler)
      mitt.off("search.reset", resetHandler)
      mitt.off("search.get.model", getterHandler)
    })

    const methodProxy = forwardedMethods.reduce<MethodProxy>((acc, key) => {
      acc[key] = (...args: Parameters<FormRef<FormRecord>[typeof key]>) => {
        const target = formRef.value
        const method = target?.[key] as
          | ((...innerArgs: Parameters<FormRef<FormRecord>[typeof key]>) => ReturnType<FormRef<FormRecord>[typeof key]>)
          | undefined
        if (method) {
          return method(...args)
        }
        return undefined as ReturnType<FormRef<FormRecord>[typeof key]>
      }
      return acc
    }, {} as MethodProxy)

    const baseExpose: Partial<SearchRef<FormModel>> = {
      get id() {
        return formRef.value?.id
      },
      get form() {
        return formRef.value?.form
      },
      get model() {
        return formModel.value
      },
      get items(): FormItem[] {
        const current = formRef.value
        if (current && Array.isArray(current.items)) {
          return current.items
        }
        const items = state.form.items
        return (Array.isArray(items) ? items : []) as FormItem[]
      },
      get mode() {
        return formRef.value?.mode ?? (state.form.mode ?? "add")
      },
      use: useSearch,
      search,
      reset,
      collapse,
    }

    const searchExpose = Object.assign(baseExpose, methodProxy) as SearchRef<FormModel>

    expose(searchExpose)

    return () => (
      <div class="fd-search">
        <div class="fd-search__form">
          <Form ref={formRef} v-slots={slots} />
        </div>
        <div class="fd-search__actions">{renderActions()}</div>
      </div>
    )
  },
})
