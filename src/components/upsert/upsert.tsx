import type { FormItemProp } from "element-plus"
import type { UpsertUseOptions } from "./interface"
import type { FormRef, FormRecord } from "../form/types"
import FdDialog from "../dialog"
import { clone } from "@fonds/utils"
import { useCore, useConfig } from "@/hooks"
import { renderForm, renderFooter } from "./render"
import {
  useUpsertActions,
  createFormBuilder,
  createUpsertState,
  useComponentHelper,
  createUpsertService,
} from "./core"
import {
  h,
  watch,
  computed,
  useAttrs,
  useSlots,
  defineComponent,
  onBeforeUnmount,
  resolveDirective,
} from "vue"
import "./style.scss"

export default defineComponent({
  name: "fd-upsert",
  inheritAttrs: false,
  emits: ["open", "close", "beforeOpen", "beforeClose"],
  setup(_, { emit, slots: exposeSlots, expose }) {
    const attrs = useAttrs()
    const userSlots = useSlots()
    const loadingDirective = resolveDirective("loading")

    const { crud, mitt } = useCore()
    const { style } = useConfig()

    // Engine 层：状态、服务、表单构建
    const state = createUpsertState({ style })
    const builder = createFormBuilder({
      options: state.options,
      mode: state.mode,
      formRef: state.formRef,
    })

    const { ensureActions, resolveActionText, isActionVisible } = useUpsertActions({
      options: state.options,
      crud,
      formModel: state.formModel,
      mode: state.mode,
    })
    ensureActions()

    /**
     * 应用配置选项
     *
     * 合并 props 和 use 方法传入的配置，并触发动作初始化
     */
    function useOptions(options?: UpsertUseOptions<FormRecord>) {
      state.useUpsert(options)
      ensureActions()
    }

    const componentHelper = useComponentHelper({
      mode: state.mode,
      formModel: state.formModel,
      loading: state.loading,
    })

    const service = createUpsertService({ crud, state, builder })

    // Dialog 相关计算属性
    const dialogNativeAttrs = computed(() => {
      const result: Record<string, unknown> = {}
      Object.keys(attrs).forEach((key) => {
        if (key === "class")
          return
        result[key] = attrs[key]
      })
      return result
    })

    const defaultTitle = computed(() =>
      state.mode.value === "add" ? crud.dict?.label?.add ?? "新增" : crud.dict?.label?.update ?? "编辑",
    )

    const dialogClass = computed(() => {
      const extra = attrs.class
      return extra ? ["fd-upsert", extra] : ["fd-upsert"]
    })

    const dialogBindings = computed(() => {
      const { loadingText, ...rest } = state.options.dialog
      return {
        ...rest,
        title: rest.title ?? defaultTitle.value,
        ...dialogNativeAttrs.value,
      }
    })

    // 生命周期事件
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
      const snapshot = clone(state.formModel.value)
      emit("beforeOpen", { mode: state.mode.value, model: snapshot })
      state.options.onBeforeOpen?.(snapshot, { mode: state.mode.value, close: service.close, form: state.formRef.value })
    }

    function handleBeforeClose() {
      const snapshot = clone(state.formModel.value)
      emit("beforeClose", { action: state.closeAction.value, mode: state.mode.value, model: snapshot })
      state.options.onBeforeClose?.(state.closeAction.value, snapshot, { mode: state.mode.value, close: service.close, form: state.formRef.value })
    }

    function handleOpen() {
      const snapshot = clone(state.formModel.value)
      emit("open", { mode: state.mode.value, model: snapshot })
      state.options.onOpen?.(snapshot, { mode: state.mode.value, close: service.close, form: state.formRef.value })
    }

    function handleClose() {
      const snapshot = clone(state.formModel.value)
      emit("close", { action: state.closeAction.value, mode: state.mode.value, model: snapshot })
      state.options.onClose?.(state.closeAction.value, snapshot, { mode: state.mode.value, close: service.close, form: state.formRef.value })
      if (state.closeAction.value === "cancel") {
        state.loading.value = false
      }
    }

    // 插槽处理
    /**
     * 处理插槽
     *
     * 将用户插槽转换为带上下文的插槽函数
     */
    function handleFormSlots() {
      const namedSlots: Record<string, (slotScope: Record<string, unknown>) => unknown> = {}
      Object.keys(userSlots).forEach((name) => {
        const slot = userSlots[name]
        if (slot) {
          namedSlots[name] = (slotScope: Record<string, unknown>) => slot(componentHelper.createSlotProps(slotScope))
        }
      })
      return namedSlots
    }

    // Proxy 事件处理
    function handleProxyEvent(payload: unknown) {
      service.handleProxyEvent(payload)
    }

    mitt?.on?.("crud.proxy", handleProxyEvent)

    onBeforeUnmount(() => {
      mitt?.off?.("crud.proxy", handleProxyEvent)
    })

    // Expose API
    // 暴露给模板引用或父组件的方法和属性
    expose({
      get form() {
        return state.formRef.value
      },
      get model() {
        return state.formModel.value
      },
      mode: state.mode,
      visible: state.visible,
      loading: state.loading,
      use: useOptions,
      add: service.add,
      append: service.append,
      update: service.update,
      close: service.close,
      submit: service.submit,
      next: service.handleNext,
      prev: service.handlePrev,
      bindFields: (data?: Record<string, unknown>) => state.formRef.value?.bindFields(data ?? {}),
      setField: (prop: FormItemProp, value: unknown) => state.formRef.value?.setField(prop, value),
      getField: (prop?: FormItemProp) => state.formRef.value?.getField(prop),
      setItem: (prop: FormItemProp, data: Record<string, unknown>) => state.formRef.value?.setItem(prop, data),
      setOptions: (prop: FormItemProp, value: unknown[]) => state.formRef.value?.setOptions(prop, value),
      getOptions: (prop: FormItemProp) => state.formRef.value?.getOptions(prop),
      setProps: (prop: FormItemProp, value: Record<string, unknown>) => state.formRef.value?.setProps(prop, value),
      setStyle: (prop: FormItemProp, value: Record<string, unknown>) => state.formRef.value?.setStyle(prop, value),
      hideItem: (prop: FormItemProp | FormItemProp[]) => state.formRef.value?.hideItem(prop),
      showItem: (prop: FormItemProp | FormItemProp[]) => state.formRef.value?.showItem(prop),
      collapse: () => state.formRef.value?.collapse(),
      validate: (callback?: Parameters<FormRef<FormRecord>["validate"]>[0]) => state.formRef.value?.validate(callback),
      validateField: (prop?: FormItemProp | FormItemProp[], callback?: Parameters<FormRef<FormRecord>["validateField"]>[1]) => state.formRef.value?.validateField(prop, callback),
      resetFields: (prop?: FormItemProp | FormItemProp[]) => state.formRef.value?.resetFields(prop),
      clearFields: (prop?: FormItemProp | FormItemProp[]) => state.formRef.value?.clearFields(prop),
      clearValidate: (prop?: FormItemProp | FormItemProp[]) => state.formRef.value?.clearValidate(prop),
      setFields: (data: Record<string, unknown>) => state.formRef.value?.setFields(data),
      scrollToField: (prop: FormItemProp) => state.formRef.value?.scrollToField(prop),
    })

    // 渲染上下文
    // 传递给纯函数渲染组件的数据包
    const renderContext = {
      options: state.options,
      state: {
        mode: state.mode,
        loading: state.loading,
        formModel: state.formModel,
        formRef: state.formRef,
      },
      service,
      actionHelpers: { resolveActionText, isActionVisible },
      componentHelper,
      exposeSlots,
      loadingDirective,
      handleFormSlots,
      setFormRef: (ref: unknown) => {
        state.formRef.value = ref as FormRef<FormRecord>
      },
    }

    return () =>
      h(
        FdDialog,
        {
          ...dialogBindings.value,
          "class": dialogClass.value,
          "modelValue": state.visible.value,
          "onUpdate:modelValue": (value: boolean) => {
            state.visible.value = value
          },
          "onOpen": handleOpen,
          "onClose": handleClose,
        },
        {
          default: () => renderForm(renderContext),
          footer: () => renderFooter(renderContext),
        },
      )
  },
})
