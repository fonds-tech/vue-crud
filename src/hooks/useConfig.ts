import type { Config } from "../types/config"
import { inject } from "vue"

export function useConfig(): Config {
  // 提供默认值避免 Vue 注入缺失警告，再以业务错误提示。
  const config = inject<Config | null>("__crud_config__", null)

  if (!config) {
    throw new Error("未检测到 CRUD 配置，请先在父组件中提供 __crud_config__")
  }

  return config
}
