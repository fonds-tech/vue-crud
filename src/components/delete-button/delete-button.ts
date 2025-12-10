import { buttonProps } from "element-plus"

// 继承 Element Plus 的 Button 属性，并将默认类型设置为 'danger'（危险/红色），
// 因为删除操作通常需要显眼的警示样式。
export const deleteButtonProps = {
  ...buttonProps,
  type: { ...buttonProps.type, default: "danger" },
}
