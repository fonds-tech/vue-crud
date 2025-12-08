import { renderSearch } from "./render"
import { useSearchEngine } from "./engine"
import { useSlots, defineComponent } from "vue"
import "./style.scss"

export default defineComponent({
  name: "fd-search",
  inheritAttrs: false,
  setup(_, { slots: setupSlots, expose }) {
    const slots = useSlots()

    const engine = useSearchEngine(setupSlots)

    expose({
      get model() {
        return engine.formModel.value
      },
      form: engine.formRef,
      use: engine.use,
      reset: engine.reset,
      search: engine.search,
      collapse: engine.collapse,
    })

    return () => renderSearch({ engine, slots })
  },
})
