import { resolve } from "node:path"
import vue from "@vitejs/plugin-vue"
import dts from "vite-plugin-dts"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts({
      include: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
      outDir: "types",
    }),
  ],

  build: {
    lib: {
      entry: resolve(__dirname, "src/entry.ts"),
      name: "index",
      fileName: format => `index.${format}.js`,
      cssFileName: "index",
    },
    rollupOptions: {
      external: ["element-plus", "@element-plus/icons-vue", "vue"],
      output: {
        exports: "named",
        globals: {
          "element-plus": "ElementPlus",
          "@element-plus/icons-vue": "ElementPlusIconsVue",
          "vue": "Vue",
        },
      },
    },
    sourcemap: true,
    minify: "terser",
    cssCodeSplit: false,
  },
})
