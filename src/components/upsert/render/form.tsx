import type { UpsertOptions } from "../interface"
import type { VNode, Directive } from "vue"
import type { FormRef, FormRecord } from "../../form/interface"
import FdForm from "../../form/form"
import { h, withDirectives } from "vue"

/**
 * 表单渲染上下文
 */
interface RenderFormContext {
  options: UpsertOptions<FormRecord>
  state: {
    loading: { value: boolean }
    formRef: { value?: FormRef<FormRecord> }
  }
  loadingDirective?: Directive
  handleFormSlots: () => Record<string, (slotScope: Record<string, unknown>) => unknown>
  setFormRef: (ref: unknown) => void
}

/**
 * FormRef 类型守卫
 */
function isFormRef(value: unknown): value is FormRef<FormRecord> {
  if (!value || typeof value !== "object") return false
  return "submit" in value && "use" in value
}

/**
 * 渲染表单
 */
export function renderForm(context: RenderFormContext): VNode {
  const { options, state, loadingDirective, handleFormSlots, setFormRef } = context

  const formVNode = h(
    FdForm,
    {
      "ref": (instanceRef: unknown) => {
        if (isFormRef(instanceRef)) {
          setFormRef(instanceRef)
        }
      },
      "element-loading-text": options.dialog.loadingText,
    },
    handleFormSlots(),
  )

  if (!loadingDirective) return formVNode

  return withDirectives(formVNode, [[loadingDirective, state.loading.value]])
}
