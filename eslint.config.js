import eslint from "@fonds/eslint-config"

export default eslint(
  {
    type: "app",
    vue: true,
    jsx: true,
    pnpm: true,
    stylistic: true,
    typescript: {
      tsconfigPath: "./tsconfig.json",
    },
    formatters: {
      prettierOptions: {
        arrowParens: "always",
        bracketSameLine: false,
        bracketSpacing: true,
        endOfLine: "auto",
        printWidth: 180,
        proseWrap: "always",
        semi: false,
        singleAttributePerLine: false,
        singleQuote: false,
        tabWidth: 2,
        trailingComma: "all",
        useTabs: false,
        vueIndentScriptAndStyle: false,
        jsxBracketSameLine: false,
        jsxSingleQuote: false,
      },
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
