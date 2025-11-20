import type { Config } from "../types/config"
import { inject } from "vue"

export function useConfig(): Config {
  const config = inject<Config>("__crud_config__")

  if (!config) {
    throw new Error("未检测到 CRUD 配置，请先在父组件中提供 __crud_config__")
  }

  return config
}
