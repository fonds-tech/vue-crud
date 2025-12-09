import viteConfig from "./vite.config"
import { mergeConfig, defineConfig } from "vitest/config"

export default mergeConfig(viteConfig, defineConfig({
  test: {
    watch: false,
    environment: "happy-dom",
    reporters: ["verbose"],
    coverage: { enabled: true },
    setupFiles: ["./test/setupTests.ts"],
    server: {
      deps: {
        inline: ["vitest-package-exports"],
      },
    },
  },
}))
