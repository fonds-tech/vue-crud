import type { CascaderValue } from "element-plus"
import type { CascaderOption } from "./interface"
import type { ExtractPropTypes } from "vue"
import { isEqual } from "lodash-es"
import { isFunction } from "@fonds/utils"
import { ElCascader } from "element-plus"
import { cascaderEmits, cascaderProps } from "./cascader"
import { ref, watch, computed, defineComponent } from "vue"

export default defineComponent({
  name: "fd-cascader",
  inheritAttrs: false,
  props: cascaderProps,
  emits: cascaderEmits,
  setup(props: ExtractPropTypes<typeof cascaderProps>, { slots, attrs, emit, expose }) {
    const modelValue = computed({
      get: () => props.modelValue,
      set: value => emit("update:modelValue", value),
    })

    const remoteOptionList = ref<CascaderOption[]>([])

    // options 优先级：优先使用远程获取结果，若远程为空则回退静态 props.options
    const options = computed<CascaderOption[]>(() => {
      if (remoteOptionList.value.length > 0) return remoteOptionList.value
      return props.options || []
    })

    watch(
      () => props.api,
      () => {
        remoteOptionList.value = []
        if (props.immediate && isFunction(props.api)) void refresh()
      },
      { immediate: true },
    )

    watch(
      () => props.params,
      (next, prev) => {
        if (!isEqual(next, prev)) void refresh()
      },
      { deep: true },
    )

    /**
     * 远程刷新：防止接口异常时残留旧数据；结果非数组时自动回退为空数组。
     */
    async function refresh() {
      if (!isFunction(props.api)) {
        remoteOptionList.value = []
        return
      }
      try {
        const result = await props.api((props.params || {}) as Record<string, unknown>)
        remoteOptionList.value = Array.isArray(result) ? result : []
      }
      catch {
        remoteOptionList.value = []
      }
    }

    expose({ refresh, options })

    return () => (
      <ElCascader
        {...props}
        {...attrs}
        class={["fd-cascader", attrs.class].filter(Boolean)}
        options={options.value}
        onUpdate:modelValue={value => (modelValue.value = value as CascaderValue)}
        v-slots={slots}
      />
    )
  },
})
