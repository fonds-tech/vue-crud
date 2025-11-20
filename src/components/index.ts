import type { App } from "vue"
import Crud from "./crud"
import Dialog from "./dialog"
import AddButton from "./add-button"
import DeleteButton from "./delete-button"

export const components: { [key: string]: any } = {
  Crud,
  AddButton,
  DeleteButton,
  Dialog,
}

/**
 * 注册所有全局组件到Vue应用实例。
 * @param app Vue应用实例
 */
export function useComponent(app: App): void {
  for (const i in components) {
    app.component(components[i].name, components[i])
  }
}
