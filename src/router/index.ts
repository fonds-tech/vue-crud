import CrudDemo from "../views/CrudDemo.vue"
import FormDebug from "../views/FormDebug.vue"
import SearchDebug from "../views/SearchDebug.vue"
import { createRouter, createWebHistory } from "vue-router"

const routes = [
  {
    path: "/",
    name: "CrudDemo",
    component: CrudDemo,
  },
  {
    path: "/form-debug",
    name: "FormDebug",
    component: FormDebug,
  },
  {
    path: "/search-debug",
    name: "SearchDebug",
    component: SearchDebug,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
