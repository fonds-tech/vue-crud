import { clone } from "lodash-es"

interface UpsertRecord { id: number, name: string, status: number, remark: string }

const MOCK_DATA: UpsertRecord[] = [
  { id: 1, name: "张三", status: 1, remark: "示例记录 A" },
  { id: 2, name: "李四", status: 0, remark: "示例记录 B" },
]

export class UpsertMockService {
  page(params: Record<string, any>) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, size = 20 } = params
        resolve({
          list: clone(MOCK_DATA),
          pagination: {
            page,
            size,
            total: MOCK_DATA.length,
          },
        })
      }, 200)
    })
  }

  add(data: Record<string, any>) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nextId = Math.max(...MOCK_DATA.map(d => d.id), 0) + 1
        const record: UpsertRecord = {
          id: nextId,
          name: data.name ?? "",
          status: data.status ?? 1,
          remark: data.remark ?? "",
        }
        MOCK_DATA.unshift(record)
        resolve(record)
      }, 200)
    })
  }

  update(data: Record<string, any>) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_DATA.findIndex(item => item.id === Number(data.id))
        if (index === -1) {
          reject(new Error("未找到记录"))
          return
        }
        MOCK_DATA[index] = {
          ...MOCK_DATA[index],
          ...data,
          // 确保必需字段存在
          name: data.name ?? MOCK_DATA[index].name,
          status: data.status ?? MOCK_DATA[index].status,
          remark: data.remark ?? MOCK_DATA[index].remark,
        }
        resolve(MOCK_DATA[index])
      }, 200)
    })
  }

  detail(params: Record<string, any>) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const id = Number(params.id)
        const item = MOCK_DATA.find(record => record.id === id)
        if (!item) {
          reject(new Error("未找到记录"))
          return
        }
        resolve(clone(item))
      }, 150)
    })
  }
}
