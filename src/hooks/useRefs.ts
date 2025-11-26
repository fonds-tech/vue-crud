import { reactive } from "vue"

/**
 * 统一管理模板引用，便于在 JSX 中动态绑定。
 */
export function useRefs<T = any>() {
  const refs = reactive<Record<string, T | null>>({})

  function setRefs(name: string) {
    return (el: any) => {
      refs[name] = el
    }
  }

  return {
    refs,
    setRefs,
  }
}
