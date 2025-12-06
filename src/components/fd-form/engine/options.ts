import type { Ref } from "vue"
import type { FormHelpers } from "./helpers"
import type { FormItem, FormRecord, FormOptions, FormUseOptions } from "../types"
import { merge } from "lodash-es"

export function createInitialOptions(): FormOptions {
  return {
    key: 0,
    mode: "add",
    model: {},
    items: [],
    group: {},
    form: {
      labelWidth: "auto",
      scrollToError: true,
      validateOnRuleChange: true,
    },
    grid: {
      cols: 1,
      colGap: 0,
      rowGap: 0,
      collapsed: false,
      collapsedRows: 1,
    },
  }
}

interface MergeContext {
  options: FormOptions
  model: FormRecord
  step: Ref<number>
  helpers: Pick<FormHelpers, "isFormItemConfig">
}

/**
 * 合并外部 use 配置到内部响应式 options，并同步模型与步骤。
 * @param options 当前表单配置
 * @param model 当前表单数据模型
 * @param step 步骤 Ref
 * @param helpers 辅助方法集合
 * @param useOptions 外部传入的配置
 */
export function mergeFormOptions({ options, model, step, helpers }: MergeContext, useOptions: FormUseOptions = {}) {
  if (useOptions.key !== undefined) {
    options.key = Number(useOptions.key)
  }
  if (useOptions.mode) {
    options.mode = useOptions.mode
  }
  if (useOptions.form) {
    options.form = merge({}, options.form, useOptions.form)
  }
  if (useOptions.grid) {
    options.grid = merge({}, options.grid, useOptions.grid)
  }
  if (useOptions.group) {
    options.group = merge({}, options.group, useOptions.group)
  }
  if (useOptions.items) {
    const nextItems: FormItem[] = useOptions.items.filter(helpers.isFormItemConfig)
    options.items.splice(0, options.items.length, ...nextItems)
  }
  if (useOptions.onNext) {
    options.onNext = useOptions.onNext
  }
  if (useOptions.onSubmit) {
    options.onSubmit = useOptions.onSubmit
  }
  if (useOptions.model) {
    Object.keys(model).forEach((key) => {
      delete model[key]
    })
    Object.assign(model, useOptions.model)
  }
  step.value = 1
}
