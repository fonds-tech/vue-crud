import type { FdOptionProps } from "./interface"
import { fdOptionProps } from "./option"
import { computed, defineComponent, resolveDynamicComponent } from "vue"

/**
 * fd-option 选项组件
 * @description 对 el-option 的封装，支持从对象自动提取 label 和 value
 */
export default defineComponent<FdOptionProps>({
  name: "fd-option",
  inheritAttrs: false,
  props: fdOptionProps,
  setup(props, { attrs, slots, expose }) {
    const optionClass = computed(() => {
      const extra = (attrs as Record<string, unknown>).class
      return extra ? ["fd-option", extra] : ["fd-option"]
    })

    /**
     * 计算最终传递给 el-option 的属性
     * 优先级：直接传入的属性 > option 对象中的属性
     */
    const optionProps = computed<Record<string, unknown>>(() => {
      const { class: _class, ...restAttrs } = attrs as Record<string, unknown>
      const merged: Record<string, unknown> = { ...restAttrs }

      // 复制非特殊 Props
      Object.entries(props as FdOptionProps).forEach(([key, value]) => {
        if (key === "option" || key === "labelKey" || key === "valueKey") return
        merged[key] = value
      })

      const option = props.option
      // 如果提供了 option 对象，尝试自动提取 label 和 value
      if (option) {
        if (merged.label === undefined && props.labelKey) merged.label = option[props.labelKey]
        if (merged.value === undefined && props.valueKey) merged.value = option[props.valueKey]
      }

      return { ...merged, class: optionClass.value }
    })

    expose({ optionProps })

    return () => {
      const ElOption = resolveDynamicComponent("el-option") as any
      const slotMap: Record<string, any> = {}

      Object.entries(slots).forEach(([name, slot]) => {
        if (!slot) return
        slotMap[name] = (scope: any) => slot(scope)
      })

      return <ElOption class="fd-option" {...optionProps.value} v-slots={slotMap} />
    }
  },
})
