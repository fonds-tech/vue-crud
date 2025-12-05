import type { CascaderValue } from "element-plus"
import type { PropType, ExtractPropTypes } from "vue"
import { merge, isEqual } from "lodash-es"
import { clone, isFunction } from "@fonds/utils"
import { ref, watch, computed, defineComponent } from "vue"
import { ElCascader, cascaderEmits, cascaderProps } from "element-plus"

type CascaderOption = Record<string, unknown>
/**
 * 远程接口的签名：接受参数对象并返回级联选项列表的 Promise。
 * @param {Record<string, unknown>} params - 静态或动态参数合并后的请求体
 * @returns Promise，用于异步获取级联选项数组
 */
type ApiHandler = (params: Record<string, unknown>) => Promise<CascaderOption[]>
type NativeCascaderProps = InstanceType<typeof ElCascader>["$props"]

const cascaderPropsExtended = {
  ...cascaderProps,
  api: { type: Function as PropType<ApiHandler> },
  params: { type: [Object, Function] as PropType<Record<string, unknown> | ((payload: Record<string, unknown>) => Record<string, unknown>)>, default: () => ({}) },
  immediate: { type: Boolean, default: true },
  options: { ...cascaderProps.options, default: () => [] },
} as const

/**
 * 事件声明：继承原生事件，并补充 clear 以在清空时对外通知。
 */
const cascaderEmitsExtended = {
  ...cascaderEmits,
  clear: () => true,
}

/**
 * 封装 ElCascader 的组件，提供远程加载、参数合并、清空刷新等增强能力。
 * @param {ExtractPropTypes<typeof cascaderPropsExtended>} props - 组件入参，包含 Element Plus 原生 Cascader 属性及远程扩展配置
 * @param slots - 透传的插槽集合
 * @param attrs - 传入的原生属性，用于 class/样式等透传
 * @param emit - 事件派发器，向上游同步 v-model 和 clear
 * @param expose - 对外暴露 refresh/options/loading，便于父组件调用
 * @returns JSX 渲染函数，渲染增强版 Cascader
 */
export default defineComponent({
  name: "enhanced-cascader",
  inheritAttrs: false,
  props: cascaderPropsExtended,
  emits: cascaderEmitsExtended,
  setup(props: ExtractPropTypes<typeof cascaderPropsExtended>, { slots, attrs, emit, expose }) {
    const modelValue = computed<CascaderValue | undefined>({
      get: () => props.modelValue as CascaderValue | undefined,
      set: value => emit("update:modelValue", value as CascaderValue),
    })

    // 处理组件 class 合并：确保外部 class 不会覆盖内部前缀，而是以数组方式追加
    const cascaderClass = computed(() => {
      const extra = attrs.class
      return extra ? ["fd-cascader", extra] : ["fd-cascader"]
    })

    // 过滤 attrs 中的 class，保留其余透传给原生 Cascader（如 data-*、style），避免 class 被重复注入
    const cascaderNativeAttrs = computed(() => {
      const { class: _class, ...rest } = attrs
      return rest
    })

    const remoteOptionList = ref<CascaderOption[]>([])
    const innerLoading = ref(false)

    // options 优先级：优先使用远程获取结果，若远程为空则回退静态 props.options
    const availableOptions = computed<CascaderOption[]>(() => {
      if (remoteOptionList.value.length > 0)
        return remoteOptionList.value
      return props.options || []
    })

    watch(
      () => props.api,
      () => {
        remoteOptionList.value = []
        if (props.immediate && isFunction(props.api))
          void refresh()
      },
      { immediate: true },
    )

    watch(
      () => props.params,
      (next, prev) => {
        if (!isEqual(next, prev))
          void refresh()
      },
      { deep: true },
    )

    /**
     * 解析请求参数：函数形态允许按需动态生成，静态对象则克隆后再 merge 以避免外部引用被修改。
     * @param {Record<string, unknown>} [extra] - 触发刷新时附带的临时参数
     * @returns 合并后的新对象
     */
    function resolveParams(extra: Record<string, unknown> = {}) {
      const base = isFunction(props.params) ? props.params(extra) : props.params ?? {}
      return merge({}, clone(base), extra)
    }

    /**
     * 远程刷新：包裹 loading 状态，防止接口异常时残留旧数据；结果非数组时自动回退为空数组。
     * @param {Record<string, unknown>} [extra] - 附加的请求参数
     * @returns Promise，用于等待拉取完成
     */
    async function refresh(extra: Record<string, unknown> = {}) {
      if (!isFunction(props.api)) {
        remoteOptionList.value = []
        return
      }
      innerLoading.value = true
      try {
        const payload = resolveParams(extra)
        const result = await props.api(payload)
        remoteOptionList.value = Array.isArray(result) ? result : []
      }
      finally {
        innerLoading.value = false
      }
    }

    function handleClear() {
      void refresh()
      emit("clear")
    }

    // 将 slots 转换为 JSX 期望的函数签名，保持 slot 名称与作用域一致
    const cascaderSlots = Object.fromEntries(
      Object.entries(slots).map(([name, slot]) => [name, (scope: Record<string, unknown>) => slot?.(scope)]),
    )

    expose({ refresh, options: availableOptions, loading: innerLoading })

    return () => {
      const { api: _api, params: _params, immediate: _immediate, ...nativeProps } = props

      // 仅透传 Element Plus 支持的原生 props/attrs，过滤自定义扩展，避免无意义属性落到 DOM
      const cascaderBindings: NativeCascaderProps = {
        ...(nativeProps as NativeCascaderProps),
        ...(cascaderNativeAttrs.value as NativeCascaderProps),
        "class": cascaderClass.value,
        "options": availableOptions.value,
        "modelValue": modelValue.value,
        "onUpdate:modelValue": value => (modelValue.value = value as CascaderValue),
        "onClear": handleClear,
      }

      return <ElCascader {...cascaderBindings} v-slots={cascaderSlots} />
    }
  },
})

export type CascaderProps = ExtractPropTypes<typeof cascaderPropsExtended>
