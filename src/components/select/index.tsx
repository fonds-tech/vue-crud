import type { Slot, PropType } from "vue"
import { selectProps } from "element-plus/es/components/select/src/select"
import { ElOption, ElSelect } from "element-plus"
import { merge, isEmpty, isEqual, cloneDeep } from "lodash-es"
import { ref, watch, computed, useAttrs, defineComponent } from "vue"

type LooseRecord = Record<string, unknown>
type OptionItem = LooseRecord
type SelectPrimitive = string | number | boolean | OptionItem
type SelectValue = SelectPrimitive | SelectPrimitive[] | null | undefined
type ApiHandler = (params: LooseRecord) => Promise<OptionItem[] | unknown>
type ParamsResolver = LooseRecord | ((payload: LooseRecord) => LooseRecord)
type SelectPropKey = keyof typeof selectProps

interface FieldNames {
  label: string
  value: string
  disabled: string
}

const defaultFieldNames: FieldNames = {
  label: "label",
  value: "value",
  disabled: "disabled",
}

// 通用工具：安全解析 options、函数类型守卫、字段读取
const normalizeOptions = (source: unknown): OptionItem[] => (Array.isArray(source) ? (source as OptionItem[]) : [])
const isParamsResolver = (resolver: ParamsResolver): resolver is (payload: LooseRecord) => LooseRecord => typeof resolver === "function"
const isApiHandler = (handler?: ApiHandler): handler is ApiHandler => typeof handler === "function"
const resolveField = (item: OptionItem, key: string) => (Object.prototype.hasOwnProperty.call(item, key) ? item[key] : undefined)

const fdSelectProps = {
  ...selectProps,
  api: {
    type: Function as PropType<ApiHandler>,
    default: undefined,
  },
  params: {
    type: [Object, Function] as PropType<ParamsResolver>,
    default: () => ({}),
  },
  fieldNames: {
    type: Object as PropType<Partial<FieldNames>>,
    default: undefined,
  },
  searchField: {
    type: String,
    default: "name",
  },
  refreshOnBlur: {
    type: Boolean,
    default: true,
  },
  refreshOnFocus: {
    type: Boolean,
    default: true,
  },
} as const

