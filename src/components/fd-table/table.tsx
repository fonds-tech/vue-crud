import { useCore } from "@/hooks"
import { renderTable } from "./render/table"
import { useTableEngine } from "./engine"
import { tableEmitsExtended } from "./type"
import { useAttrs, defineComponent } from "vue"
import "./style.scss"

export default defineComponent({
  name: "fd-table",
  inheritAttrs: false,
  props: { name: String },
  emits: { ...tableEmitsExtended },
  setup(props, { slots, expose, emit }) {
    const attrs = useAttrs()
    const { crud, mitt } = useCore()
    const emitAny = emit as (event: string, ...args: unknown[]) => void

    const engine = useTableEngine({ props, slots, attrs, emit: emitAny, crud, mitt })

    expose(engine.exposed)

    return () => renderTable({ slots, engine })
  },
})
