export default {
  get(key: string) {
    return globalThis[key]
  },

  set(key: string, value: any) {
    globalThis[key] = value
  },
}
