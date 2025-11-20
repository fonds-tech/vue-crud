import type { Ref } from "vue"
import type { CrudRef, CrudOptions } from "../types"
import { useParent } from "./useParent"
import { ref, watch, provide } from "vue"

export function useCrud(options?: Partial<CrudOptions>, callback?: (app: CrudRef) => void): Ref<CrudRef> {
  const crud = ref<CrudRef>()
  useParent("fd-crud", crud)

  if (options) {
    provide("__crud_options__", options)
  }

  watch(crud, (val) => {
    if (val) {
      if (callback) {
        callback(val)
      }
    }
  })

  return crud
}
