import type Mitt from "../../utils/mitt"
import type { Dict, CrudRef, Permission, CrudOptions } from "./types"
import { clone, merge } from "@fonds/utils"
import { inject, reactive } from "vue"

interface ContextOptions {
  id: string | number | undefined
  dict: Dict
  permission: Permission
  mitt: Mitt
}

export function createCrudContext({ id, dict, permission, mitt }: ContextOptions) {
  // 规范化字典与权限，填充必需字段避免类型缺失
  const apiDefaults: Dict["api"] = {
    add: "",
    page: "",
    list: "",
    update: "",
    delete: "",
    detail: undefined,
  }

  const labelDefaults: Dict["label"] = {
    add: "",
    list: "",
    update: "",
    delete: "",
    detail: undefined,
    title: undefined,
  }

  const normalizedDict: Dict = {
    primaryId: dict?.primaryId ?? "id",
    api: { ...apiDefaults, ...(dict?.api ?? {}) },
    pagination: dict?.pagination,
    search: dict?.search,
    sort: dict?.sort,
    label: { ...labelDefaults, ...(dict?.label ?? {}) },
  }

  const normalizedPermission: Permission = { ...permission }

  // 注入全局配置，设置基础默认值保证类型完整
  const defaultConfig: CrudOptions = {
    dict: normalizedDict,
    permission: normalizedPermission,
    style: { size: "default" },
    events: {},
    service: {},
  }

  const injectedOptions = reactive<CrudOptions>(inject<CrudOptions>("__crud_options__", defaultConfig))

  // 配置对象与 CRUD 状态保持独立但可同步
  const config = reactive<CrudOptions>(merge({}, defaultConfig, injectedOptions) as CrudOptions)

  const crud = reactive<CrudRef>(
    merge(
      {
        id,
        loading: false,
        selection: [],
        params: { page: 1, size: 20 },
        service: {},
        dict: defaultConfig.dict,
        permission: defaultConfig.permission,
        mitt,
        config,
        proxy: () => {},
        set: () => {},
        on: () => {},
        rowInfo: () => {},
        rowAdd: () => {},
        rowEdit: () => {},
        rowAppend: () => {},
        rowDelete: async () => {},
        rowClose: () => {},
        refresh: async () => ({}),
        getPermission: () => true,
        paramsReplace: (params: Record<string, any>) => params,
        getParams: () => ({}),
        setParams: () => {},
      },
      clone({ dict: normalizedDict, permission: normalizedPermission }),
    ) as unknown as CrudRef,
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
