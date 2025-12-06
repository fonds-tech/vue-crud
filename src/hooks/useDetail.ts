import type { Ref } from "vue"
import type { DetailRef, DetailUseOptions } from "@/components/detail/types"
import { useParent } from "./useParent"
import { ref, watch } from "vue"

export function useDetail(options?: DetailUseOptions, callback?: (detail: DetailRef) => void): Ref<DetailRef | undefined> {
  const detail = ref<DetailRef>()
  useParent("fd-detail", detail)

  watch(
    () => detail.value,
    (val) => {
      if (!val)
        return
      if (options) {
        val.use(options)
      }
      if (callback) {
        callback(val)
      }
    },
    { immediate: true },
  )

  return detail
}
