import { fileURLToPath } from "node:url"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "~icons": fileURLToPath(new URL("./test/__mocks__/icons", import.meta.url)),
    },
  },
  test: {
    environment: "happy-dom",
    watch: false,
    setupFiles: ["./test/setupTests.ts"],
    server: {
      deps: {
        inline: ["vitest-package-exports"],
      },
    },
  },
})
