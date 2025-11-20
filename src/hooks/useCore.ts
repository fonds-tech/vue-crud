import type Mitt from "../utils/mitt"
import type { CrudRef } from "../types"
import { inject } from "vue"

/**
 * useCore Hook 用于提供注入的crud和mitt实例。
 * @returns 包含crud和mitt实例的对象。
 */
export function useCore(): { crud: CrudRef, mitt: Mitt } {
  const crud = inject("crud") as CrudRef
  const mitt = inject("mitt") as Mitt

  return { crud, mitt }
}
