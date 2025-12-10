import type { useAction } from "./actions"
import type { useMethods } from "./methods"
import type { FormHelpers } from "./helpers"
import type { FormInstance } from "element-plus"
import type { Ref, ComputedRef } from "vue"
import type { FormRecord, FormOptions, FormUseOptions, FormAsyncOptionsState } from "../types"
import { useFormApi } from "./methods"
import { createHelpers } from "./helpers"
import { normalizeItems } from "./filters"
import { clone, isFunction } from "@fonds/utils"
import { ref, useId, watch, computed, reactive } from "vue"
import { mergeFormOptions, createInitialOptions } from "./options"

export interface FormCore {
  id: string
  formRef: Ref<FormInstance | undefined>
  options: FormOptions
  model: FormRecord
  step: Ref<number>
  activeGroupName: Ref<string | number | undefined>
  resolvedActiveGroup: ComputedRef<string | number | undefined>
  activeStepName: ComputedRef<string | number | undefined>
  action: ReturnType<typeof useAction>
  methods: ReturnType<typeof useMethods>
  use: (opts?: FormUseOptions) => void
  next: () => void
  prev: () => void
  helpers: FormHelpers
}

export type { FormHelpers } from "./helpers"
export { createHelpers } from "./helpers"

/**
 * 初始化并组装表单引擎，输出渲染与对外暴露所需的完整上下文。
 * @returns 表单引擎实例，包含状态、动作、方法及辅助工具
 */
export function useFormCore(): FormCore {
  const id = typeof useId === "function" ? useId() : `fd-form-${Math.random().toString(36).slice(2)}`
  const formRef = ref<FormInstance>()

  const options = reactive<FormOptions>(createInitialOptions())
  const model = reactive(options.model) as FormRecord

  const step = ref(1)
  const activeGroupName = ref<string | number | undefined>(undefined)

  const resolvedActiveGroup = computed<string | number | undefined>(() => {
    if (options.group?.type !== "tabs" || !options.group.children?.length) {
      return undefined
    }
    return activeGroupName.value ?? options.group.children[0]?.name
  })

  const loadedGroups = ref<Set<string | number>>(new Set())
  const optionState = reactive<Record<string, FormAsyncOptionsState>>({})
  const helpers = createHelpers({ options, model, resolvedActiveGroup, step, loadedGroups, optionState })
  const { actions: action, methods } = useFormApi({ options, model, form: formRef, optionState })

  watch(
    () => ({
      type: options.group?.type,
      names: options.group?.children?.map(child => child?.name).filter(name => name !== undefined),
    }),
    (current) => {
      if (current.type !== "tabs") {
        activeGroupName.value = undefined
        return
      }
      const candidates = current.names ?? []
      if (!candidates.length) {
        activeGroupName.value = undefined
        return
      }
      const currentActive = activeGroupName.value
      if (currentActive === undefined || !candidates.includes(currentActive)) {
        activeGroupName.value = candidates[0]
      }
    },
    { deep: true, immediate: true },
  )

  watch(
    activeGroupName,
    (name) => {
      if (options.group?.type === "tabs") helpers.markGroupLoaded(name)
    },
    { immediate: true },
  )

  watch(
    step,
    () => {
      if (options.group?.type === "steps") helpers.markGroupLoaded(helpers.activeStepName.value)
    },
    { immediate: true },
  )

  function use(useOptions: FormUseOptions = {}) {
    mergeFormOptions({ options, model, step, helpers }, useOptions)
    normalizeItems({ options, model, helpers })
    if (options.group?.type === "tabs") {
      activeGroupName.value = options.group.children?.[0]?.name
      helpers.markGroupLoaded(activeGroupName.value)
    }
    else {
      activeGroupName.value = undefined
    }
    if (options.group?.type === "steps") {
      step.value = 1
      helpers.markGroupLoaded(helpers.activeStepName.value)
    }
  }

  function next() {
    methods.validate((isValid) => {
      if (!isValid) return
      const values = clone(model)
      const proceed = () => {
        const total = options.group?.children?.length || 0
        if (options.group?.type === "steps" && total > 0) {
          if (step.value >= total) {
            methods.submit()
          }
          else {
            step.value += 1
          }
        }
        else {
          methods.submit()
        }
      }

      if (isFunction(options.onNext)) {
        options.onNext(values, { next: proceed })
      }
      else {
        proceed()
      }
    })
  }

  function prev() {
    if (step.value > 1) {
      step.value -= 1
    }
  }

  return {
    id,
    formRef,
    options,
    model,
    step,
    activeGroupName,
    resolvedActiveGroup,
    activeStepName: helpers.activeStepName,
    action,
    methods,
    use,
    next,
    prev,
    helpers,
  }
}
