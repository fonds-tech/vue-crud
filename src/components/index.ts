import type { App, Component } from "vue"
import Crud from "./crud"
import Form from "./form"
import Grid from "./grid"
import Table from "./table"
import Detail from "./detail"
import Dialog from "./dialog"
import Export from "./export"
import Import from "./import"
import Option from "./option"
import Search from "./search"
import Select from "./select"
import Upsert from "./upsert"
import Cascader from "./cascader"
import GridItem from "./grid-item"
import AddButton from "./add-button"
import ContextMenu from "./context-menu"
import DeleteButton from "./delete-button"

export const components: Record<string, Component> = {
  Crud,
  Grid,
  GridItem,
  AddButton,
  DeleteButton,
  Dialog,
  Form,
  Search,
  Option,
  Select,
  Cascader,
  Detail,
  Table,
  Import,
  Export,
  Upsert,
  ContextMenu,
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
