import type { App } from 'vue'
import type { Options } from '../types/config'
import { merge } from 'lodash-es'
import { locale } from '../locale'

export function useProvide(app: App, options: Options = {}): Options {
  const data = merge({
    dict: {
      primaryId: 'id',
      label: locale['zh-cn'],
      api: { list: 'list', add: 'add', update: 'update', delete: 'delete', info: 'info', page: 'page' },
      pagination: { page: 'page', size: 'size' },
    },
    style: {},
    events: {},
    permission: { add: true, page: true, list: true, update: true, delete: true, detail: true },
  }, options)

  app.provide('__crud_config__', data)

  return data
}
