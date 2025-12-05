import type { OptionRecord, FdSelectProps } from "./types"
import type { SelectProps as ElSelectProps } from "element-plus/es/components/select/src/select"
import { clone } from "@fonds/utils"
import { merge, isEqual } from "lodash-es"
import { fdSelectEmits, fdSelectPropOptions } from "./types"
import { ref, watch, computed, defineComponent, resolveDynamicComponent } from "vue"

// 扩展出来的增强属性，承担远程获取与交互控制职责
type ComponentProps = FdSelectProps

export default defineComponent<ComponentProps>({
  name: "fd-select",
  inheritAttrs: false, // 禁用属性自动继承，手动控制透传
  props: fdSelectPropOptions,
  emits: fdSelectEmits,
  setup(props, { emit, attrs, slots, expose }) {
    const SEARCH_FIELD = "keyword"
    const DEBOUNCE_MS = 300
    const VALUE_KEY = "value"

    // 双向绑定 modelValue
    const modelValue = computed<ElSelectProps["modelValue"]>({
      get: () => props.modelValue,
      set: value => emit("update:modelValue", value),
    })

    // 组件 class 合并，确保自定义 class 不覆盖内置前缀
    const selectClass = computed(() => {
      const extra = (attrs as Record<string, unknown>).class
      return extra ? ["fd-select", extra] : ["fd-select"]
    })

    // 过滤 class，保留其余 attrs 透传
    const selectNativeAttrs = computed(() => {
      const { class: _class, ...rest } = attrs
      return rest
    })

    // 命名插槽列表，便于批量注入增强上下文
    const namedSlotKeys = computed(() => Object.keys(slots).filter(name => name !== "default"))

    // 远程数据、加载状态与搜索关键字
    const remoteOptionList = ref<OptionRecord[]>([])
    const optionLoading = ref(false)
    const currentSearchTerm = ref("")

    // 统一对外的可用选项：远程 > props.options > attrs.options
    // 优先级逻辑：如果是远程搜索，优先使用远程返回的数据；否则回退到 props 或 attrs 传入的静态选项
    const availableOptions = computed<OptionRecord[]>(() => {
      if (remoteOptionList.value.length > 0)
        return remoteOptionList.value
      const fallback = props.options
      if (Array.isArray(fallback))
        return fallback as OptionRecord[]
      const external = (attrs as Record<string, unknown>).options
      return Array.isArray(external) ? (external as OptionRecord[]) : []
    })

    const labelKey = computed(() => props.labelKey ?? "label")
    const valueKey = computed(() => VALUE_KEY)

    // 监听 api 变化，重置数据并按需刷新
    watch(
      () => props.api,
      () => {
        remoteOptionList.value = []
        if (props.api)
          void refresh()
      },
      { immediate: true },
    )

    // 监听 params 变化，深度比较，发生变化时触发刷新
    watch(
      () => props.params,
      (next, prev) => {
        if (!isEqual(next, prev))
          void refresh()
      },
      { deep: true },
    )

    // 合并基础参数与额外条件，最终输入远程服务
    function resolveParams(extra: Record<string, any> = {}) {
      const base = typeof props.params === "function" ? props.params(extra) : props.params ?? {}
      return merge({}, clone(base), extra)
    }

    // 远程刷新选项，同时处理加载状态与异常兜底
    async function refresh(extra: Record<string, any> = {}) {
      if (!props.api) {
        remoteOptionList.value = []
        return
      }

      optionLoading.value = true
      try {
        const payload = resolveParams(extra)
        let result: OptionRecord[] = []

        if (typeof props.api === "function") {
          result = await props.api(payload)
        }
        else if (typeof props.api === "string") {
          const url = new URL(props.api, window.location.origin)
          Object.keys(payload).forEach((key) => {
            const val = payload[key]
            if (val !== undefined && val !== null)
              url.searchParams.append(key, String(val))
          })

          const response = await fetch(url.toString(), { method: "GET", headers: { Accept: "application/json" } })
          if (!response.ok)
            throw new Error(`Request failed: ${response.status}`)

          const json = await response.json()
          result = Array.isArray(json) ? json : []
        }

        remoteOptionList.value = Array.isArray(result) ? result : []
      }
      catch (error) {
        console.error("[fd-select] fetch error:", error)
        remoteOptionList.value = []
      }
      finally {
        optionLoading.value = false
      }
    }

    // 聚焦时刷新（仅当已有搜索词）
    function handleFocus() {
      if (currentSearchTerm.value)
        void refresh({ [SEARCH_FIELD]: currentSearchTerm.value })
    }

    // 失焦时刷新（仅当已有搜索词）
    function handleBlur() {
      if (currentSearchTerm.value)
        void refresh({ [SEARCH_FIELD]: currentSearchTerm.value })
    }

    // 处理值变更，查找并回传完整的 Option 对象
    function handleChange(value: ElSelectProps["modelValue"]) {
      const key = valueKey.value
      if (Array.isArray(value)) {
        const matched = availableOptions.value.filter(item => value.includes(resolveOptionField(item, key)))
        emit("change", value, matched)
        return
      }
      const matched = availableOptions.value.find(item => resolveOptionField(item, key) === value)
      emit("change", value, matched)
    }

    // 清空搜索词并重置列表
    function handleClear() {
      currentSearchTerm.value = ""
      refresh()
      emit("clear")
    }

    // 搜索请求的防抖计时器，使用 trailing 模式避免立刻触发
    let searchTimer: ReturnType<typeof setTimeout> | undefined

    // 处理搜索输入，触发防抖刷新（仅 trailing）
    function handleFilterInput(value: string) {
      currentSearchTerm.value = value
      if (searchTimer)
        clearTimeout(searchTimer)
      if (value && props.api) {
        searchTimer = setTimeout(() => void refresh({ [SEARCH_FIELD]: value }), DEBOUNCE_MS)
      }
      if (value)
        emit("search", value)
    }

    // 解析选项特定字段值
    function resolveOptionField(option: OptionRecord, key: string | undefined) {
      if (!option || !key)
        return undefined
      return option[key]
    }

    // 解析选项 Key (用于 v-for)
    function resolveOptionKey(option: OptionRecord, index: number) {
      const value = resolveOptionField(option, valueKey.value)
      return value ?? index
    }

    // 过滤掉自定义属性，只保留透传给 el-select 的属性
    const forwardedProps = computed(() => {
      const {
        api,
        params,
        labelKey,
        ...rest
      } = props as ComponentProps
      return rest
    })

    // 自动整理透传属性，必要时补全 filterable / loading 等行为
    const selectBindingProps = computed(() => {
      const payload: Record<string, unknown> = {
        ...forwardedProps.value,
        ...(selectNativeAttrs.value as Record<string, unknown>),
      }
      // 如果配置了 API，自动开启远程搜索模式
      if (props.api) {
        payload.filterable = payload.filterable ?? true
        payload.remote = true
        payload.remoteMethod = payload.remoteMethod ?? handleFilterInput
      }
      // 同步 loading 状态（强制与远程请求一致，避免被上层覆盖）
      payload.loading = optionLoading.value
      return payload
    })

    expose({
      refresh,
      reload: refresh,
      options: availableOptions,
      loading: optionLoading,
      handleChange,
      handleFilterInput,
    })

    return () => {
      const ElSelect = resolveDynamicComponent("el-select") as any
      const ElOption = resolveDynamicComponent("el-option") as any

      const slotMap: Record<string, any> = {
        default: (scope: any) => {
          const payload = { ...scope, options: availableOptions.value, refresh, loading: optionLoading.value }
          if (slots.default)
            return slots.default(payload)
          return availableOptions.value.map((item, index) => (
            <ElOption
              key={resolveOptionKey(item, index)}
              label={resolveOptionField(item, labelKey.value)}
              value={resolveOptionField(item, valueKey.value)}
            />
          ))
        },
      }

      namedSlotKeys.value.forEach((name) => {
        const slot = slots[name]
        if (!slot)
          return
        slotMap[name] = (scope: any) => slot({ ...scope, options: availableOptions.value, refresh, loading: optionLoading.value })
      })

      return (
        <ElSelect
          class={selectClass.value}
          {...selectBindingProps.value}
          modelValue={modelValue.value}
          onUpdate:modelValue={(value: ElSelectProps["modelValue"]) => (modelValue.value = value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          onClear={handleClear}
          v-slots={slotMap}
        />
      )
    }
  },
})
