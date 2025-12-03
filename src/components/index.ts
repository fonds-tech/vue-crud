import type { App, Component } from "vue"
import Crud from "./fd-crud"
import Form from "./fd-form"
import Grid from "./fd-grid/index.vue"
import Table from "./fd-table/index.vue"
import Detail from "./fd-detail/index.vue"
import Dialog from "./fd-dialog/index.vue"
import Export from "./fd-export/index.vue"
import Import from "./fd-import/index.vue"
import Search from "./fd-search/index.vue"
import Select from "./fd-select/index.vue"
import Upsert from "./fd-upsert/index.vue"
import Cascader from "./fd-cascader/index.vue"
import GridItem from "./fd-grid-item/index.vue"
import FdOption from "./fd-option/index.vue"
import AddButton from "./fd-add-button/index.vue"
import DeleteButton from "./fd-delete-button/index.vue"
import FdContextMenu from "./fd-context-menu"

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
  Import,
  Export,
  Upsert,
  FdContextMenu,
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
