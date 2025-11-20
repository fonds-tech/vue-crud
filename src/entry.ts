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
