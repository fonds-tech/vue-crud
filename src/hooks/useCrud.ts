import type { Ref } from "vue"
import type { CrudRef, CrudOptions } from "../types"
import { useParent } from "./useParent"
import { ref, watch, provide } from "vue"

export function useCrud(options?: CrudOptions, callback?: (app: CrudRef) => void): Ref<CrudRef> {
  const crud = ref<CrudRef>()
  useParent("fd-crud", crud)

  if (options) {
    // 测试模式
    if (options.service === "test") {
    //   options.service = new TestService()
    }

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
