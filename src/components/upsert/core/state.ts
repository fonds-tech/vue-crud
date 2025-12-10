import type { Ref, ComputedRef } from "vue"
import type { FormRef, FormItem, FormRecord } from "../../form/types"
import type { UpsertMode, UpsertAction, UpsertOptions, UpsertUseOptions, UpsertCloseAction } from "../interface"
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
  /**
   * 响应式配置对象
   */
  options: UpsertOptions<FormRecord>
  /**
   * 弹窗是否可见
   */
  visible: Ref<boolean>
  /**
   * 是否处于加载/提交中状态
   */
  loading: Ref<boolean>
  /**
   * 当前操作模式 (add/update)
   */
  mode: Ref<UpsertMode>
  /**
   * 关闭时的触发动作记录
   */
  closeAction: Ref<UpsertCloseAction>
  /**
   * 内部表单组件引用
   */
  formRef: Ref<FormRef<FormRecord> | undefined>
  /**
   * 表单数据模型（计算属性）
   */
  formModel: ComputedRef<FormRecord>
  /**
   * 更新配置的方法
   */
  useUpsert: (useOptions?: UpsertUseOptions<FormRecord>) => void
}

/**
 * 规范化 labelPosition 参数
 *
 * @param position 输入的位置字符串
 * @returns 规范化后的位置 或 undefined
 */
function normalizeLabelPosition(position?: unknown) {
  if (position === "left" || position === "right" || position === "top") return position
  return undefined
}

/**
 * 创建默认配置对象
 *
 * @param style 全局样式配置
 * @returns 默认的 UpsertOptions 对象
 */
function createDefaultOptions(style: UpsertStateContext["style"]): UpsertOptions<FormRecord> {
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
      destroyOnClose: false, // 默认不销毁，保持状态
      loadingText: "正在加载中...",
    },
  }
}

/**
 * Upsert 组件状态与 options 管理。
 *
 * @param context 初始上下文，包含样式等
 * @returns Upsert 状态对象
 */
export function createUpsertState(context: UpsertStateContext): UpsertState {
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

  /**
   * 替换 items 数组，避免直接赋值导致丢失响应性
   *
   * @param items 新的表单项数组
   */
  function assignItems(items: Array<FormItem<FormRecord>> | undefined) {
    if (!items) return
    const filtered = items.filter((item): item is FormItem<FormRecord> => Boolean(item))
    options.items.splice(0, options.items.length, ...filtered)
  }

  /**
   * 替换 actions 数组
   *
   * @param actions 新的动作数组
   */
  function assignActions(actions: Array<UpsertAction<FormRecord>> | undefined) {
    if (!actions) return
    const filtered = actions.filter((action): action is UpsertAction<FormRecord> => Boolean(action))
    options.actions.splice(0, options.actions.length, ...filtered)
  }

  /**
   * 重置 model 数据
   *
   * @param target 可选的合并对象
   */
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
   *
   * @param useOptions 外部传入的 Upsert 配置
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
      ? actions.filter((action): action is UpsertAction<FormRecord> => Boolean(action)).map(action => merge({}, action))
      : undefined
    const normalizedItems = Array.isArray(items) ? items.filter((item): item is FormItem<FormRecord> => Boolean(item)).map(item => merge({}, item)) : undefined

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
