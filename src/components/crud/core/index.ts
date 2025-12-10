import Mitt from "../../../utils/mitt"
import { merge } from "@fonds/utils"
import { useConfig } from "../../../hooks"
import { createHelper } from "./helper"
import { createService } from "./service"
import { createCrudContext } from "./context"

export function useCrudCore(options: { id?: string | number }) {
  const mitt = new Mitt()
  const { dict, permission } = useConfig()

  const { crud, config, useCrudOptions } = createCrudContext({
    id: options.id,
    dict,
    permission,
    mitt,
  })

  const helper = createHelper({ config, crud, mitt })
  const service = createService({
    config,
    crud,
    mitt,
    paramsReplace: helper.paramsReplace,
  })

  merge(crud, helper, service)

  crud.use = useCrudOptions

  return { crud, mitt }
}

export * from "./context"
export * from "./helper"
export * from "./service"
