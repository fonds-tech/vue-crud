<template>
  <el-card class="crud-card">
    <fd-crud ref="crud">
      <template #default>
        <fd-search ref="search" />

        <fd-table ref="table">
          <template #toolbar>
            <fd-add-button />
            <fd-delete-button />
            <fd-import />
            <div class="toolbar-spacer"></div>
            <el-button type="primary" @click="handleExport">
              <el-icon><download /></el-icon>
              导出
            </el-button>
          </template>
        </fd-table>

        <fd-detail ref="detail" />
        <fd-upsert ref="upsert" />
      </template>
    </fd-crud>
  </el-card>
</template>

<script setup lang="ts">
import type { SearchOptions } from "@/components/fd-search/type"
import type { TableUseOptions } from "@/components/fd-table/type"
import type { DetailUseOptions } from "@/components/fd-detail/type"
import type { UpsertUseOptions } from "@/components/fd-upsert/type"
import { Download } from "@element-plus/icons-vue"
import { h, onMounted } from "vue"
import { assign, orderBy } from "lodash-es"
import { useCrud, useTable, useDetail, useSearch, useUpsert } from "@/hooks"

const userList = [
  {
    id: 1,
    name: "楚行云",
    createTime: "1996-09-14",
    wages: 73026,
    status: 1,
    account: "chuxingyun",
    occupation: 4,
    phone: 13797353874,
  },
  {
    id: 2,
    name: "秦尘",
    createTime: "1977-11-09",
    wages: 74520,
    status: 0,
    account: "qincheng",
    occupation: 3,
    phone: 18593911044,
  },
  {
    id: 3,
    name: "叶凡",
    createTime: "1982-11-28",
    wages: 81420,
    status: 0,
    account: "yefan",
    occupation: 1,
    phone: 16234136338,
  },
  {
    id: 4,
    name: "白小纯",
    createTime: "2012-12-17",
    wages: 65197,
    status: 1,
    account: "baixiaochun",
    occupation: 2,
    phone: 16325661110,
  },
  {
    id: 5,
    name: "韩立",
    createTime: "1982-07-10",
    wages: 99107,
    status: 1,
    account: "hanli",
    occupation: 2,
    phone: 18486594866,
  },
  {
    id: 6,
    name: "唐三",
    createTime: "2019-07-31",
    wages: 80658,
    status: 1,
    account: "tangsan",
    occupation: 5,
    phone: 15565014642,
  },
  {
    id: 7,
    name: "王林",
    createTime: "2009-07-26",
    wages: 57408,
    status: 1,
    account: "wanglin",
    occupation: 1,
    phone: 13852767084,
  },
  {
    id: 8,
    name: "李强",
    createTime: "2016-04-26",
    wages: 71782,
    status: 1,
    account: "liqiang",
    occupation: 3,
    phone: 18365332834,
  },
  {
    id: 9,
    name: "秦羽",
    createTime: "1984-01-18",
    wages: 87860,
    status: 1,
    account: "qinyu",
    occupation: 0,
    phone: 18149247129,
  },
]

function uuid(separator = "-"): string {
  const s: any[] = []
  const hexDigits = "0123456789abcdef"
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits[Math.floor(Math.random() * 0x10)]
  }
  s[14] = "4"
  s[19] = hexDigits[(s[19] & 0x3) | 0x8]
  s[8] = s[13] = s[18] = s[23] = separator

  return s.join("")
}

// 模拟 API 服务
const mockService = {
  // 分页列表
  async page(params: any) {
    const { keyWord, page, size, sort, order } = params || {}

    // 关键字查询
    const keyWordLikeFields = ["phone", "name"]

    // 等值查询
    const fieldEq = ["createTime", "occupation", "status"]

    // 模糊查询
    const likeFields = ["phone", "name"]

    // 过滤后的列表
    const list = orderBy(userList, order, sort).filter((e: any) => {
      let f = true

      if (keyWord !== undefined) {
        f = !!keyWordLikeFields.find(k => String(e[k]).includes(String(params.keyWord)))
      }

      fieldEq.forEach((k) => {
        if (f) {
          if (params[k] !== undefined) {
            f = e[k] === params[k]
          }
        }
      })

      likeFields.forEach((k) => {
        if (f) {
          if (params[k] !== undefined) {
            f = String(e[k]).includes(String(params[k]))
          }
        }
      })

      return f
    })

    return new Promise((resolve) => {
      // 模拟延迟
      setTimeout(() => {
        resolve({
          list: list.slice((page - 1) * size, page * size),
          pagination: {
            total: list.length,
            page,
            size,
          },
          subData: {
            wages: list.reduce((a, b) => {
              return a + b.wages
            }, 0),
          },
        })
      }, Math.random() * 3000)
    })
  },

  // 更新
  async update(params: { id: any, [key: string]: any }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = userList.find(e => e.id === params.id)
        if (item) {
          assign(item, params)
        }
        resolve(null)
      }, Math.random() * 3000)
    })
  },

  // 新增
  async add(params: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const id = uuid()
        userList.push({
          id,
          ...params,
        })
        resolve(id)
      }, Math.random() * 3000)
    })
  },

  // 详情
  async info(params: { id: any }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { id } = params || {}
        resolve(userList.find(e => e.id === id))
      }, Math.random() * 3000)
    })
  },

  // 删除
  async delete(params: { ids: any[] }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { ids = [] } = params || {}
        ids.forEach((id) => {
          const index = userList.findIndex(e => e.id === id)
          if (index > -1) {
            userList.splice(index, 1)
          }
        })
        resolve(null)
      }, Math.random() * 3000)
    })
  },
}