export default defineComponent({
  name: "el-select",
  inheritAttrs: false,
  props: fdSelectProps,
  emits: {
    "update:modelValue": (_value?: SelectValue) => true,
    "change": (_value?: SelectValue, _extra?: unknown) => true,
    "search": (_value: string) => true,
    "clear": () => true,
  },
  setup(props, { emit, slots, expose }) {
    // -----------------------------
    // 基础状态：继承 attrs、维护当前值、loading、搜索关键字以及远程 options
    // -----------------------------
    const attrs = useAttrs() as LooseRecord
    const selectValue = ref<SelectValue | undefined>(props.modelValue)
    const loading = ref(false)
    const searchKeyword = ref("")
    const remoteOptions = ref<OptionItem[]>([])

    // -----------------------------
    // props/attrs 透传与字段映射
    // -----------------------------
    const elSelectProps = computed<LooseRecord>(() => {
      const mapped: LooseRecord = {}
      ;(Object.keys(selectProps) as SelectPropKey[]).forEach((key) => {
        mapped[key] = props[key]
      })
      return mapped
    })

    // 透传除 class/自定义字段外的其它 attrs，避免污染 ElSelect
    const passthroughAttrs = computed<LooseRecord>(() => {
      const cloned = { ...attrs }
      delete cloned.class
      delete cloned.fieldNames
      return cloned
    })

    // 字段映射：支持自定义 label/value/disabled 键
    const fieldNames = computed<FieldNames>(() => {
      const custom = props.fieldNames
      return {
        label: custom?.label ?? defaultFieldNames.label,
        value: custom?.value ?? defaultFieldNames.value,
        disabled: custom?.disabled ?? defaultFieldNames.disabled,
      }
    })

    // -----------------------------
    // options 数据来源：优先远程，fallback 为 props.options
    // -----------------------------
    const fallbackOptions = computed<OptionItem[]>(() => normalizeOptions(props.options))
    const options = computed<OptionItem[]>(() => {
      const source = isEmpty(remoteOptions.value) ? fallbackOptions.value : remoteOptions.value
      return cloneDeep(source)
    })

    const mergedLoading = computed(() => Boolean(props.loading) || loading.value)
    const shouldRemote = computed(() => Boolean(props.remote) || isApiHandler(props.api))
    const shouldFilterable = computed(() => Boolean(props.filterable) || shouldRemote.value)

    // -----------------------------
    // 数据获取与刷新：统一封装 API 调用与暴露 refresh
    // -----------------------------
    async function fetchOptions(extra: LooseRecord = {}, showLoading = false) {
      if (!isApiHandler(props.api)) {
        return
      }
      const paramsSource = props.params
      const baseParams = isParamsResolver(paramsSource) ? paramsSource(extra) : cloneDeep(paramsSource ?? {})
      if (showLoading) {
        loading.value = true
      }
      try {
        const response = await props.api(merge(baseParams, extra))
        remoteOptions.value = normalizeOptions(response)
      }
      finally {
        if (showLoading) {
          loading.value = false
        }
      }
    }

    // 对外暴露的刷新入口
    function refresh(extra: LooseRecord = {}) {
      void fetchOptions(extra, true)
    }

    // -----------------------------
    // 事件处理：模型同步、change、远程搜索、焦点与清空
    // -----------------------------
    function updateModelValue(value?: SelectValue) {
      selectValue.value = value
      emit("update:modelValue", value)
    }

    // change 事件：多选返回勾选项集合，单选返回当前行
    function handleChange(value?: SelectValue) {
      const valueKey = fieldNames.value.value
      const list = options.value
      if (props.multiple && Array.isArray(value)) {
        const items = list.filter((item) => {
          const itemValue = resolveField(item, valueKey) as SelectPrimitive | undefined
          return itemValue !== undefined && value.includes(itemValue)
        })
        emit("change", value, items)
        return
      }
      const normalizedValue = Array.isArray(value) ? undefined : value
      const matched = list.find(item => resolveField(item, valueKey) === normalizedValue)
      emit("change", normalizedValue, matched)
    }

    // 远程搜索：手动触发 API，并同步关键字
    function handleRemoteSearch(keyword: string) {
      if (!keyword) {
        return
      }
      searchKeyword.value = keyword
      void fetchOptions({ [props.searchField]: keyword })
      emit("search", keyword)
    }

    // 焦点/失焦时按照配置决定是否重刷
    function handleFocus() {
      if (searchKeyword.value && props.refreshOnFocus) {
        refresh()
      }
    }

    function handleBlur() {
      if (searchKeyword.value && props.refreshOnBlur) {
        refresh()
      }
    }

    // 清空时重置关键字并刷新列表
    function handleClear() {
      searchKeyword.value = ""
      refresh()
      emit("clear")
    }

    // -----------------------------
    // watch & expose：响应 props 变化并暴露 refresh
    // -----------------------------
    watch(
      () => props.modelValue,
      (val) => {
        selectValue.value = val
      },
    )

    watch(
      () => props.api,
      () => refresh(),
      { immediate: true },
    )

    watch(
      () => props.params,
      (next, prev) => {
        if (!isEqual(next, prev)) {
          refresh()
        }
      },
      { deep: true },
    )

    expose({ refresh })

    // -----------------------------
    // 插槽透传与默认 option 渲染（若用户未自定义 default slot）
    // -----------------------------
    const slotsMap = slots as Record<string, Slot | undefined>

    const buildSlots = () => {
      const result: Record<string, Slot> = {}
      Object.entries(slotsMap).forEach(([name, slotRender]) => {
        if (name === "default" || typeof slotRender !== "function") {
          return
        }
        result[name] = scope => slotRender(scope) ?? []
      })
      return result
    }

    // 默认 option 渲染：若开发者自定义 default 槽位则不干预
    const renderOptions = () => {
      if (typeof slots.default === "function") {
        return slots.default()
      }
      const fieldLabel = fieldNames.value.label
      const fieldValue = fieldNames.value.value
      const fieldDisabled = fieldNames.value.disabled
      return options.value.map((item, index) => {
        const rawValue = resolveField(item, fieldValue) as SelectPrimitive | undefined
        const value = rawValue ?? index
        const rawLabel = resolveField(item, fieldLabel)
        const label = typeof rawLabel === "string" ? rawLabel : String(rawLabel ?? value)
        const disabled = Boolean(resolveField(item, fieldDisabled))
        return (
          <ElOption
            key={String(value)}
            label={label}
            value={value}
            disabled={disabled}
          />
        )
      })
    }

    // -----------------------------
    // 渲染：优先使用用户传入的 remoteMethod，否则回退到组件内部实现
    // -----------------------------
    const remoteMethod = computed(() => props.remoteMethod ?? (shouldRemote.value ? handleRemoteSearch : undefined))

    // -----------------------------
    // 渲染：ElSelect 透传原生 props/attrs，并覆盖 loading、remoteMethod、事件回调
    // -----------------------------
    return () => (
      <ElSelect
        {...elSelectProps.value}
        {...passthroughAttrs.value}
        class={["el-select", attrs.class]}
        loading={mergedLoading.value}
        filterable={shouldFilterable.value}
        remote={shouldRemote.value}
        remoteMethod={remoteMethod.value}
        modelValue={selectValue.value}
        onUpdate:modelValue={updateModelValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClear={handleClear}
        v-slots={buildSlots()}
      >
        {renderOptions()}
      </ElSelect>
    )
  },
})
