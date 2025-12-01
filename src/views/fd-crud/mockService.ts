import { assign, orderBy } from "lodash-es"

export const MOCK_USER_LIST = [
  { id: 1, name: "楚行云", createTime: "1996-09-14", wages: 73026, status: 1, account: "chuxingyun", occupation: 4, phone: 13797353874, remark: "主角光环" },
  { id: 2, name: "秦尘", createTime: "1977-11-09", wages: 74520, status: 0, account: "qincheng", occupation: 3, phone: 18593911044, remark: "绝世天才" },
  { id: 3, name: "叶凡", createTime: "1982-11-28", wages: 81420, status: 0, account: "yefan", occupation: 1, phone: 16234136338, remark: "天帝" },
  { id: 4, name: "白小纯", createTime: "2012-12-17", wages: 65197, status: 1, account: "baixiaochun", occupation: 2, phone: 16325661110, remark: "长生不死" },
  { id: 5, name: "韩立", createTime: "1982-07-10", wages: 99107, status: 1, account: "hanli", occupation: 2, phone: 18486594866, remark: "凡人修仙" },
  { id: 6, name: "唐三", createTime: "2019-07-31", wages: 80658, status: 1, account: "tangsan", occupation: 5, phone: 15565014642, remark: "蓝银草" },
  { id: 7, name: "王林", createTime: "2009-07-26", wages: 57408, status: 1, account: "wanglin", occupation: 1, phone: 13852767084, remark: "顺为凡逆为仙" },
  { id: 8, name: "李强", createTime: "2016-04-26", wages: 71782, status: 1, account: "liqiang", occupation: 3, phone: 18365332834, remark: "飘渺之旅" },
  { id: 9, name: "秦羽", createTime: "1984-01-18", wages: 87860, status: 1, account: "qinyu", occupation: 0, phone: 18149247129, remark: "星辰变" },
]

export class CrudMockService {
  dataList = [...MOCK_USER_LIST]

  // 分页列表
  page = async (params: any) => {
    const { keyword, page = 1, size = 20, sort, order, status, occupation } = params || {}

    // 过滤
    const list = orderBy(this.dataList, order, sort).filter((e: any) => {
      let match = true

      if (keyword) {
        match = match && (String(e.name).includes(keyword) || String(e.account).includes(keyword) || String(e.phone).includes(keyword))
      }
      if (status !== undefined && status !== "") {
        match = match && e.status === Number(status)
      }
      if (occupation !== undefined && occupation !== "") {
        match = match && e.occupation === Number(occupation)
      }

      return match
    })

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          list: list.slice((Number(page) - 1) * Number(size), Number(page) * Number(size)),
          pagination: {
            total: list.length,
            page: Number(page),
            size: Number(size),
          },
        })
      }, 300)
    })
  }

  // 更新
  update = async (params: { id: any, [key: string]: any }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = this.dataList.find(e => e.id === params.id)
        if (item) {
          assign(item, params)
        }
        resolve(null)
      }, 300)
    })
  }

  // 新增
  add = async (params: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const id = this.dataList.length + 100 // Simple ID generation
        this.dataList.unshift({
          id,
          createTime: new Date().toISOString().split("T")[0],
          ...params,
        })
        resolve(id)
      }, 300)
    })
  }

  // 详情
  detail = async (params: { id: any }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { id } = params || {}
        resolve(this.dataList.find(e => e.id === Number(id)))
      }, 100)
    })
  }

  // 删除
  delete = async (params: { ids: any[] }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { ids = [] } = params || {}
        this.dataList = this.dataList.filter(e => !ids.includes(e.id))
        resolve(null)
      }, 300)
    })
  }
}
