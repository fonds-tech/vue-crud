import type { Slot, PropType } from "vue"
import { isEmpty } from "@/utils/check"
import { ElOption, ElSelect } from "element-plus"
import { merge, isEqual, cloneDeep } from "lodash-es"
import { ref, watch, computed, useAttrs, defineComponent } from "vue"

type LooseRecord = Record<string, unknown>
type SelectPrimitive = string | number | boolean | LooseRecord
type SelectValue = SelectPrimitive | SelectPrimitive[]
type ApiHandler = (params: LooseRecord) => Promise<unknown>
type ParamsResolver = LooseRecord | ((payload: LooseRecord) => LooseRecord)
type OptionItem = LooseRecord

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

const normalizeOptions = <T = OptionItem>(source: unknown): T[] => (Array.isArray(source) ? (source as T[]) : [])
const isParamsResolverFn = (resolver: ParamsResolver): resolver is (payload: LooseRecord) => LooseRecord => typeof resolver === "function"
const isApiHandler = (handler?: ApiHandler): handler is ApiHandler => typeof handler === "function"

function resolveBooleanAttr(value: unknown) {
  if (value === "" || value === "true") {
    return true
  }
  if (value === "false") {
    return false
  }
  return Boolean(value)
}

const resolveFieldValue = (item: OptionItem, key: string): unknown => (Object.prototype.hasOwnProperty.call(item, key) ? item[key] : undefined)

