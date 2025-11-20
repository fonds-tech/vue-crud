import App from "./App.vue"
import ElementPlus from "element-plus"
import { Crud } from "./entry"
import { createApp } from "vue"

import "element-plus/dist/index.css"

const app = createApp(App)

app.use(ElementPlus)
app.use(Crud)

app.mount("#app")
