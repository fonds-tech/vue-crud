import { clone } from "lodash-es"

interface UpsertRecord {
  id: number
  name: string
  account: string
  avatar: string
  priority: "High" | "Medium" | "Low"
  progress: number
  score: number
  website: string
  status: number
  remark: string
  createTime: string
}

const MOCK_DATA: UpsertRecord[] = [
  {
    id: 1,
    name: "张三",
    account: "user_001",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=张三",
    priority: "High",
    progress: 85,
    score: 4.5,
    website: "https://github.com/fonds-tech/vue-crud",
    status: 1,
    remark: "示例记录 A，含丰富展示字段",
    createTime: "2024-03-10",
  },
  {
    id: 2,
    name: "李四",
    account: "user_002",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=李四",
    priority: "Medium",
    progress: 42,
    score: 3.2,
    website: "https://element-plus.gitee.io",
    status: 0,
    remark: "示例记录 B，包含更多字段",
    createTime: "2024-02-18",
  },
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
        const today = new Date().toISOString().split("T")[0]
        const record: UpsertRecord = {
          id: nextId,
          name: data.name ?? "",
          account: data.account ?? `user_${String(nextId).padStart(3, "0")}`,
          avatar: data.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name || nextId}`,
          priority: data.priority ?? "Medium",
          progress: Number(data.progress ?? 0),
          score: Number(data.score ?? 3.5),
          website: data.website ?? "https://github.com/fonds-tech/vue-crud",
          status: data.status ?? 1,
          remark: data.remark ?? "",
          createTime: data.createTime ?? today,
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
        const current = MOCK_DATA[index]
        MOCK_DATA[index] = {
          ...current,
          ...data,
          // 确保必需字段存在，避免缺失导致表格渲染异常
          name: data.name ?? current.name,
          account: data.account ?? current.account,
          avatar: data.avatar ?? current.avatar,
          priority: data.priority ?? current.priority,
          progress: data.progress !== undefined ? Number(data.progress) : current.progress,
          score: data.score !== undefined ? Number(data.score) : current.score,
          website: data.website ?? current.website,
          status: data.status ?? current.status,
          remark: data.remark ?? current.remark,
          createTime: data.createTime ?? current.createTime,
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
