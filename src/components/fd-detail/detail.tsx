import type { DetailData, DetailItem, DetailGroup, DetailOptions, DetailDescriptions } from "./types"
import FdDialog from "../fd-dialog/index.vue"
import { merge } from "lodash-es"
import { useCore } from "@/hooks"
import { resolveMaybe } from "./slots"
import { createDetailState } from "./state"
import { createDetailService } from "./service"
import { renderActions, renderDetailContent } from "./render"
import {
  h,
  watch,
  computed,
  useAttrs,
  useSlots,
  defineComponent,
  onBeforeUnmount,
  getCurrentInstance,
} from "vue"
import "./style.scss"

export default defineComponent({
  name: "fd-detail",
  inheritAttrs: false,
  emits: ["open", "close", "beforeOpen", "beforeClose"],
  setup(_, { emit, expose }) {
    const attrs = useAttrs() as Record<string, unknown> & { class?: unknown }
    const userSlots = useSlots()
    const instance = getCurrentInstance()
    const { crud, mitt } = useCore()

    const state = createDetailState(crud)

    const dialogNativeAttrs = computed(() => {
      const result: Record<string, unknown> = {}
      Object.keys(attrs).forEach((key) => {
        if (key === "class")
          return
        result[key] = attrs[key]
      })
      return result
    })

    const dialogClass = computed(() => {
      const extra = attrs.class
      return extra ? ["fd-detail", extra] : ["fd-detail"]
    })

    const dialogBindings = computed(() => {
      const { loadingText, ...rest } = state.options.dialog
      return {
        ...rest,
        ...dialogNativeAttrs.value,
      }
    })

    const groups = computed(() => buildGroups(state.options, instance?.uid, state.data.value))

    const service = createDetailService({
      crud,
      options: state.options,
      data: state.data,
      paramsCache: state.paramsCache,
      loading: state.loading,
      visible: state.visible,
      setData: state.setData,
    })

    watch(
      () => state.visible.value,
      (current, previous) => {
        if (current && !previous) {
          handleBeforeOpen()
        }
        else if (!current && previous) {
          handleBeforeClose()
        }
      },
    )

    function handleBeforeOpen() {
      state.cache.value += 1
      emit("beforeOpen")
      state.options.onBeforeOpen?.()
    }

    function handleBeforeClose() {
      const snapshot = state.getData()
      emit("beforeClose", snapshot)
      state.options.onBeforeClose?.(snapshot)
    }

    function handleOpen() {
      emit("open")
      state.options.onOpen?.()
    }

    function handleClose() {
      const snapshot = state.getData()
      emit("close", snapshot)
      state.options.onClose?.(snapshot)
    }

    function handleClosed() {
      state.clearData()
    }

    function handleDetailEvent(row: any) {
      if (!row)
        return
      service.detail(row)
    }

    function detailHandler(row: unknown) {
      if (row && typeof row === "object")
        handleDetailEvent(row as Record<string, any>)
    }

    function proxyHandler(payload: unknown) {
      if (!payload || typeof payload !== "object")
        return
      const proxyPayload = payload as { name?: string, data?: Record<string, any>[] }
      if (proxyPayload.name !== "detail")
        return
      const row = proxyPayload.data?.[0]
      if (row)
        handleDetailEvent(row)
    }

    mitt?.on?.("detail", detailHandler)
    mitt?.on?.("crud.proxy", proxyHandler)

    onBeforeUnmount(() => {
      mitt?.off?.("detail", detailHandler)
      mitt?.off?.("crud.proxy", proxyHandler)
    })

    expose({
      get data() {
        return state.data.value
      },
      use: state.use,
      close: service.close,
      detail: service.detail,
      refresh: service.refresh,
      setData: state.setData,
      getData: state.getData,
      clearData: state.clearData,
    })

    return () =>
      h(
        FdDialog,
        {
          ...dialogBindings.value,
          "class": dialogClass.value,
          "modelValue": state.visible.value,
          "onUpdate:modelValue": (value: boolean) => {
            state.visible.value = value
            if (!value)
              handleClose()
          },
          "onOpen": handleOpen,
          "onClose": handleClose,
          "onClosed": handleClosed,
        },
        {
          default: () => {
            const fallback = renderDetailContent({
              options: state.options,
              groups: groups.value,
              data: state.data,
              loading: state.loading,
              cache: state.cache,
              userSlots,
              onClose: service.close,
            })
            const slotRendered = userSlots.default?.({
              data: state.data.value,
              loading: state.loading.value,
              visible: state.visible.value,
              refresh: service.refresh,
              setData: state.setData,
            })
            return slotRendered ?? fallback
          },
          footer: () =>
            renderActions({
              options: state.options,
              groups: [],
              data: state.data,
              loading: state.loading,
              cache: state.cache,
              userSlots,
              onClose: service.close,
            }),
        },
      )
  },
})

function buildGroups<D extends DetailData = DetailData>(options: DetailOptions<D>, uid?: number, data: D = {} as D) {
  if (!options.items.length)
    return []
  const fallbackName = uid ?? "fd-detail"
  const map = new Map<string | number, DetailItem<D>[]>()
  map.set(fallbackName, [])
  options.groups.forEach((group) => {
    if (group.name !== undefined) {
      map.set(group.name, [])
    }
  })
  options.items.forEach((item) => {
    const groupName = resolveMaybe(item.group, data)
    if (groupName !== undefined && map.has(groupName)) {
      map.get(groupName)!.push(item)
    }
    else {
      map.get(fallbackName)!.push(item)
    }
  })
  return Array.from(map.entries())
    .map(([name, items]) => {
      const meta = options.groups.find(group => group.name === name)
      const descriptions = merge({}, options.descriptions, meta?.descriptions) as DetailDescriptions
      const normalizedDescriptions = {
        ...descriptions,
        column: descriptions.column ?? 2,
      }
      return {
        name,
        items,
        title: meta ? resolveMaybe(meta.title, data) : descriptions.title,
        descriptions: normalizedDescriptions,
      } as DetailGroup<D> & { items: DetailItem<D>[], descriptions: DetailDescriptions }
    })
    .filter(group => group.items.length > 0)
}
