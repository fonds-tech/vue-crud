import eslint from '@fonds/eslint-config'

export default eslint(
  {
    type: 'lib',
    vue: true,
    jsx: true,
    pnpm: true,
  },
)
