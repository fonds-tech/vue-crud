import type { App } from "vue"
import type { Options } from "./types/config"
import global from "./utils/global"
import { useProvide } from "./hooks/useProvide"
import { useComponent } from "./components"
import "./styles/index.scss"

const Crud = {
  install(app: App, options?: Options) {
    global.set("__crud_app__", app)

    useProvide(app, options)

    useComponent(app)

    return {
      name: "fd-crud",
    }
  },
}

export { Crud }

// ===================== 组件导出 =====================
export { default as FdAddButton } from "./components/add-button"
export { default as FdCascader } from "./components/cascader"
export { ContextMenu, contextMenu, default as FdContextMenu } from "./components/context-menu"
export { default as FdCrud } from "./components/crud"
// ===================== 类型导出 =====================
export * as CrudTypes from "./components/crud/interface"
export { default as FdDeleteButton } from "./components/delete-button"
export { default as FdDetail } from "./components/detail"
export * as DetailTypes from "./components/detail/interface"
export { default as FdDialog } from "./components/dialog"
export { default as FdExport } from "./components/export"
export { default as FdForm } from "./components/form"
export * as FormTypes from "./components/form/interface"
export { default as FdGrid } from "./components/grid"
export { FdGridItem } from "./components/grid-item"
export { default as FdImport } from "./components/import"
export { default as FdSearch } from "./components/search"

export * as SearchTypes from "./components/search/interface"
export { default as FdSelect } from "./components/select"
export { default as FdTable } from "./components/table"
export * as TableTypes from "./components/table/interface"
export { default as FdUpsert } from "./components/upsert"
export * as UpsertTypes from "./components/upsert/interface"
export * from "./types/config"
