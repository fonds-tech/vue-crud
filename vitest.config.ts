import vueJsx from "@vitejs/plugin-vue-jsx"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [vueJsx()],
  test: {
    environment: "happy-dom",
    watch: false,
    server: {
      deps: {
        inline: ["vitest-package-exports"],
      },
    },
  },
})
