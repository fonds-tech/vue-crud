import type { Ref } from "vue"
import { getCurrentInstance } from "vue"

export function useParent(name: string, ref: Ref): void {
  const ins = getCurrentInstance()

  if (ins) {
    let parent = ins.proxy?.$.parent

    if (parent) {
      while (parent && parent.type?.name !== name && parent.type?.name !== "fd-crud") {
        parent = parent?.parent
      }

      if (parent) {
        if (parent.type.name === name) {
          ref.value = parent.exposed
        }
      }
    }
  }
}
