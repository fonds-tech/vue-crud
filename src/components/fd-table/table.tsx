import { useCore } from "@/hooks"
import { renderTable } from "./render/table"
import { useTableEngine } from "./engine"
import { useAttrs, defineComponent } from "vue"
import "./style.scss"

export default defineComponent({
  name: "fd-table",
  inheritAttrs: false,
  props: { name: String },
  setup(props, { emit, expose, slots }) {
    const attrs = useAttrs()
    const { crud, mitt } = useCore()

    const engine = useTableEngine({ emit, props, slots, attrs, crud, mitt })

    expose(engine.exposed)

    return () => renderTable({ slots, engine })
  },
})
