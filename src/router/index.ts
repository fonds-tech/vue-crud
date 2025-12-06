import Crud from "../views/crud/index.vue"
import Form from "../views/form/index.vue"
import Grid from "../views/grid/index.vue"
import Table from "../views/table/index.vue"
import Detail from "../views/detail/index.vue"
import Dialog from "../views/dialog/index.vue"
import Import from "../views/import/index.vue"
import Search from "../views/search/index.vue"
import Select from "../views/select/index.vue"
import Upsert from "../views/upsert/index.vue"
import Cascader from "../views/cascader/index.vue"
import AddButton from "../views/add-button/index.vue"
import ContextMenu from "../views/context-menu/index.vue"
import DeleteButton from "../views/delete-button/index.vue"
import { createRouter, createWebHistory } from "vue-router"

const routes = [
  {
    path: "/",
    redirect: "/crud",
  },
  {
    path: "/crud",
    name: "crud",
    component: Crud,
  },
  {
    path: "/form",
    name: "Form",
    component: Form,
  },
  {
    path: "/search",
    name: "Search",
    component: Search,
  },
  {
    path: "/table",
    name: "Table",
    component: Table,
  },
  {
    path: "/detail",
    name: "Detail",
    component: Detail,
  },
  {
    path: "/dialog",
    name: "Dialog",
    component: Dialog,
  },
  {
    path: "/grid",
    name: "Grid",
    component: Grid,
  },
  {
    path: "/select",
    name: "Select",
    component: Select,
  },
  {
    path: "/cascader",
    name: "Cascader",
    component: Cascader,
  },
  {
    path: "/context-menu",
    name: "ContextMenu",
    component: ContextMenu,
  },
  {
    path: "/add-button",
    name: "AddButton",
    component: AddButton,
  },
  {
    path: "/delete-button",
    name: "DeleteButton",
    component: DeleteButton,
  },
  {
    path: "/import",
    name: "Import",
    component: Import,
  },
  {
    path: "/upsert",
    name: "Upsert",
    component: Upsert,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
