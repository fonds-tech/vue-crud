import type { ExtractPropTypes } from "vue"
import { useCore, useConfig } from "@/hooks"
import { computed, defineComponent } from "vue"
import { ElButton, buttonEmits, buttonProps } from "element-plus"

const deleteButtonProps = {
  ...buttonProps,
  type: { ...buttonProps.type, default: "danger" },
} as const

export default defineComponent({
  name: "fd-delete-button",
  inheritAttrs: false,
  emits: buttonEmits,
  props: deleteButtonProps,
  setup(props: ExtractPropTypes<typeof deleteButtonProps>, { slots, attrs, emit }) {
    const { crud } = useCore()
    const { style } = useConfig()

    const canDelete = computed(() => crud.getPermission("delete"))
    const buttonSize = computed(() => props.size ?? style.size)
    const buttonType = computed(() => props.type ?? "danger")
    const selectionEmpty = computed(() => crud.selection.length === 0)
    const buttonDisabled = computed(() => Boolean(props.disabled) || selectionEmpty.value)
    const fallbackLabel = computed(() => crud.dict?.label?.delete ?? "删除")

    function handleDelete(event: MouseEvent) {
      emit("click", event)
      if (selectionEmpty.value) return
      void crud.rowDelete(...crud.selection)
    }

    return () => {
      if (!canDelete.value) return null

      const children = slots.default?.()

      return (
        <ElButton
          {...props}
          {...attrs}
          type={buttonType.value}
          size={buttonSize.value}
          disabled={buttonDisabled.value}
          onClick={handleDelete}
        >
          {children && children.length > 0 ? children : fallbackLabel.value}
        </ElButton>
      )
    }
  },
})

export type DeleteButtonProps = ExtractPropTypes<typeof deleteButtonProps>
