import type { Ref } from "vue"
import type { SearchExpose, SearchOptions } from "@/components/search/interface"
import { useParent } from "./useParent"
import { ref, watch } from "vue"

/**
 * 获取 fd-search 组件实例并注入配置
 */
export function useSearch(options?: SearchOptions, callback?: (search: SearchExpose) => void): Ref<SearchExpose | undefined> {
  const search = ref<SearchExpose>()
  useParent("fd-search", search)

  watch(
    () => search.value,
    (val) => {
      if (!val) return
      if (options) {
        val.use(options)
      }
      callback?.(val)
    },
    { immediate: true },
  )

  return search
}
