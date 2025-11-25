import type { App, Component } from "vue"
import Crud from "./fd-crud"
import Form from "./fd-form/index.vue"
import Grid from "./fd-grid/index.vue"
import Table from "./fd-table/index.vue"
import Detail from "./fd-detail/index.vue"
import Dialog from "./fd-dialog/index.vue"
import Search from "./fd-search/index.vue"
import Select from "./fd-select/index.vue"
import Cascader from "./fd-cascader/index.vue"
import GridItem from "./fd-grid-item/index.vue"
import FdOption from "./fd-option/index.vue"
import AddButton from "./fd-add-button"
import DeleteButton from "./fd-delete-button"
import ImportButton from "./fd-import/index.vue"

export const components: Record<string, Component> = {
  Crud,
  Grid,
  GridItem,
  AddButton,
  DeleteButton,
  Dialog,
  Form,
  Search,
  FdOption,
  Select,
  Cascader,
  Detail,
  Table,
  ImportButton,
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
