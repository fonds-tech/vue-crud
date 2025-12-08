import type { UpsertMode, UpsertOptions } from "./types"
import type { FormRef, FormRecord, FormUseOptions } from "../form/types"
import { clone } from "@fonds/utils"
import { merge } from "lodash-es"
import { nextTick } from "vue"

export interface FormBuilderContext {
  options: UpsertOptions<FormRecord>
  mode: { value: UpsertMode }
  formRef: { value?: FormRef<FormRecord> }
}

/**
 * 表单构建与应用。
 */
export function createFormBuilder(
  context: FormBuilderContext,
) {
  const { options, mode, formRef } = context

  function buildFormOptions(initialData: Record<string, unknown> = {}): FormUseOptions<FormRecord> {
    const key = Date.now()
    options.key = key
    options.mode = mode.value
    const baseModel: FormRecord = clone(options.model ?? {})
    const values: FormRecord = merge(baseModel, clone(initialData ?? {}))
    return {
      key,
      mode: mode.value,
      form: options.form,
      group: options.group,
      items: options.items,
      model: values,
      grid: options.grid,
      onNext: options.onNext,
    }
  }

  async function applyForm(initialData: Record<string, unknown> = {}) {
    await nextTick()
    const formOptions = buildFormOptions(initialData)
    if (formRef.value?.use) {
      formRef.value.use(formOptions)
    }
    if (formRef.value?.setMode) {
      formRef.value.setMode(mode.value)
    }
    formRef.value?.bindFields(formOptions.model ?? {})
  }

  return {
    buildFormOptions,
    applyForm,
  }
}
