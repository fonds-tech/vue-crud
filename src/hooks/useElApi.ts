import type { Ref } from "vue"

/**
 * 将 Element Plus 组件实例的方法透传为普通函数，方便在 setup 中直接调用。
 */
export function useElApi<T extends string>(methods: readonly T[], elRef: Ref<Partial<Record<T, (...args: unknown[]) => unknown>> | undefined>) {
  const api = {} as Record<T, (...args: unknown[]) => unknown>

  methods.forEach((method) => {
    api[method] = (...args: unknown[]) => {
      const handler = elRef.value?.[method]
      if (typeof handler === "function") {
        return handler(...args)
      }
      return undefined
    }
  })

  return api
}
