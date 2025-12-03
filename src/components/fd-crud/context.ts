import type { Mitt } from "@fonds/utils"
import type { Dict, Permission } from "../../types/config"
import type { CrudRef, CrudOptions } from "./types"
import { clone, merge } from "@fonds/utils"
import { inject, reactive } from "vue"

interface ContextOptions {
  id: string | number | undefined
  dict: Dict
  permission: Permission
  mitt: Mitt
}

export function createCrudContext({ id, dict, permission, mitt }: ContextOptions) {
  // 注入全局配置，缺省为响应式空对象
  const injectedOptions = reactive<CrudOptions>(inject("__crud_options__", {} as CrudOptions))

  // 配置对象与 CRUD 状态保持独立但可同步
  const config = reactive<CrudOptions>(merge({}, injectedOptions))

  const crud = reactive<CrudRef>(
    merge(
      {
        id,
        loading: false,
        selection: [],
        params: { page: 1, size: 20 },
        service: {},
        dict: {},
        permission: {},
        mitt,
        config,
      },
      clone({ dict, permission }),
    ),
  )

  function useCrudOptions(useOptions: Partial<CrudOptions> = {}) {
    merge(config, useOptions)
    merge(crud, useOptions)
  }

  crud.use = useCrudOptions

  return {
    crud,
    config,
    useCrudOptions,
  }
}

export type { ContextOptions }
