import type Mitt from "../../../utils/mitt"
import type { Dict, CrudRef, Permission, CrudOptions, CrudRefInit } from "../interface"
import { merge } from "@fonds/utils"
import { inject, reactive } from "vue"

interface ContextOptions {
  name: string | number | undefined
  dict: Dict
  permission: Permission
  mitt: Mitt
}

export function createCrudContext({ name, dict, permission, mitt }: ContextOptions) {
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
  const config = reactive<CrudOptions>({
    ...defaultConfig,
    ...injectedOptions,
    dict: { ...defaultConfig.dict, ...injectedOptions.dict },
    permission: { ...defaultConfig.permission, ...injectedOptions.permission },
    style: { ...defaultConfig.style, ...injectedOptions.style },
    events: { ...defaultConfig.events, ...injectedOptions.events },
  })

  // 使用 CrudRefInit 初始化，后续通过 merge 注入方法
  const crudInit: CrudRefInit = {
    id: name,
    loading: false,
    selection: [],
    params: { page: 1, size: 20 },
    service: {},
    dict: { ...defaultConfig.dict, ...normalizedDict },
    permission: { ...defaultConfig.permission, ...normalizedPermission },
    mitt,
    config,
  }
  const crud = reactive(crudInit) as CrudRef

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
