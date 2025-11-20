import type { App } from "vue"
import Crud from "./crud"
import AddButton from "./add-button"

export const components: { [key: string]: any } = {
  Crud,
  AddButton,
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
