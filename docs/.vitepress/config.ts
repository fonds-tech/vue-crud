import { defineConfig } from "vitepress"

export default defineConfig({
  lang: "zh-CN",
  title: "vue-crud",
  description: "用于快速搭建 CRUD 界面的 Vue 组件库",
  titleTemplate: ":title · vue-crud",
  lastUpdated: true,
  cleanUrls: true,
  markdown: {
    lineNumbers: true,
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
  },
  themeConfig: {
    nav: [
      { text: "指南", link: "/getting-started" },
      { text: "组件", link: "/components/add-button" },
      {
        text: "GitHub",
        link: "https://github.com/fonds-tech/vue-crud",
      },
    ],
    sidebar: {
      "/": [
        {
          text: "指南",
          items: [
            { text: "介绍", link: "/" },
            { text: "快速开始", link: "/getting-started" },
          ],
        },
        {
          text: "组件",
          items: [
            { text: "fd-add-button 新增按钮", link: "/components/add-button" },
          ],
        },
      ],
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/fonds-tech/vue-crud",
      },
    ],
    outline: {
      label: "本页目录",
    },
    footer: {
      message: "MIT License",
      copyright: `Copyright © ${new Date().getFullYear()} fonds-tech`,
    },
  },
})
