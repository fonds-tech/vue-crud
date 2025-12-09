import { ref } from "vue"
import { createDetailService } from "../core/service"
import { it, vi, expect, describe, beforeEach } from "vitest"

// Mock ElMessage
vi.mock("element-plus", () => ({
  ElMessage: {
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

describe("createDetailService", () => {
  const mockCrud = {
    dict: { primaryId: "id", api: { detail: "detail" } },
    service: {
      detail: vi.fn(),
    },
  }

  let service: any
  let context: any

  beforeEach(() => {
    vi.clearAllMocks()
    context = {
      crud: mockCrud,
      options: {},
      data: ref({}),
      paramsCache: ref({}),
      loading: ref(false),
      visible: ref(false),
      setData: vi.fn(data => context.data.value = data),
    }
    service = createDetailService(context)
  })

  it("detail 打开详情并获取数据", async () => {
    mockCrud.service.detail.mockResolvedValue({ id: 1, name: "Test" })

    await service.detail({ id: 1 })

    expect(context.visible.value).toBe(true)
    expect(context.loading.value).toBe(false) // 结束后
    expect(context.data.value).toEqual({ id: 1, name: "Test" })
    // 服务调用
    expect(mockCrud.service.detail).toHaveBeenCalledWith({ id: 1 })
  })

  it("detail 缺少主键警告", async () => {
    await service.detail({ name: "No ID" })
    // 不应该调用服务
    expect(mockCrud.service.detail).not.toHaveBeenCalled()
    expect(context.visible.value).toBe(false)
  })

  it("refresh 使用缓存参数重新请求", async () => {
    // 先通过 detail 设置缓存
    mockCrud.service.detail.mockResolvedValue({ id: 1 })
    await service.detail({ id: 1 })

    // 再次调用 refresh
    await service.refresh()

    expect(mockCrud.service.detail).toHaveBeenCalledTimes(2)
  })

  it("handle service error", async () => {
    mockCrud.service.detail.mockRejectedValue(new Error("API Error"))

    await expect(service.detail({ id: 1 })).rejects.toThrow("API Error")

    expect(context.loading.value).toBe(false)
  })

  it("自定义 onDetail hook", async () => {
    context.options.onDetail = vi.fn((_row, { done }) => {
      done({ id: 999, custom: true })
    })

    await service.detail({ id: 1 })

    expect(context.options.onDetail).toHaveBeenCalled()
    expect(mockCrud.service.detail).not.toHaveBeenCalled() // 拦截了默认请求
    expect(context.data.value).toEqual({ id: 999, custom: true })
  })

  it("close 重置状态", () => {
    context.visible.value = true
    service.close()
    expect(context.visible.value).toBe(false)
  })
})
