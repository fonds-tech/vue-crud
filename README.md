<h1 align="center">🚀 starter-ts</h1>

<div align="center">

一个现代化、功能完备的 TypeScript 项目入门模板。开箱即用，助你光速启动新项目！

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/fonds-tech/starter-ts/ci.yml?branch=main&logo=github&style=flat-square)](https://github.com/fonds-tech/starter-ts/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/starter-ts?color=%23007ec6&logo=npm&style=flat-square)](https://www.npmjs.com/package/starter-ts)
[![License](https://img.shields.io/github/license/fonds-tech/starter-ts?color=%234ac51c&style=flat-square)](./LICENSE)

</div>

## ✨ 特性

- ⚡️ **[pnpm](https://pnpm.io/)** - 快速、高效的包管理工具。
- 📦 **[tsdown](https://github.com/exo-info/tsdown)** - 超快的零配置 TypeScript 打包工具。
- 🧪 **[Vitest](https://vitest.dev/)** - 由 Vite 驱动的极速单元测试框架。
- 🎨 **[ESLint](https://eslint.org/)** - 强大的代码风格检查与自动修复。
- 提交前自动格式化与检查。
- 🤖 **GitHub Actions** - 预设 CI/CD 流程。
- 릴 **[bumpp](https://github.com/antfu/bumpp)** - 轻松实现版本发布。

## 📦 使用

### 克隆到本地

如果你喜欢这个模板，可以点击 "Use this template" 按钮来创建你自己的仓库。

或者，通过以下命令将项目克隆到本地：

```bash
git clone https://github.com/fonds-tech/starter-ts.git
cd starter-ts
```

### 安装依赖

推荐使用 `pnpm` 来安装依赖：

```bash
pnpm install
```

## 📜 可用脚本

项目内置了一些常用的脚本，方便你进行开发、测试和构建。

| 命令             | 描述                                      |
| :--------------- | :---------------------------------------- |
| `pnpm dev`       | 启动开发模式，文件变更时自动重新构建。    |
| `pnpm build`     | 为生产环境构建和打包代码。                |
| `pnpm test`      | 运行所有单元测试。                        |
| `pnpm lint`      | 检查代码风格问题。                        |
| `pnpm typecheck` | 对整个项目进行 TypeScript 类型检查。      |
| `pnpm release`   | 自动提升版本号并打上 Git 标签，方便发布。 |
| `pnpm start`     | 使用 `tsx` 直接运行 `src/index.ts`。      |

## 🤝 贡献

欢迎各种形式的贡献！如果你有任何想法或建议，请随时提出 Issue 或提交 Pull Request。

## 📄 许可证

[MIT](./LICENSE) © fonds-tech
