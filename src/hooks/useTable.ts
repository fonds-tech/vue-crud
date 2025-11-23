import type { Ref } from "vue"
import type { TableExpose, TableUseOptions } from "@/components/fd-table/type"
import { useParent } from "./useParent"
import { ref, watch } from "vue"

export function useTable(options?: TableUseOptions, callback?: (table: TableExpose) => void): Ref<TableExpose | undefined> {
  const table = ref<TableExpose>()
  useParent("fd-table", table)

  watch(
    () => table.value,
    (val) => {
      if (!val)
        return
      if (options) {
        val.use(options)
      }
      callback?.(val)
    },
    { immediate: true },
  )

  return table
}
