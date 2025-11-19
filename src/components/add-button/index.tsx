import { defineComponent } from 'vue'
import { useCore, useConfig } from '../../hooks'

export default defineComponent({
  name: 'fd-add-button',

  setup(_, { slots }) {
    const { crud } = useCore()
    const { style } = useConfig()

    return () => {
      return (
        crud.getPermission('add') && (
          <el-button type="primary" size={style.size} onClick={crud.rowAdd}>
            {slots.default?.() || crud.dict.label.add}
          </el-button>
        )
      )
    }
  },
})
