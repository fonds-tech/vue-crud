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
      { text: "组件", link: "/components/crud" },
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
            {
              text: "核心容器",
              items: [
                { text: "fd-crud CRUD 容器", link: "/components/crud" },
                { text: "fd-table 表格容器", link: "/components/table" },
                { text: "fd-form 表单引擎", link: "/components/form" },
                { text: "fd-search 搜索区", link: "/components/search" },
                { text: "fd-detail 详情弹窗", link: "/components/detail" },
                { text: "fd-dialog 弹窗容器", link: "/components/dialog" },
              ],
            },
            {
              text: "输入与选择",
              items: [
                { text: "fd-select 远程选择器", link: "/components/select" },
                { text: "fd-option 选项封装", link: "/components/option" },
                { text: "fd-cascader 级联选择", link: "/components/cascader" },
              ],
            },
            {
              text: "布局",
              items: [
                { text: "fd-grid 响应式栅格", link: "/components/grid" },
                { text: "fd-grid-item 栅格单元", link: "/components/grid-item" },
              ],
            },
            {
              text: "操作组件",
              items: [
                { text: "fd-add-button 新增按钮", link: "/components/add-button" },
                { text: "fd-delete-button 删除按钮", link: "/components/delete-button" },
              ],
            },
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
