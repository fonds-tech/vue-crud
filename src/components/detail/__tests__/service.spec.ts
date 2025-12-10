import { ref } from "vue"
import { ElMessage } from "element-plus"
import { createDetailService } from "../core/service"
import { it, vi, expect, describe, beforeEach } from "vitest"

// Mock ElMessage
vi.mock("element-plus", () => ({
  ElMessage: {
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

function createMessageLessError() {
  const error = new Error("mock")
  ;(error as any).message = ""
  return error
}

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
    mockCrud.dict = { primaryId: "id", api: { detail: "detail" } }
    mockCrud.service = { detail: vi.fn() }
    context = {
      crud: mockCrud,
      options: {},
      data: ref({}),
      paramsCache: ref({}),
      loading: ref(false),
      visible: ref(false),
      setData: vi.fn(data => (context.data.value = data)),
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

  it("detail 非对象时提示警告并保持关闭", async () => {
    await service.detail("invalid" as any)
    expect((ElMessage as any).warning).toHaveBeenCalledWith("无效的详情数据")
    expect(context.visible.value).toBe(false)
  })

  it("detail 缺少主键时提示警告并不打开", async () => {
    await service.detail({ name: "No id" } as any)
    expect((ElMessage as any).warning).toHaveBeenCalledWith("缺少主键字段 id")
    expect(context.visible.value).toBe(false)
  })

  it("close 重置状态", () => {
    context.visible.value = true
    service.close()
    expect(context.visible.value).toBe(false)
  })

  it("service 缺失 detail 方法时提示错误并拒绝", async () => {
    context.crud.service = {}
    await expect(service.detail({ id: 1 })).rejects.toThrow("未在 CRUD service 中找到 detail 方法")
    expect(context.loading.value).toBe(false)
  })

  it("onDetail 抛错时提示错误并重置 loading", async () => {
    context.options.onDetail = () => {
      throw new Error("hook error")
    }
    await expect(service.detail({ id: 1 })).rejects.toThrow("hook error")
    expect(context.loading.value).toBe(false)
  })

  it("onDetail 异步 reject 时提示错误并重置 loading", async () => {
    context.options.onDetail = () => Promise.reject(new Error("async hook error"))
    await expect(service.detail({ id: 1 })).rejects.toThrow("async hook error")
    expect(context.loading.value).toBe(false)
  })

  it("refresh 无缓存参数时直接返回并清理 loading", async () => {
    context.loading.value = true
    await service.refresh()
    expect(context.loading.value).toBe(false)
  })

  it("runDetailFlow 在无参数时 finalizeIfIdle 清理 loading", async () => {
    context.loading.value = true
    await service.runDetailFlow({}, {})
    expect(context.loading.value).toBe(false)
  })

  it("refresh 合并缓存参数与新增参数", async () => {
    mockCrud.service.detail.mockResolvedValue({ id: 1 })
    await service.detail({ id: 1 })
    mockCrud.service.detail.mockClear()
    await service.refresh({ extra: true })
    expect(mockCrud.service.detail).toHaveBeenCalledWith({ id: 1, extra: true })
  })

  it("onDetail 未调用 next/done 时 finalizeIfIdle 仍清理 loading", async () => {
    context.options.onDetail = vi.fn()
    context.loading.value = true
    await service.detail({ id: 1 })
    expect(context.loading.value).toBe(false)
  })

  it("自定义 api 名称时按 dict.api.detail 调用", async () => {
    context.crud.dict = { api: { detail: "getInfo" } }
    context.crud.service.getInfo = vi.fn().mockResolvedValue({ id: 2 })
    await service.detail({ id: 2 })
    expect(context.crud.service.getInfo).toHaveBeenCalledWith({ id: 2 })
  })

  it("dict.api.detail 为空时回退默认 detail 名称", async () => {
    context.crud.dict = { api: {} }
    context.crud.service.detail = vi.fn().mockResolvedValue({ id: 3 })
    await service.detail({ id: 3 })
    expect(context.crud.service.detail).toHaveBeenCalledWith({ id: 3 })
  })

  it("过期请求异常不提示且不覆盖最新数据", async () => {
    const firstReject: any = { reject: () => {} }
    const secondResolve: any = { resolve: () => {} }
    const detailMock = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((_, rej) => {
            firstReject.reject = rej
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((res) => {
            secondResolve.resolve = res
          }),
      )
    context.crud.service.detail = detailMock

    const first = service.detail({ id: 1 })
    const second = service.refresh({ extra: 1 })
    secondResolve.resolve({ id: 1, name: "new" })
    await second
    firstReject.reject(new Error("stale"))
    await expect(first).rejects.toThrow("stale")
    expect((ElMessage as any).error).not.toHaveBeenCalled()
    expect(context.data.value).toEqual({ id: 1, name: "new" })
  })

  it("并发刷新时旧请求的结果不会落地", async () => {
    const firstResolve: any = { resolve: () => {} }
    const secondResolve: any = { resolve: () => {} }
    const detailMock = vi
      .fn()
      .mockImplementationOnce(() => new Promise(res => (firstResolve.resolve = res)))
      .mockImplementationOnce(() => new Promise(res => (secondResolve.resolve = res)))
    context.crud.service.detail = detailMock

    const first = service.detail({ id: 1 })
    const second = service.refresh({ extra: 1 })

    secondResolve.resolve({ id: 1, name: "second" })
    await second
    firstResolve.resolve({ id: 1, name: "first" })
    await first

    expect(detailMock).toHaveBeenCalledTimes(2)
    expect(context.data.value).toEqual({ id: 1, name: "second" })
  })

  it("onDetail reject 时若 token 已过期不提示错误", async () => {
    let rejectFn: (error: any) => void = () => {}
    context.options.onDetail = vi.fn((row) => {
      if (row.id === 1) {
        return new Promise((_resolve, reject) => {
          rejectFn = reject
        })
      }
      return Promise.resolve()
    })

    const first = service.runDetailFlow({ id: 1 })
    const second = service.runDetailFlow({ id: 2 })

    rejectFn(new Error("late error"))

    await expect(first).rejects.toThrow("late error")
    await second
    expect((ElMessage as any).error).not.toHaveBeenCalled()
  })

  it("onDetail 同步抛错但 token 已过期时跳过错误提示", async () => {
    mockCrud.service.detail.mockResolvedValue({ id: 99 })
    context.paramsCache.value = { id: 99 }
    let refreshPromise: Promise<any> | undefined

    context.options.onDetail = vi.fn(() => {
      context.options.onDetail = undefined
      refreshPromise = service.refresh({ extra: true })
      throw new Error("sync expired")
    })

    const first = service.runDetailFlow({ id: 1 }, { id: 1 })

    await expect(first).rejects.toThrow("sync expired")
    await refreshPromise
    expect((ElMessage as any).error).not.toHaveBeenCalled()
  })

  it("service 缺失但 token 已过期时跳过 loading 重置分支", async () => {
    context.paramsCache.value = { id: 1 }
    const fallbackDetail = vi.fn().mockResolvedValue({ id: 1 })
    let refreshPromise: Promise<any> | undefined
    Object.defineProperty(context.crud.service, "detail", {
      configurable: true,
      get() {
        Object.defineProperty(context.crud.service, "detail", { value: fallbackDetail, configurable: true, writable: true })
        refreshPromise = service.refresh({ extra: true })
        return undefined
      },
    })

    await expect(service.detail({ id: 1 })).rejects.toThrow("未在 CRUD service 中找到 detail 方法")
    await refreshPromise
  })

  it("detail 接口返回 undefined 时使用空对象落地", async () => {
    mockCrud.service.detail.mockResolvedValue(undefined)
    await service.detail({ id: 1 })
    expect(context.data.value).toEqual({})
  })

  it("detail 接口错误未带 message 时使用默认提示", async () => {
    mockCrud.service.detail.mockRejectedValue(createMessageLessError())
    await expect(service.detail({ id: 1 })).rejects.toBeDefined()
    expect((ElMessage as any).error).toHaveBeenCalledWith("详情查询失败")
  })

  it("onDetail reject 未带 message 时使用默认提示", async () => {
    context.options.onDetail = () => Promise.reject(createMessageLessError())
    await expect(service.detail({ id: 1 })).rejects.toBeDefined()
    expect((ElMessage as any).error).toHaveBeenCalledWith("详情查询失败")
  })

  it("onDetail 同步抛出空对象时使用默认提示", async () => {
    context.options.onDetail = () => {
      throw createMessageLessError()
    }
    await expect(service.detail({ id: 1 })).rejects.toBeDefined()
    expect((ElMessage as any).error).toHaveBeenCalledWith("详情查询失败")
  })
})
