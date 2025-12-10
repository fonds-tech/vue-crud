import type { Ref } from "vue"
import type { FormRef, FormModel, FormUseOptions } from "@/components/form/types"
import { useParent } from "./useParent"
import { ref, watch } from "vue"

export function useForm<T extends FormModel = FormModel>(options?: FormUseOptions<T>, callback?: (form: FormRef<T>) => void): Ref<FormRef<T> | undefined> {
  const form = ref<FormRef<T>>()
  useParent("fd-form", form)

  watch(
    () => form.value,
    (val) => {
      if (!val) return
      if (options) {
        val.use(options)
      }
      callback?.(val)
    },
    { immediate: true },
  )

  return form
}
