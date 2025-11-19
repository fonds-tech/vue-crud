import type { Config } from '../types/config'
import { inject } from 'vue'

export function useConfig(): Config {
  return inject('__crud_config__')
}
