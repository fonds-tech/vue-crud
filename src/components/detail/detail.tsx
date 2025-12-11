import Dialog from "../dialog"
import { useCore } from "@/hooks"
import { renderActions, renderDetailContent } from "./render"
import { buildGroups, createDetailState, createDetailService } from "./core"
import { watch, computed, useAttrs, useSlots, defineComponent, onBeforeUnmount, getCurrentInstance } from "vue"
import "./style.scss"

export default defineComponent({
  name: "fd-detail",
  inheritAttrs: false,
  emits: ["open", "close", "closed", "beforeOpen", "beforeClose"],
  setup(_, { emit, expose }) {
    const attrs = useAttrs() as Record<string, unknown> & { class?: unknown }
    const userSlots = useSlots()
    const instance = getCurrentInstance()
    const { crud, mitt } = useCore()

    const state = createDetailState(crud)

    const dialogNativeAttrs = computed(() => {
      const result: Record<string, unknown> = {}
      Object.keys(attrs).forEach((key) => {
        if (key === "class") return
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
        if (current && !previous) handleBeforeOpen()
        if (!current && previous) handleBeforeClose()
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
      if (!row) return
      service.detail(row)
    }

    function detailHandler(row: unknown) {
      if (row && typeof row === "object") handleDetailEvent(row as Record<string, any>)
    }

    function proxyHandler(payload: unknown) {
      if (!payload || typeof payload !== "object") return
      const proxyPayload = payload as { name?: string, data?: Record<string, any>[] }
      if (proxyPayload.name !== "detail") return
      const row = proxyPayload.data?.[0]
      if (row) handleDetailEvent(row)
    }

    mitt?.on?.("detail", detailHandler)
    mitt?.on?.("crud.proxy", proxyHandler)

    onBeforeUnmount(() => {
      mitt?.off?.("detail", detailHandler)
      mitt?.off?.("crud.proxy", proxyHandler)
    })

    function renderContent() {
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
    }

    function renderFooter() {
      return renderActions({
        options: state.options,
        groups: [],
        data: state.data,
        loading: state.loading,
        cache: state.cache,
        userSlots,
        onClose: service.close,
      })
    }

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
      __test__handleDetailEvent: handleDetailEvent,
    })

    return () => (
      <Dialog
        {...dialogBindings.value}
        class={dialogClass.value}
        modelValue={state.visible.value}
        onUpdate:modelValue={(value: boolean) => {
          state.visible.value = value
          if (!value) handleClose()
        }}
        onOpen={handleOpen}
        onClose={handleClose}
        onClosed={handleClosed}
      >
        {{
          default: renderContent,
          footer: renderFooter,
        }}
      </Dialog>
    )
  },
})
