import Crud from "../views/crud.vue"
import Form from "../views/form.vue"
import Search from "../views/search.vue"
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
