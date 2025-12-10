import type { PropType } from "vue"
import type { OptionProps as ElOptionProps } from "element-plus/es/components/select/src/type"
import { computed, defineComponent, resolveDynamicComponent } from "vue"

type OptionRecord = Record<string, unknown>
type ComponentProps = Partial<ElOptionProps> & {
  option?: OptionRecord
  labelKey?: string
  valueKey?: string
}

export default defineComponent<ComponentProps>({
  name: "fd-option",
  inheritAttrs: false, // 禁用自动继承，手动处理属性合并
  props: {
    option: Object as PropType<OptionRecord>,
    labelKey: { type: String, default: "label" },
    valueKey: { type: String, default: "value" },
  },
  setup(props, { attrs, slots, expose }) {
    const optionClass = computed(() => {
      const extra = (attrs as Record<string, unknown>).class
      return extra ? ["fd-option", extra] : ["fd-option"]
    })

    // 计算最终传递给 el-option 的属性
    // 优先级：直接传入的属性 > option 对象中的属性
    const optionProps = computed<Record<string, unknown>>(() => {
      const { class: _class, ...restAttrs } = attrs as Record<string, unknown>
      // 复制透传属性（不包含 class，统一由 optionClass 处理）
      const merged: Record<string, unknown> = { ...restAttrs }

      // 复制非特殊 Props
      Object.entries(props as ComponentProps).forEach(([key, value]) => {
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

    // 暴露计算后的属性，方便测试与外部读取
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
