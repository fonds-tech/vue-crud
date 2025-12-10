import { clone } from "lodash-es"

const NAMES = ["张三", "李四", "王五", "赵六", "孙七", "Alice", "Bob", "Charlie", "David", "Eva"]
const DEPARTMENTS = ["研发中心", "产品部", "市场部", "运营部", "人事部"]
const PRIORITIES = ["High", "Medium", "Low"]
const TAGS_POOL = ["Vue3", "React", "TypeScript", "Node.js", "Go", "Rust", "Python"]

function getRandom(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomTags() {
  const count = Math.floor(Math.random() * 3) + 1
  const tags = new Set<string>()
  while (tags.size < count) {
    tags.add(getRandom(TAGS_POOL))
  }
  return Array.from(tags)
}

const MOCK_DATA = Array.from({ length: 50 }).map((_, index) => {
  const id = index + 1
  const name = index < 10 ? NAMES[index] : `${getRandom(NAMES)} ${id}`

  return {
    id,
    name,
    account: `user_${String(id).padStart(3, "0")}`,
    status: Math.random() > 0.3 ? 1 : 0, // 1: 启用, 0: 禁用
    createTime: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split("T")[0],
    remark: `这是 ${name} 的备注信息，包含一些随机生成的详细描述...`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    website: "https://github.com/fonds-tech/vue-crud",
    score: (Math.random() * 5).toFixed(1),
    progress: Math.floor(Math.random() * 100),
    tags: getRandomTags(),
    department: getRandom(DEPARTMENTS),
    manager: getRandom(NAMES),
    priority: getRandom(PRIORITIES),
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    budget: `${Math.floor(Math.random() * 500 + 50)}W`,
    description: "本年度核心研发计划，旨在提升系统稳定性与用户体验，引入 AI 辅助编码工具，优化 CI/CD 流程。",
    auditUser: getRandom(NAMES),
    auditTime: "2023-12-20",
    // 配合 DynamicDetail 演示
    type: Math.random() > 0.5 ? "text" : "image",
    content: "这是一段根据类型动态显示的文本内容...",
    imageUrl: "https://element-plus.org/images/element-plus-logo.svg",
    showExtra: Math.random() > 0.5,
    extraInfo: "动态显示的额外敏感信息",
  }
})

export class DetailMockService {
  page(params: Record<string, any>) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let list = clone(MOCK_DATA)

        // 模拟搜索
        if (params.keyword) {
          const kw = params.keyword.toLowerCase()
          list = list.filter((item: any) => item.name.toLowerCase().includes(kw) || item.account.toLowerCase().includes(kw))
        }

        // 模拟状态过滤
        if (params.status !== undefined && params.status !== "") {
          list = list.filter((item: any) => item.status === Number(params.status))
        }

        // 模拟排序
        list.sort((a: any, b: any) => b.id - a.id)

        const { page = 1, size = 10 } = params
        const start = (page - 1) * size
        const end = start + size
        const pageList = list.slice(start, end)

        resolve({
          list: pageList,
          total: list.length,
          pagination: {
            page,
            size,
            total: list.length,
          },
        })
      }, 300)
    })
  }

  detail(params: Record<string, any>) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const id = Number(params.id)
        const item = MOCK_DATA.find(d => d.id === id)

        if (item) {
          resolve(clone(item))
        }
        else {
          reject(new Error("未找到该记录"))
        }
      }, 200)
    })
  }

  add(data: Record<string, any>) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = Math.max(...MOCK_DATA.map(d => d.id), 0) + 1
        const newItem = {
          ...data,
          id: newId,
          createTime: new Date().toISOString().split("T")[0],
          // 补充默认字段防止空数据
          avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newId}`,
          progress: 0,
          status: data.status ?? 1,
        } as any

        MOCK_DATA.unshift(newItem)
        resolve(newItem)
      }, 400)
    })
  }

  update(data: Record<string, any>) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_DATA.findIndex(d => d.id === Number(data.id))
        if (index > -1) {
          MOCK_DATA[index] = { ...MOCK_DATA[index], ...data }
          resolve(MOCK_DATA[index])
        }
        else {
          reject(new Error("更新失败：记录不存在"))
        }
      }, 400)
    })
  }

  delete(data: Record<string, any>) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ids = Array.isArray(data) ? data.map(d => Number(d.id)) : [Number(data.id)]
        for (let i = MOCK_DATA.length - 1; i >= 0; i--) {
          if (ids.includes(MOCK_DATA[i].id)) {
            MOCK_DATA.splice(i, 1)
          }
        }
        resolve(data)
      }, 300)
    })
  }
}
