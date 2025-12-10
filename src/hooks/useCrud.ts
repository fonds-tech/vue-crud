import type { Ref } from "vue"
import type { CrudRef, CrudOptions } from "../types"
import { useParent } from "./useParent"
import { ref, watch } from "vue"

export function useCrud(options?: Partial<CrudOptions>, callback?: (app: CrudRef) => void): Ref<CrudRef | undefined> {
  const crud = ref<CrudRef>()
  useParent("fd-crud", crud)
  watch(
    () => crud.value,
    (val) => {
      if (!val) return
      if (options && typeof val.use === "function") {
        val.use(options)
      }
      callback?.(val)
    },
    { immediate: true },
  )

  return crud
}
