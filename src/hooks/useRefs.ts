import { reactive } from "vue"

interface RefsMap {
  [key: string]: any
}

/**
 * 统一管理模板引用，便于在 JSX 中动态绑定。
 */
export function useRefs<T = any>() {
  const refs = reactive<RefsMap>({})

  function setRefs(name: string) {
    return (el: T) => {
      refs[name] = el
    }
  }

  return {
    refs,
    setRefs,
  }
}
