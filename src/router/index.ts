import FdCrud from "../views/fd-crud/index.vue"
import FdForm from "../views/fd-form/index.vue"
import FdGrid from "../views/fd-grid/index.vue"
import FdTable from "../views/fd-table/index.vue"
import FdDetail from "../views/fd-detail/index.vue"
import FdDialog from "../views/fd-dialog/index.vue"
import FdImport from "../views/fd-import/index.vue"
import FdSearch from "../views/fd-search/index.vue"
import FdSelect from "../views/fd-select/index.vue"
import FdUpsert from "../views/fd-upsert/index.vue"
import FdCascader from "../views/fd-cascader/index.vue"
import FdAddButton from "../views/fd-add-button/index.vue"
import FdContextMenu from "../views/fd-context-menu/index.vue"
import FdDeleteButton from "../views/fd-delete-button/index.vue"
import { createRouter, createWebHistory } from "vue-router"

const routes = [
  {
    path: "/",
    redirect: "/crud",
  },
  {
    path: "/crud",
    name: "crud",
    component: FdCrud,
  },
  {
    path: "/form",
    name: "Form",
    component: FdForm,
  },
  {
    path: "/fd-form",
    name: "fd-form",
    component: FdForm,
  },
  {
    path: "/search",
    name: "Search",
    component: FdSearch,
  },
  {
    path: "/fd-search",
    name: "fd-search",
    component: FdSearch,
  },
  {
    path: "/fd-table",
    name: "fd-table",
    component: FdTable,
  },
  {
    path: "/fd-detail",
    name: "fd-detail",
    component: FdDetail,
  },
  {
    path: "/fd-dialog",
    name: "fd-dialog",
    component: FdDialog,
  },
  {
    path: "/dialog",
    name: "Dialog",
    component: FdDialog,
  },
  {
    path: "/fd-grid",
    name: "fd-grid",
    component: FdGrid,
  },
  {
    path: "/fd-select",
    name: "fd-select",
    component: FdSelect,
  },
  {
    path: "/fd-cascader",
    name: "fd-cascader",
    component: FdCascader,
  },
  {
    path: "/fd-context-menu",
    name: "fd-context-menu",
    component: FdContextMenu,
  },
  {
    path: "/context-menu",
    name: "ContextMenu",
    component: FdContextMenu,
  },
  {
    path: "/fd-add-button",
    name: "fd-add-button",
    component: FdAddButton,
  },
  {
    path: "/fd-delete-button",
    name: "fd-delete-button",
    component: FdDeleteButton,
  },
  {
    path: "/fd-import",
    name: "fd-import",
    component: FdImport,
  },
  {
    path: "/fd-upsert",
    name: "fd-upsert",
    component: FdUpsert,
  },
  {
    path: "/fd-crud",
    name: "fd-crud",
    component: FdCrud,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
