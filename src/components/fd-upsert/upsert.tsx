import type { FormItemProp } from "element-plus"
import type { UpsertUseOptions } from "./type"
import type { FormRef, FormRecord } from "../fd-form/types"
import FdForm from "../fd-form/form"
import FdDialog from "../fd-dialog"
import { clone } from "@fonds/utils"
import { ElButton } from "element-plus"
import { useUpsertActions } from "./actions"
import { createFormBuilder } from "./form"
import { createUpsertState } from "./state"
import { useComponentHelper } from "./component"
import { useCore, useConfig } from "@/hooks"
import { createUpsertService } from "./service"
import {
  h,
  watch,
  computed,
  useAttrs,
  useSlots,
  withDirectives,
  defineComponent,
  onBeforeUnmount,
  resolveDirective,
} from "vue"
import "./style.scss"

/**
 * FormRef 类型守卫，避免使用断言设置 ref。
 */
function isFormRef(value: unknown): value is FormRef<FormRecord> {
  if (!value || typeof value !== "object")
    return false
  return "submit" in value && "use" in value
}

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
    function useOptions(options?: UpsertUseOptions<FormRecord>) {
      state.useUpsert(options)
      ensureActions()
    }

    const componentHelper = useComponentHelper({
      mode: state.mode,
      formModel: state.formModel,
      loading: state.loading,
    })

    const service = createUpsertService({
      crud,
      state,
      builder,
    })

    const dialogNativeAttrs = computed(() => {
      const result: Record<string, unknown> = {}
      Object.keys(attrs).forEach((key) => {
        if (key === "class")
          return
        result[key] = attrs[key]
      })
      return result
    })

    const defaultTitle = computed(() => (state.mode.value === "add" ? crud.dict?.label?.add ?? "新增" : crud.dict?.label?.update ?? "编辑"))

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

    function renderActions() {
      return state.options.actions.map((action, index) => {
        if (!isActionVisible(action))
          return null
        if (action.type === "cancel") {
          return (
            <ElButton key={index} onClick={() => service.close("cancel")}>
              {resolveActionText(action)}
            </ElButton>
          )
        }
        if (action.type === "next") {
          return (
            <ElButton key={index} type="primary" onClick={service.handleNext}>
              {resolveActionText(action)}
            </ElButton>
          )
        }
        if (action.type === "prev") {
          return (
            <ElButton key={index} type="primary" onClick={service.handlePrev}>
              {resolveActionText(action)}
            </ElButton>
          )
        }
        if (action.type === "ok") {
          return (
            <ElButton key={index} type="primary" loading={state.loading.value} onClick={() => service.submit()}>
              {resolveActionText(action)}
            </ElButton>
          )
        }
        const slotName = componentHelper.slotNameOf(action.component)
        if (slotName) {
          return exposeSlots[slotName]?.({
            index,
            mode: state.mode.value,
            model: state.formModel.value,
          })
        }
        const component = componentHelper.componentOf(action.component)
        if (component) {
          const childSlots = componentHelper.componentSlots(action.component)
          const renderedSlots: Record<string, () => unknown> = {}
          Object.keys(childSlots).forEach((childSlot) => {
            const value = childSlots[childSlot]
            if (value) {
              renderedSlots[childSlot] = () =>
                h(value, {
                  mode: state.mode.value,
                  model: state.formModel.value,
                  loading: state.loading.value,
                  index,
                })
            }
          })
          return h(
            component,
            {
              key: index,
              style: componentHelper.componentStyle(action.component),
              ...componentHelper.componentProps(action.component),
              ...componentHelper.componentEvents(action.component),
            },
            renderedSlots,
          )
        }
        return null
      })
    }

    function renderFooter() {
      return <div class="fd-upsert__footer">{renderActions()}</div>
    }

    function renderForm() {
      const formVNode = h(
        FdForm,
        {
          "ref": (instanceRef: unknown) => {
            if (isFormRef(instanceRef)) {
              state.formRef.value = instanceRef
            }
          },
          "element-loading-text": state.options.dialog.loadingText,
        },
        handleFormSlots(),
      )
      if (!loadingDirective)
        return formVNode
      return withDirectives(formVNode, [[loadingDirective, state.loading.value]])
    }

    function handleProxyEvent(payload: unknown) {
      service.handleProxyEvent(payload)
    }

    mitt?.on?.("crud.proxy", handleProxyEvent)

    onBeforeUnmount(() => {
      mitt?.off?.("crud.proxy", handleProxyEvent)
    })

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
          default: () => renderForm(),
          footer: () => renderFooter(),
        },
      )
  },
})
