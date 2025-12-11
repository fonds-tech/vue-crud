import eslint from "@fonds/eslint-config"

export default eslint(
  {
    type: "app",
    vue: true,
    jsx: true,
    pnpm: true,
    stylistic: true,
    typescript: true,
    formatters: true,
  },
  {
    rules: {
      "no-console": "off",
      "vue/singleline-html-element-content-newline": "off",
    },
  },
  { ignores: [".serena", "openspec"] },
)
