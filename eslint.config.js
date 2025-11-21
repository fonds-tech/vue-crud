import eslint from "@fonds/eslint-config"

export default eslint(
  {
    type: "app",
    vue: true,
    jsx: true,
    pnpm: true,
    stylistic: true,
    formatters: true,
    typescript: {
      tsconfigPath: "./tsconfig.json",
    },
  },
  {
    rules: {
      "no-console": "off",
      "ts/ban-ts-comment": "off",
    },
  },
  {
    ignores: [
      ".serena",
    ],
  },
)
