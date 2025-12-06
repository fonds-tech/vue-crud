import type { TableColumn, TableRecord } from "./type"
import { useCore } from "@/hooks"
import { renderTable } from "./render/table"
import { useTableEngine } from "./engine"
import { useAttrs, useSlots, defineComponent } from "vue"
import "./style.scss"

export default defineComponent({
  name: "fd-table",
  inheritAttrs: false,
  props: { name: String },
  emits: ["columnsChange"],
  setup(props, { slots, expose, emit }) {
    const attrs = useAttrs()
    const vueSlots = useSlots()
    const { crud, mitt } = useCore()

    // 初始化表格引擎
    const engine = useTableEngine({
      props,
      slots: vueSlots,
      attrs: attrs as Record<string, unknown>,
      emit: (event: "columnsChange", cols: TableColumn<TableRecord>[]) => emit(event, cols),
      crud,
      mitt,
    })

    // 暴露给父组件的实例属性和方法
    expose(engine.exposed)

    // 返回渲染函数
    return () => renderTable({ slots, engine, vueSlots })
  },
})
