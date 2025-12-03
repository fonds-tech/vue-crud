import { useConfig } from "../../hooks"
import { Mitt, merge } from "@fonds/utils"
import { createHelper } from "./helper"
import { createService } from "./service"
import { createCrudContext } from "./context"
import { h, provide, defineComponent, getCurrentInstance } from "vue"
import "./style.scss"

export default defineComponent({
  name: "fd-crud",
  props: {
    name: {
      type: String,
      required: false,
    },
  },
  setup(props, { slots, expose }) {
    const ins = getCurrentInstance()
    const mitt = new Mitt(ins?.uid)
    const { dict, permission } = useConfig()

    const { crud, config, useCrudOptions } = createCrudContext({
      id: props.name || ins?.uid,
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

    provide("crud", crud)
    provide("mitt", mitt)

    expose(crud)

    return () => h("div", { class: "fd-crud" }, slots.default?.())
  },
})
