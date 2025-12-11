import type { SelectOption } from "./interface"
import type { ExtractPropTypes } from "vue"
import { isEqual } from "lodash-es"
import { ElSelect } from "element-plus"
import { isFunction } from "@fonds/utils"
import { selectEmits, selectProps } from "./select"
import { ref, watch, computed, defineComponent } from "vue"

export default defineComponent({
  name: "fd-select",
  inheritAttrs: false,
  props: selectProps,
  emits: selectEmits,
  setup(props: ExtractPropTypes<typeof selectProps>, { slots, attrs, emit, expose }) {
    const modelValue = computed({
      get: () => props.modelValue,
      set: value => emit("update:modelValue", value),
    })

    const list = ref<SelectOption[]>([])

    // 优先使用远程选项，否则回退静态 options；统一映射 label/value，避免空值警告。
    const rawOptions = computed<SelectOption[]>(() => (list.value.length > 0 ? list.value : props.options || []))
    const options = computed<SelectOption[]>(() =>
      rawOptions.value.map(option => ({
        ...option,
        label: (option as any)?.[props.labelKey] ?? (option as any)?.label ?? "",
        value: (option as any)?.[props.valueKey] ?? (option as any)?.value ?? "",
      })),
    )

    watch(
      () => props.api,
      () => {
        list.value = []
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
        list.value = []
        return
      }
      try {
        const params = (props.params || {}) as Record<string, unknown>
        const result = await props.api(params)
        list.value = Array.isArray(result) ? result : []
      }
      catch {
        list.value = []
      }
    }

    expose({ refresh, options })

    return () => (
      <ElSelect
        {...props}
        {...attrs}
        class={["fd-select", attrs.class].filter(Boolean)}
        modelValue={modelValue.value}
        options={options.value}
        onUpdate:modelValue={value => (modelValue.value = value)}
        v-slots={slots}
      />
    )
  },
})
