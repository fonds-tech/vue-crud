import eslint from "@fonds/eslint-config"

export default eslint(
  {
    type: "app",
    vue: true,
    jsx: true,
    pnpm: true,
  },
  {
    rules: {
      "no-console": "off",
    },
  },
)
