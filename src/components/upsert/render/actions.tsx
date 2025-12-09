import type { Ref, Slots, ComputedRef } from "vue"
import type { FormRecord, FormComponentSlot } from "../../form/types"
import type { UpsertMode, UpsertAction, UpsertCloseAction } from "../interface"
import { h } from "vue"
import { ElButton } from "element-plus"

/**
 * 动作渲染上下文
 */
interface RenderActionsContext<T extends FormRecord = FormRecord> {
  options: { actions: UpsertAction<T>[] }
  state: {
    mode: Ref<UpsertMode>
    loading: Ref<boolean>
    formModel: ComputedRef<T>
  }
  service: {
    close: (action?: UpsertCloseAction) => void
    submit: () => Promise<unknown>
    handleNext: () => void
    handlePrev: () => void
  }
  actionHelpers: {
    resolveActionText: (action: UpsertAction<T>) => string
    isActionVisible: (action: UpsertAction<T>) => boolean
  }
  componentHelper: {
    slotNameOf: (component?: FormComponentSlot) => string | undefined
    componentOf: (component?: FormComponentSlot) => unknown
    componentProps: (component?: FormComponentSlot) => Record<string, unknown>
    componentStyle: (component?: FormComponentSlot) => unknown
    componentEvents: (component?: FormComponentSlot) => Record<string, unknown>
    componentSlots: (component?: FormComponentSlot) => Record<string, unknown>
  }
  exposeSlots: Slots
}

/**
 * 渲染底部操作按钮
 */
export function renderActions<T extends FormRecord = FormRecord>(
  context: RenderActionsContext<T>,
) {
  const { options, state, service, actionHelpers, componentHelper, exposeSlots } = context
  const { resolveActionText, isActionVisible } = actionHelpers

  return options.actions.map((action, index) => {
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

    // 自定义组件/插槽
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
            h(value as any, {
              mode: state.mode.value,
              model: state.formModel.value,
              loading: state.loading.value,
              index,
            })
        }
      })
      return h(
        component as any,
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

/**
 * 渲染底部区域
 */
export function renderFooter<T extends FormRecord = FormRecord>(
  context: RenderActionsContext<T>,
) {
  return <div class="fd-upsert__footer">{renderActions(context)}</div>
}
