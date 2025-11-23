import { defineComponent } from "vue"
import { useCore, useConfig } from "../../hooks"

export default defineComponent({
  name: "fd-delete-button",

  setup(_, { slots }) {
    const { crud } = useCore()
    const { style } = useConfig()

    return () => {
      return (
        crud.getPermission("delete") && (
          <el-button
            type="danger"
            size={style.size}
            disabled={crud.selection.length === 0}
            onClick={() => {
              void crud.rowDelete(...crud.selection)
            }}
          >
            {slots.default?.() || crud.dict.label.delete}
          </el-button>
        )
      )
    }
  },
})
