import type { FormRecord, FormUseOptions } from "../../form/types"
import type { SearchAction, SearchOptions, InternalOptions } from "../interface"
import { clone } from "@fonds/utils"
import { merge } from "lodash-es"

/**
 * 创建默认配置
 */
export function createDefaultOptions<T extends FormRecord = FormRecord>(): InternalOptions<T> {
  return {
    form: {
      model: {} as T,
      items: [],
      grid: {
        cols: 3,
        colGap: 12,
        rowGap: 12,
        collapsed: false,
        collapsedRows: 2,
      },
      form: {
        labelWidth: "auto",
      },
    },
    action: {
      items: clone([{ type: "search" }, { type: "reset" }]) as SearchAction<T>[],
      grid: {
        cols: 2,
        colGap: 12,
        rowGap: 12,
      },
    },
  }
}

/**
 * 合并搜索配置
 * @param options 当前配置
 * @param useOptions 新配置
 */
export function mergeSearchOptions<T extends FormRecord = FormRecord>(options: InternalOptions<T>, useOptions: SearchOptions<T>) {
  const { action, onSearch, onReset, ...formOptions } = useOptions

  // 合并动作配置
  if (action && Object.prototype.hasOwnProperty.call(action, "items")) {
    options.action.items.splice(0, options.action.items.length, ...(action.items ?? []))
  }

  if (action?.grid) {
    options.action.grid = options.action.grid ? merge({}, options.action.grid, action.grid) : clone(action.grid)
  }

  // 设置钩子
  options.onSearch = onSearch
  options.onReset = onReset

  // 合并表单配置
  const formConfig = formOptions as FormUseOptions<T>
  if (Object.keys(formConfig).length) {
    merge(options.form, formConfig)
  }

  return options
}
