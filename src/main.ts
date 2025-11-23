import App from "./App.vue"
import zhCn from "element-plus/es/locale/lang/zh-cn"
import ElementPlus from "element-plus"
import { Crud } from "./entry"
import { createApp } from "vue"

import "element-plus/dist/index.css"

const app = createApp(App)

app.use(ElementPlus, { locale: zhCn })
app.use(Crud)

app.mount("#app")
