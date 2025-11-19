import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    watch: false,
    server: {
      deps: {
        inline: ['vitest-package-exports'],
      },
    },
  },
})
