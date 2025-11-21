import type { FormInstance } from "element-plus"
import type { FormField, FormModel, FormConfig } from "../../../types"
import { useConfig } from "../../../hooks"
import { cloneDeep } from "lodash-es"
import { ref, watch, reactive } from "vue"

export function useFormState<T extends FormModel = FormModel>() {
  const { dict, style } = useConfig()

  const config = reactive<FormConfig<T>>({
    title: "-",
    height: undefined,
    width: "50%",
    props: {
      labelWidth: 120,
      labelPosition: "right",
      requireAsteriskPosition: "right",
      scrollToError: true,
    } as FormConfig<T>["props"],
    items: [],
    form: {} as T,
    on: {},
    op: {
      hidden: false,
      saveButtonText: dict.label.save,
      closeButtonText: dict.label.close,
      justify: "flex-end",
      buttons: ["close", "save"],
    },
    dialog: {
      closeOnClickModal: false,
      appendToBody: true,
    },
    _data: {
      isDisabled: false,
    },
  })

  config.props.size = style.size

  const Form = ref<FormInstance>()
  const form = reactive<T>({} as T)
  const oldForm = ref<T>({} as T)
  const visible = ref(false)
  const saving = ref(false)
  const loading = ref(false)
  const disabled = ref(false)

  watch(
    () => form,
    (val) => {
      if (config.on?.change) {
        const next = val as Record<string, unknown>
        const prev = oldForm.value as Record<string, unknown>

        Object.keys(next).forEach((key) => {
          if (!Object.is(next[key], prev[key])) {
            config.on.change(val, key as FormField<T>)
          }
        })
      }

      oldForm.value = cloneDeep(val)
    },
    { deep: true },
  )

  watch(
    () => disabled.value,
    (value) => {
      if (!config._data) {
        config._data = { isDisabled: value }
      }
      else {
        config._data.isDisabled = value
      }
    },
    { immediate: true },
  )

  return {
    Form,
    config,
    form,
    visible,
    saving,
    loading,
    disabled,
  }
}

export * from "./action"
export * from "./plugins"
export * from "./tabs"
