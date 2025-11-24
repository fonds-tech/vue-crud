const MOCK_DATA = Array.from({ length: 20 }).map((_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  status: index % 2,
  createTime: `2023-01-${String(index + 1).padStart(2, "0")}`,
  type: index % 3,
}))

export class SearchMockService {
  page(params: Record<string, any>) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let list = [...MOCK_DATA]
        if (params.keyword) {
          list = list.filter(item => item.name.includes(params.keyword))
        }
        if (params.status !== undefined && params.status !== "") {
          list = list.filter(item => item.status === Number(params.status))
        }
        if (params.createTime && params.createTime.length === 2) {
          const [start, end] = params.createTime
          list = list.filter(item => item.createTime >= start && item.createTime <= end)
        }

        resolve({
          list,
          total: list.length,
          pagination: {
            page: params.page || 1,
            size: params.size || 20,
            total: list.length,
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
