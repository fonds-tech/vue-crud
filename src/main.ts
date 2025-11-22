import App from "./App.vue"
import zhCn from "element-plus/es/locale/lang/zh-cn"
import dayjs from "dayjs"
import ElementPlus from "element-plus"
import { Crud } from "./entry"
import { createApp } from "vue"

import "element-plus/dist/index.css"

dayjs.locale("zh-cn")

const app = createApp(App)

app.use(ElementPlus, { locale: zhCn })
app.use(Crud)

app.mount("#app")
