const globalStore = globalThis as typeof globalThis & Record<string, unknown>

export default {
  get<T = unknown>(key: string): T | undefined {
    return globalStore[key] as T | undefined
  },

  set<T = unknown>(key: string, value: T): void {
    globalStore[key] = value
  },
}
