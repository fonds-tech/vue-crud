const MOCK_DATA = Array.from({ length: 100 }).map((_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  account: `user_${index + 1}`,
  status: index % 2,
  role: index % 4,
  department: `Dept ${index % 5}`,
  email: `user${index + 1}@example.com`,
  phone: `13800138${String(index).padStart(3, "0")}`,
  address: `City ${index % 10} Street ${index % 20}`,
  createTime: `2023-01-${String((index % 30) + 1).padStart(2, "0")}`,
  amount: (Math.random() * 10000).toFixed(2),
  progress: Math.floor(Math.random() * 100),
}))

const TREE_DATA = [
  {
    id: 1,
    name: "总部",
    leader: "CEO",
    count: 1000,
    children: [
      {
        id: 11,
        name: "研发中心",
        leader: "CTO",
        count: 400,
        children: [
          { id: 111, name: "前端组", leader: "FE Lead", count: 50 },
          { id: 112, name: "后端组", leader: "BE Lead", count: 80 },
        ],
      },
      {
        id: 12,
        name: "运营中心",
        leader: "COO",
        count: 300,
        children: [
          { id: 121, name: "市场部", leader: "Marketing Lead", count: 100 },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "分公司",
    leader: "VP",
    count: 500,
    children: [
      { id: 21, name: "销售部", leader: "Sales Lead", count: 200 },
    ],
  },
]

export class TableMockService {
  page(params: Record<string, any>) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let list = [...MOCK_DATA]
        if (params.keyword) {
          list = list.filter(item =>
            item.name.includes(params.keyword)
            || item.account.includes(params.keyword)
            || item.address.includes(params.keyword),
          )
        }
        if (params.status !== undefined && params.status !== "") {
          list = list.filter(item => item.status === Number(params.status))
        }

        // Sort logic (mock)
        if (params.sortProp && params.sortOrder) {
          const { sortProp, sortOrder } = params
          list.sort((a: any, b: any) => {
            const valA = a[sortProp]
            const valB = b[sortProp]
            if (valA === valB) return 0
            const result = valA > valB ? 1 : -1
            return sortOrder === "ascending" ? result : -result
          })
        }

        const page = params.page || 1
        const size = params.size || 10
        const start = (page - 1) * size
        const end = start + size
        const paginatedList = list.slice(start, end)

        resolve({
          list: paginatedList,
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

  treePage() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          list: TREE_DATA,
          total: TREE_DATA.length,
          pagination: {
            page: 1,
            size: 100,
            total: TREE_DATA.length,
          },
        })
      }, 300)
    })
  }

  add() { return Promise.resolve() }
  update() { return Promise.resolve() }
  delete() { return Promise.resolve() }
  info() { return Promise.resolve() }
}
