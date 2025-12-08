import type { Ref, ComputedRef } from "vue"
import type { FormRef, FormItem, FormRecord } from "../form/types"
import type { UpsertMode, UpsertAction, UpsertOptions, UpsertUseOptions, UpsertCloseAction } from "./types"
import { merge } from "lodash-es"
import { clone, isFunction } from "@fonds/utils"
import { ref, computed, reactive } from "vue"

/**
 * Upsert 状态初始化上下文。
 */
interface UpsertStateContext {
  style: {
    form?: {
      labelWidth?: string | number
      labelPosition?: string
    }
  }
}

/**
 * Upsert 组件内部状态描述。
 */
export interface UpsertState {
  options: UpsertOptions<FormRecord>
  visible: Ref<boolean>
  loading: Ref<boolean>
  mode: Ref<UpsertMode>
  closeAction: Ref<UpsertCloseAction>
  formRef: Ref<FormRef<FormRecord> | undefined>
  formModel: ComputedRef<FormRecord>
  useUpsert: (useOptions?: UpsertUseOptions<FormRecord>) => void
}

function normalizeLabelPosition(position?: unknown) {
  if (position === "left" || position === "right" || position === "top")
    return position
  return undefined
}

function createDefaultOptions(
  style: UpsertStateContext["style"],
): UpsertOptions<FormRecord> {
  return {
    key: 0,
    mode: "add",
    form: {
      labelWidth: style.form?.labelWidth,
      labelPosition: normalizeLabelPosition(style.form?.labelPosition),
    },
    model: {},
    items: [],
    group: {},
    grid: {
      cols: 1,
      rowGap: 0,
      colGap: 12,
    },
    actions: [],
    dialog: {
      width: "60%",
      showClose: true,
      destroyOnClose: false,
      loadingText: "正在加载中...",
    },
  }
}

/**
 * Upsert 组件状态与 options 管理。
 */
export function createUpsertState(
  context: UpsertStateContext,
): UpsertState {
  const options = reactive<UpsertOptions<FormRecord>>(createDefaultOptions(context.style))
  const visible = ref(false)
  const loading = ref(false)
  const mode = ref<UpsertMode>("add")
  const closeAction = ref<UpsertCloseAction>("cancel")
  const formRef = ref<FormRef<FormRecord>>()

  const formModel = computed<FormRecord>(() => {
    if (formRef.value?.model) {
      return formRef.value.model
    }
    return options.model
  })

  function assignItems(items: Array<FormItem<FormRecord>> | undefined) {
    if (!items)
      return
    const filtered = items.filter((item): item is FormItem<FormRecord> => Boolean(item))
    options.items.splice(0, options.items.length, ...filtered)
  }

  function assignActions(actions: Array<UpsertAction<FormRecord>> | undefined) {
    if (!actions)
      return
    const filtered = actions.filter((action): action is UpsertAction<FormRecord> => Boolean(action))
    options.actions.splice(0, options.actions.length, ...filtered)
  }

  function resetModel(target?: Partial<FormRecord>) {
    Object.keys(options.model).forEach((key) => {
      delete options.model[key]
    })
    if (target) {
      Object.assign(options.model, target)
    }
  }

  /**
   * 合并外部 use 配置，重置 model/items/actions。
   */
  function useUpsert(useOptions: UpsertUseOptions<FormRecord> = {}) {
    const normalized = clone(useOptions)
    const { items, actions, model: modelOverrides, ...rest } = normalized
    merge(options, rest)

    if (options.form && "labelPosition" in options.form) {
      const normalizedLabel = normalizeLabelPosition(options.form.labelPosition)
      options.form = {
        ...options.form,
        labelPosition: normalizedLabel,
      }
    }

    const normalizedActions = Array.isArray(actions)
      ? actions
          .filter((action): action is UpsertAction<FormRecord> => Boolean(action))
          .map(action => merge({}, action))
      : undefined
    const normalizedItems = Array.isArray(items)
      ? items
          .filter((item): item is FormItem<FormRecord> => Boolean(item))
          .map(item => merge({}, item))
      : undefined

    assignActions(normalizedActions)
    assignItems(normalizedItems)

    if (modelOverrides) {
      if (isFunction(modelOverrides)) {
        const nextModel = modelOverrides(options.model)
        resetModel(nextModel ?? {})
      }
      else {
        resetModel(modelOverrides)
      }
    }
  }

  return {
    options,
    visible,
    loading,
    mode,
    closeAction,
    formRef,
    formModel,
    useUpsert,
  }
}
