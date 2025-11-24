import Crud from "../views/crud/index.vue"
import Form from "../views/form/index.vue"
import Search from "../views/search/index.vue"
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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