const crud = useCrud(
  {
    service: mockService,
    permission: { add: true, delete: true, update: true, detail: true },
  },
)

const searchOptions: SearchOptions = {
  model: {
    keyword: "",
    status: "",
    occupation: "",
  },
  grid: { cols: 4, colGap: 12, rowGap: 12, collapsedRows: 2 },
  items: [
    {
      field: "keyword",
      label: "关键词",
      component: {
        is: "el-input",
        props: { placeholder: "输入姓名或手机号", clearable: true },
      },
    },
    {
      field: "status",
      label: "状态",
      component: {
        is: "el-select",
        props: { placeholder: "全部状态", clearable: true },
        slots: {
          default: () => [
            h("el-option", { label: "启用", value: 1 }),
            h("el-option", { label: "禁用", value: 0 }),
          ],
        },
      },
    },
    {
      field: "occupation",
      label: "岗位",
      component: {
        is: "el-select",
        props: { placeholder: "选择岗位", clearable: true },
        slots: {
          default: () => [
            h("el-option", { label: "研发", value: 1 }),
            h("el-option", { label: "产品", value: 2 }),
            h("el-option", { label: "运营", value: 3 }),
          ],
        },
      },
    },
  ],
  action: {
    grid: { cols: 2, colGap: 12, rowGap: 12 },
    items: [
      { type: "search", text: "搜索" },
      { type: "reset", text: "重置" },
    ],
  },
}

const tableOptions: TableUseOptions = {
  table: {
    border: true,
    stripe: true,
  },
  columns: [
    { prop: "name", label: "姓名", minWidth: 140 },
    { prop: "account", label: "账号", minWidth: 140 },
    { prop: "createTime", label: "创建日期", minWidth: 160 },
    {
      prop: "status",
      label: "状态",
      dict: [
        { label: "启用", value: 1, type: "success" },
        { label: "禁用", value: 0, type: "danger" },
      ],
    },
    { prop: "wages", label: "薪资", minWidth: 120 },
    { prop: "phone", label: "手机号", minWidth: 160 },
    {
      type: "action",
      actions: () => [
        { text: "详情", type: "detail" },
        { text: "编辑", type: "update" },
        { text: "删除", type: "delete" },
      ],
    },
  ],
}

const detailOptions: DetailUseOptions = {
  items: [
    { label: "姓名", field: "name" },
    { label: "账号", field: "account" },
    { label: "薪资", field: "wages" },
    { label: "手机号", field: "phone" },
    { label: "入职时间", field: "createTime" },
    {
      label: "状态",
      field: "status",
      component: {
        is: () => "el-tag",
        props: (data: any) => ({ type: data.status ? "success" : "danger" }),
        slots: {
          default: (data: any) => () => (data.status ? "启用" : "禁用"),
        },
      },
    },
    // 备注信息较长，保持占满两列
    { label: "备注", field: "remark", span: 2 },
  ],
}

const occupationSelectOptions = [
  { label: "研发", value: 1 },
  { label: "产品", value: 2 },
  { label: "运营", value: 3 },
  { label: "销售", value: 4 },
  { label: "客服", value: 5 },
]

const upsertOptions: UpsertUseOptions = {
  form: { labelWidth: "96px" },
  grid: { cols: 1 },
  model: {
    status: 1,
  },
  items: [
    {
      field: "name",
      label: "姓名",
      required: true,
      component: {
        is: "el-input",
        props: { placeholder: "请输入姓名" },
      },
    },
    {
      field: "account",
      label: "账号",
      required: true,
      component: {
        is: "el-input",
        props: { placeholder: "请输入账号" },
      },
    },
    {
      field: "occupation",
      label: "岗位",
      required: true,
      component: {
        is: "el-select",
        props: { placeholder: "请选择岗位", clearable: true },
        slots: {
          default: () => occupationSelectOptions.map(option => h("el-option", { label: option.label, value: option.value })),
        },
      },
    },
    {
      field: "status",
      label: "启用状态",
      required: true,
      hook: "booleanNumber",
      component: {
        is: "el-switch",
        props: { activeValue: 1, inactiveValue: 0 },
      },
    },
    {
      field: "phone",
      label: "手机号",
      component: {
        is: "el-input",
        props: { placeholder: "请输入手机号" },
      },
    },
    {
      field: "createTime",
      label: "入职日期",
      component: {
        is: "el-date-picker",
        props: { type: "date", placeholder: "请选择日期", valueFormat: "YYYY-MM-DD" },
      },
    },
    {
      field: "wages",
      label: "薪资",
      component: {
        is: "el-input-number",
        props: { min: 0, max: 999999, controlsPosition: "right" },
      },
    },
    {
      field: "remark",
      label: "备注",
      span: 2,
      component: {
        is: "el-input",
        props: { type: "textarea", rows: 3, placeholder: "可填写额外说明" },
      },
    },
  ],
}

const search = useSearch(searchOptions)
const table = useTable(tableOptions)
const detail = useDetail(detailOptions)
const upsert = useUpsert(upsertOptions)

onMounted(() => {
  crud.value?.refresh()
})

function handleExport() {
  console.log("导出当前筛选结果:", search.value?.model)
  console.log("当前表格选中:", table.value?.selection)
}
</script>

<style scoped>
.crud-card {
  border: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);
}

.toolbar-spacer {
  flex: 1;
}

.toolbar-import {
  margin-left: 12px;
}

.import-alert {
  margin-top: 12px;
}
</style>
