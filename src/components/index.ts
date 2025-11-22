import type { App, Component } from "vue"
import Crud from "./crud"
import Form from "./form"
import Dialog from "./dialog"
import Search from "./search"
import Select from "./select/index.vue"
import FdOption from "./fd-option/index.vue"
import AddButton from "./add-button"
import DeleteButton from "./delete-button"

export const components: Record<string, Component> = {
  Crud,
  AddButton,
  DeleteButton,
  Dialog,
  FdOption,
  Form,
  Search,
  Select,
}

/**
 * 注册所有全局组件到Vue应用实例。
 * @param app Vue应用实例
 */
export function useComponent(app: App): void {
  Object.entries(components).forEach(([, component]) => {
    const componentName = typeof component?.name === "string" ? component.name : undefined
    if (componentName === undefined || componentName.length === 0) {
      return
    }
    app.component(componentName, component)
  })
}
