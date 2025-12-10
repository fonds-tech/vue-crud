import type { Ref } from "vue"
import type { FormRecord } from "@/components/form/interface"
import type { UpsertRef, UpsertUseOptions } from "@/components/upsert/interface"
import { useParent } from "./useParent"
import { ref, watch } from "vue"

export function useUpsert<T extends FormRecord = FormRecord>(options?: UpsertUseOptions<T>, callback?: (upsert: UpsertRef<T>) => void): Ref<UpsertRef<T> | undefined> {
  const upsert = ref<UpsertRef<T>>()
  useParent("fd-upsert", upsert)

  watch(
    () => upsert.value,
    (instance) => {
      if (!instance) return
      if (options) {
        instance.use(options)
      }
      callback?.(instance)
    },
    { immediate: true },
  )

  return upsert
}
