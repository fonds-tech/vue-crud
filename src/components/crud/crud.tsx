import { useCrudCore } from "./core"
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

    const { crud, mitt } = useCrudCore({
      name: props.name || ins?.uid,
    })

    provide("crud", crud)
    provide("mitt", mitt)

    expose(crud)

    return () => h("div", { class: "fd-crud" }, slots.default?.())
  },
})
