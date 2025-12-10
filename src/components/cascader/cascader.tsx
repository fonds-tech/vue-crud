import type { CascaderValue } from "element-plus"
import type { CascaderOption } from "./interface"
import type { ExtractPropTypes } from "vue"
import { ElCascader } from "element-plus"
import { merge, isEqual } from "lodash-es"
import { clone, isFunction } from "@fonds/utils"
import { cascaderEmits, cascaderProps } from "./cascader"
import { ref, watch, computed, defineComponent } from "vue"

type NativeCascaderProps = InstanceType<typeof ElCascader>["$props"]

export default defineComponent({
  name: "fd-cascader",
  inheritAttrs: false,
  props: cascaderProps,
  emits: cascaderEmits,
  setup(props: ExtractPropTypes<typeof cascaderProps>, { slots, attrs, emit, expose }) {
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
     * 远程刷新：防止接口异常时残留旧数据；结果非数组时自动回退为空数组。
     * @param {Record<string, unknown>} [extra] - 附加的请求参数
     * @returns Promise，用于等待拉取完成
     */
    async function refresh(extra: Record<string, unknown> = {}) {
      if (!isFunction(props.api)) {
        remoteOptionList.value = []
        return
      }
      try {
        const payload = resolveParams(extra)
        const result = await props.api(payload)
        remoteOptionList.value = Array.isArray(result) ? result : []
      }
      catch {
        remoteOptionList.value = []
      }
    }

    // 将 slots 转换为 JSX 期望的函数签名，保持 slot 名称与作用域一致
    const cascaderSlots = Object.fromEntries(
      Object.entries(slots).map(([name, slot]) => [name, (scope: Record<string, unknown>) => slot?.(scope)]),
    )

    expose({ refresh, options: availableOptions })

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
      }

      return <ElCascader {...cascaderBindings} v-slots={cascaderSlots} />
    }
  },
})
