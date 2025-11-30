import App from "./App.vue"
import zhCn from "element-plus/es/locale/lang/zh-cn"
import router from "./router"
import ElementPlus from "element-plus"
import { Crud } from "./entry"
import { createApp } from "vue"

import "element-plus/dist/index.css"
import "element-plus/theme-chalk/dark/css-vars.css"
import "@/styles/index.scss"

const app = createApp(App)

app.use(ElementPlus, { locale: zhCn })
app.use(Crud)
app.use(router)

app.mount("#app")
