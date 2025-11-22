import type { Ref } from "vue"
import type { FormRef, FormModel } from "@/components/fd-form/type"
import { useParent } from "./useParent"
import { ref, watch } from "vue"

export function useForm<T extends FormModel = FormModel>(callback?: (form: FormRef<T>) => void): Ref<FormRef<T> | undefined> {
  const form = ref<FormRef<T>>()
  useParent("fd-form", form)

  watch(form, (val) => {
    if (val && callback) {
      callback(val)
    }
  }, { immediate: true })

  return form
}
