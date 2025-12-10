import { addButtonProps } from "./add-button"
import { useCore, useConfig } from "@/hooks"
import { ElButton, buttonEmits } from "element-plus"
import { computed, defineComponent } from "vue"

export default defineComponent({
  name: "fd-add-button",
  inheritAttrs: false,
  emits: buttonEmits,
  props: addButtonProps,
  setup(props, { slots, attrs, emit }) {
    const { crud } = useCore()
    const { style } = useConfig()

    const canAdd = computed(() => crud.getPermission("add"))
    const buttonSize = computed(() => props.size ?? style.size)
    const buttonType = computed(() => props.type ?? "primary")
    const fallbackLabel = computed(() => crud.dict?.label?.add ?? "新增")

    function handleClick(event: MouseEvent) {
      emit("click", event)
      crud.rowAdd()
    }

    return () => {
      if (!canAdd.value) return null

      const children = slots.default?.()

      return (
        <ElButton {...props} {...attrs} type={buttonType.value} size={buttonSize.value} onClick={handleClick}>
          {children && children.length > 0 ? children : fallbackLabel.value}
        </ElButton>
      )
    }
  },
})
