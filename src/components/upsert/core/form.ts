import type { UpsertMode, UpsertOptions } from "../interface"
import type { FormRef, FormRecord, FormUseOptions } from "../../form/types"
import { clone } from "@fonds/utils"
import { merge } from "lodash-es"
import { nextTick } from "vue"

/**
 * 表单构建上下文
 */
export interface FormBuilderContext {
  options: UpsertOptions<FormRecord>
  mode: { value: UpsertMode }
  formRef: { value?: FormRef<FormRecord> }
}

/**
 * 表单构建与应用。
 *
 * @param context 表单构建上下文
 * @returns 表单构建器对象
 */
export function createFormBuilder(
  context: FormBuilderContext,
) {
  const { options, mode, formRef } = context

  /**
   * 构建表单配置 options
   *
   * @param initialData 初始合并数据
   * @returns 表单配置 options
   */
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

  /**
   * 应用表单配置到实例
   *
   * @param initialData 初始合并数据
   */
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