export default defineComponent({
  name: "zm-select",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number, Boolean, Object, Array] as PropType<SelectValue>,
      default: undefined,
    },
    api: {
      type: Function as PropType<ApiHandler>,
      default: undefined,
    },
    params: {
      type: [Object, Function] as PropType<ParamsResolver>,
      default: () => ({}),
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
  },
  emits: {
    "update:modelValue": (_value?: SelectValue) => true,
    "change": (_value?: SelectValue, _extra?: unknown) => true,
    "search": (_value: string) => true,
    "clear": () => true,
  },
  setup(props, { emit, slots, expose }) {
    const attrs = useAttrs() as LooseRecord
    const selectValue = ref<SelectValue | undefined>(props.modelValue)
    const list = ref<OptionItem[]>([])
    const loading = ref(false)
    const searchValue = ref("")

    const forwardedAttrs = computed<LooseRecord>(() => {
      const rest = { ...attrs }
      delete rest.class
      delete rest.options
      delete rest.loading
      delete rest.fieldNames
      delete rest.remote
      delete rest["remote-method"]
      delete rest.remoteMethod
      delete rest.filterable
      return rest
    })

    const fieldNames = computed<FieldNames>(() => {
      const attrFieldNames = attrs.fieldNames as Partial<FieldNames> | undefined
      return {
        label: attrFieldNames?.label ?? defaultFieldNames.label,
        value: attrFieldNames?.value ?? defaultFieldNames.value,
        disabled: attrFieldNames?.disabled ?? defaultFieldNames.disabled,
      }
    })

    const fallbackOptions = computed<OptionItem[]>(() => normalizeOptions<OptionItem>(attrs.options))
    const options = computed<OptionItem[]>(() => {
      const remoteOptions = list.value
      return cloneDeep(isEmpty(remoteOptions) ? fallbackOptions.value : remoteOptions)
    })

    const valueKey = computed(() => fieldNames.value.value)
    const labelKey = computed(() => fieldNames.value.label)
    const disabledKey = computed(() => fieldNames.value.disabled)

    const updateModelValue = (value?: SelectValue) => {
      selectValue.value = value
      emit("update:modelValue", value)
    }

    watch(
      () => props.modelValue,
      (val) => {
        selectValue.value = val
      },
    )

    const handleApiRequest = async (extra: LooseRecord = {}, showLoading = false) => {
      const apiHandler = props.api
      if (!isApiHandler(apiHandler)) {
        return
      }
      const paramsSource = props.params
      const baseParams = isParamsResolverFn(paramsSource) ? paramsSource(extra) : cloneDeep(paramsSource ?? {})
      if (showLoading) {
        loading.value = true
      }
      const mergedParams = merge(baseParams, extra)
      try {
        const res = await apiHandler(mergedParams)
        list.value = normalizeOptions<OptionItem>(res)
      }
      finally {
        if (showLoading) {
          loading.value = false
        }
      }
    }

    const refresh = (data: LooseRecord = {}) => {
      void handleApiRequest(data, true)
    }

    const shouldRemote = computed(() => {
      if ("remote" in attrs) {
        return resolveBooleanAttr(attrs.remote)
      }
      return isApiHandler(props.api)
    })

    const shouldFilterable = computed(() => {
      if ("filterable" in attrs) {
        return resolveBooleanAttr(attrs.filterable)
      }
      return shouldRemote.value
    })

    function onFocus() {
      if (searchValue.value && props.refreshOnFocus) {
        refresh()
      }
    }

    function onBlur() {
      if (searchValue.value && props.refreshOnBlur) {
        refresh()
      }
    }

    function onChange(value?: SelectValue) {
      const fieldKey = valueKey.value
      const currentOptions = options.value
      if (resolveBooleanAttr(attrs.multiple) && Array.isArray(value)) {
        const items = currentOptions.filter((item) => {
          const optionValue = resolveFieldValue(item, fieldKey) as SelectPrimitive | undefined
          return optionValue !== undefined && value.includes(optionValue)
        })
        emit("change", value, items)
        return
      }
      const normalizedValue = Array.isArray(value) ? undefined : value
      const matched = currentOptions.find((option) => {
        const optionValue = resolveFieldValue(option, fieldKey) as SelectPrimitive | undefined
        return optionValue === normalizedValue
      })
      emit("change", normalizedValue, matched)
    }

    function onRemoteSearch(value: string) {
      if (!value) {
        return
      }
      searchValue.value = value
      void handleApiRequest({ [props.searchField]: value })
      emit("search", value)
    }

    function onClear() {
      searchValue.value = ""
      refresh()
      emit("clear")
    }

    watch(
      () => props.api,
      () => {
        refresh()
      },
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

    const slotsMap = slots as Record<string, Slot | undefined>

    const buildSlots = () => {
      const forwarded: Record<string, Slot> = {}
      Object.keys(slotsMap).forEach((name) => {
        if (name === "default") {
          return
        }
        const slotRender = slotsMap[name]
        if (typeof slotRender !== "function") {
          return
        }
        forwarded[name] = (scope?: Record<string, unknown>) => slotRender(scope) ?? []
      })
      return forwarded
    }

    const renderOptions = () => {
      if (typeof slots.default === "function") {
        return slots.default() ?? []
      }
      const valueField = valueKey.value
      const labelField = labelKey.value
      const disabledField = disabledKey.value
      return options.value.map((item, index) => {
        const rawValue = resolveFieldValue(item, valueField) as SelectPrimitive | undefined
        const normalizedValue = rawValue ?? index
        const rawLabel = resolveFieldValue(item, labelField)
        const label = typeof rawLabel === "string" ? rawLabel : String(rawLabel ?? normalizedValue)
        const disabled = Boolean(resolveFieldValue(item, disabledField))
        return (
          <ElOption
            key={String(normalizedValue)}
            label={label}
            value={normalizedValue}
            disabled={disabled}
          />
        )
      })
    }

    return () => (
      <ElSelect
        {...forwardedAttrs.value}
        class={["zm-select", attrs.class]}
        loading={Boolean(attrs.loading) || loading.value}
        filterable={shouldFilterable.value}
        remote={shouldRemote.value}
        remoteMethod={onRemoteSearch}
        modelValue={selectValue.value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
        onClear={onClear}
        onUpdate:modelValue={updateModelValue}
        v-slots={buildSlots()}
      >
        {renderOptions()}
      </ElSelect>
    )
  },
})
