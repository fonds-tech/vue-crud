import { useCore } from "@/hooks"
import { renderTable } from "./render/table"
import { fdTableEmits } from "./type"
import { useTableEngine } from "./engine"
import { useAttrs, defineComponent } from "vue"
import "./style.scss"

export default defineComponent({
  name: "fd-table",
  inheritAttrs: false,
  props: { name: String },
  emits: [...fdTableEmits],
  setup(props, { slots, expose, emit }) {
    const attrs = useAttrs()
    const { crud, mitt } = useCore()

    const engine = useTableEngine({ props, slots, attrs, emit: emit as (event: string, ...args: unknown[]) => void, crud, mitt })

    expose(engine.exposed)

    return () => renderTable({ slots, engine })
  },
})
