import { buttonProps } from "element-plus"

export const addButtonProps = {
  ...buttonProps,
  type: { ...buttonProps.type, default: "primary" },
}
