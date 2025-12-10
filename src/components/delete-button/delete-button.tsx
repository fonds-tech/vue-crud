import { deleteButtonProps } from "./delete-button"
import { useCore, useConfig } from "@/hooks"
import { ElButton, buttonEmits } from "element-plus"
import { computed, defineComponent } from "vue"

export default defineComponent({
  name: "fd-delete-button",
  inheritAttrs: false,
  emits: buttonEmits,
  props: deleteButtonProps,
  setup(props, { slots, attrs, emit }) {
    // 获取 CRUD 核心上下文和全局配置样式
    const { crud } = useCore()
    const { style } = useConfig()

    // 检查是否有删除权限，如果没有权限，组件将不渲染
    const canDelete = computed(() => crud.getPermission("delete"))

    // 计算按钮尺寸，优先使用 props 传入的尺寸，否则使用全局配置的尺寸
    const buttonSize = computed(() => props.size ?? style.size)

    // 计算按钮类型，默认为 'danger'
    const buttonType = computed(() => props.type ?? "danger")

    // 检查当前是否有选中的行，如果没有选中行，删除操作无法进行
    const selectionEmpty = computed(() => crud.selection.length === 0)

    // 计算按钮禁用状态：
    // 1. 如果 props 显式设置了 disabled
    // 2. 或者当前表格没有选中任何行（空选）
    const buttonDisabled = computed(() => Boolean(props.disabled) || selectionEmpty.value)

    // 计算按钮文本，优先使用字典配置中的 delete 标签，默认为 "删除"
    const fallbackLabel = computed(() => crud.dict?.label?.delete ?? "删除")

    // 处理点击事件
    function handleDelete(event: MouseEvent) {
      emit("click", event)
      // 如果没有选中行，仅触发点击事件，不执行删除逻辑
      if (selectionEmpty.value) return
      // 调用 CRUD 核心的行删除方法，传入当前选中的行数据
      void crud.rowDelete(...crud.selection)
    }

    return () => {
      // 如果没有删除权限，直接返回 null，不渲染任何内容
      if (!canDelete.value) return null

      const children = slots.default?.()

      return (
        <ElButton {...props} {...attrs} type={buttonType.value} size={buttonSize.value} disabled={buttonDisabled.value} onClick={handleDelete}>
          {children && children.length > 0 ? children : fallbackLabel.value}
        </ElButton>
      )
    }
  },
})
