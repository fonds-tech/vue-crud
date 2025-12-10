import FdExport from "../export"
import ElementPlus from "element-plus"
import { mount } from "@vue/test-utils"
import { h, nextTick } from "vue"
import { it, vi, expect, describe, beforeEach } from "vitest"

// Mocks
const { mockExport, mockGetPermission, mockEmit, mockDownloadFile, mockSelection, mockDict, mockServiceOverride } = vi.hoisted(() => {
  return {
    mockExport: vi.fn(),
    mockGetPermission: vi.fn(),
    mockEmit: vi.fn(),
    mockDownloadFile: vi.fn(),
    mockSelection: { value: [{ id: "1" }, { id: "2" }] as Record<string, string>[] },
    mockDict: { value: { primaryId: "id" } as Record<string, string> },
    mockServiceOverride: { value: null as any },
  }
})

vi.mock("../../../hooks", () => ({
  useCore: () => ({
    crud: {
      getPermission: mockGetPermission,
      service: {
        get export() {
          return mockServiceOverride.value !== undefined ? mockServiceOverride.value : mockExport
        },
      },
      get selection() {
        return mockSelection.value
      },
      get dict() {
        return mockDict.value
      },
    },
    mitt: {
      emit: mockEmit,
    },
  }),
}))

vi.mock("../../../utils/file", () => ({
  downloadFile: mockDownloadFile,
}))

describe("fd-export", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPermission.mockReturnValue(true)
    mockExport.mockResolvedValue({ url: "http://example.com/file.xlsx" })
    mockSelection.value = [{ id: "1" }, { id: "2" }]
    mockDict.value = { primaryId: "id" }
    mockServiceOverride.value = undefined
    mockEmit.mockImplementation((event, cb) => {
      if (event === "search.get.model" && cb) {
        cb({})
      }
    })
  })

  it("有权限时正确渲染组件", () => {
    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".fd-export").exists()).toBe(true)
    expect(wrapper.find(".el-button").exists()).toBe(true)
    expect(wrapper.text()).toContain("导出")
  })

  it("无权限时不渲染组件", () => {
    mockGetPermission.mockReturnValue(false)
    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".fd-export").exists()).toBe(false)
  })

  it("点击触发导出", async () => {
    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".fd-export__trigger").trigger("click")

    expect(mockEmit).toHaveBeenCalledWith("search.get.model", expect.any(Function))
    await new Promise(process.nextTick)

    expect(mockExport).toHaveBeenCalled()

    await new Promise(process.nextTick)
    expect(mockDownloadFile).toHaveBeenCalledWith("http://example.com/file.xlsx")
  })

  it("正确处理选中项", async () => {
    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".fd-export__trigger").trigger("click")
    await new Promise(process.nextTick)

    expect(mockExport).toHaveBeenCalledWith(
      expect.objectContaining({
        ids: "1,2",
      }),
    )
  })

  it("优雅处理导出错误", async () => {
    const errorHandler = vi.fn()
    const originalHandler = process.listeners("unhandledRejection")
    process.removeAllListeners("unhandledRejection")
    process.on("unhandledRejection", errorHandler)

    mockExport.mockRejectedValueOnce(new Error("导出失败"))

    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".fd-export__trigger").trigger("click")
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(mockDownloadFile).not.toHaveBeenCalled()

    process.removeAllListeners("unhandledRejection")
    originalHandler.forEach(handler => process.on("unhandledRejection", handler as any))
  })

  it("当 export 方法未配置时抛出错误", async () => {
    mockServiceOverride.value = null

    // 捕获未处理的 promise rejection
    const errorHandler = vi.fn()
    const originalHandler = process.listeners("unhandledRejection")
    process.removeAllListeners("unhandledRejection")
    process.on("unhandledRejection", errorHandler)

    const wrapper = mount(FdExport, {
      global: { plugins: [ElementPlus] },
    })

    await wrapper.find(".fd-export__trigger").trigger("click")
    await new Promise(resolve => setTimeout(resolve, 10))

    // 验证错误被捕获 (因为 click handler 没有 await，所以会作为 unhandled rejection 抛出)
    expect(errorHandler).toHaveBeenCalled()
    const error = errorHandler.mock.calls[0][0]
    expect(error.message).toContain("Crud 未配置 export 方法")

    // 恢复监听器
    process.removeAllListeners("unhandledRejection")
    originalHandler.forEach(handler => process.on("unhandledRejection", handler as any))
  })

  // Props 相关测试
  it("合并 params prop 到导出请求", async () => {
    const wrapper = mount(FdExport, {
      props: {
        params: { customParam: "value", extra: 123 },
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".fd-export__trigger").trigger("click")
    await new Promise(process.nextTick)

    expect(mockExport).toHaveBeenCalledWith(
      expect.objectContaining({
        customParam: "value",
        extra: 123,
      }),
    )
  })

  // 插槽相关测试
  it("渲染 trigger 插槽", () => {
    const wrapper = mount(FdExport, {
      slots: {
        trigger: () => h("button", { class: "custom-trigger" }, "自定义触发器"),
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.find(".custom-trigger").exists()).toBe(true)
    expect(wrapper.text()).toContain("自定义触发器")
  })

  it("渲染 default 插槽内容作为按钮文本", () => {
    const wrapper = mount(FdExport, {
      slots: {
        default: () => "自定义按钮文本",
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.find(".el-button").text()).toBe("自定义按钮文本")
  })

  // 边界情况测试
  it("组件正常挂载", () => {
    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.find(".fd-export").exists()).toBe(true)
  })

  it("响应无 url 时不调用 downloadFile", async () => {
    mockExport.mockResolvedValueOnce({ data: "some data" })

    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".fd-export__trigger").trigger("click")
    await new Promise(process.nextTick)

    expect(mockExport).toHaveBeenCalled()
    expect(mockDownloadFile).not.toHaveBeenCalled()
  })

  it("正确处理空选中项", async () => {
    mockSelection.value = []

    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".fd-export__trigger").trigger("click")
    await new Promise(process.nextTick)

    expect(mockExport).toHaveBeenCalledWith(
      expect.objectContaining({
        ids: "",
        id: "",
      }),
    )
  })

  it("正确处理 null 选中项", async () => {
    mockSelection.value = null as any

    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".fd-export__trigger").trigger("click")
    await new Promise(process.nextTick)

    expect(mockExport).toHaveBeenCalledWith(
      expect.objectContaining({
        ids: "",
        id: "",
      }),
    )
  })

  it("使用自定义 primaryKey", async () => {
    mockDict.value = { primaryId: "customId" }
    mockSelection.value = [{ customId: "a1" }, { customId: "b2" }]

    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await nextTick()
    await wrapper.find(".fd-export__trigger").trigger("click")
    await new Promise(process.nextTick)

    expect(mockExport).toHaveBeenCalledWith(
      expect.objectContaining({
        ids: "a1,b2",
        id: "a1,b2",
      }),
    )
  })

  it("未设置 dict.primaryId 时使用默认值", async () => {
    mockDict.value = {} as any
    mockSelection.value = [{ id: "x1" }, { id: "y2" }]

    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await nextTick()
    await wrapper.find(".fd-export__trigger").trigger("click")
    await new Promise(process.nextTick)

    expect(mockExport).toHaveBeenCalledWith(
      expect.objectContaining({
        ids: "x1,y2",
      }),
    )
  })

  // Expose 方法测试
  it("暴露可直接调用的 export 方法", async () => {
    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    const vm = wrapper.vm as any
    const result = await vm.export({ directParam: "test" })

    expect(mockExport).toHaveBeenCalledWith(
      expect.objectContaining({
        directParam: "test",
      }),
    )
    expect(result).toEqual({ url: "http://example.com/file.xlsx" })
  })

  // Loading 状态测试
  it("导出过程中显示 loading 状态", async () => {
    let resolveExport: (value: any) => void
    mockExport.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveExport = resolve
        }),
    )

    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".fd-export__trigger").trigger("click")
    await nextTick()

    expect(wrapper.find(".el-button").attributes("class")).toContain("is-loading")

    resolveExport!({ url: "http://example.com/file.xlsx" })
    await new Promise(process.nextTick)
    await nextTick()

    expect(wrapper.find(".el-button").attributes("class")).not.toContain("is-loading")
  })

  // 搜索参数合并测试
  it("合并搜索参数到导出请求", async () => {
    mockEmit.mockImplementation((event, cb) => {
      if (event === "search.get.model" && cb) {
        cb({ searchField: "searchValue", page: 1 })
      }
    })

    const wrapper = mount(FdExport, {
      props: {
        params: { extraParam: "extra" },
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".fd-export__trigger").trigger("click")
    await new Promise(process.nextTick)

    expect(mockExport).toHaveBeenCalledWith(
      expect.objectContaining({
        searchField: "searchValue",
        page: 1,
        extraParam: "extra",
        ids: "1,2",
      }),
    )
  })

  // props.params 覆盖搜索参数测试
  it("props.params 覆盖搜索参数", async () => {
    mockEmit.mockImplementation((event, cb) => {
      if (event === "search.get.model" && cb) {
        cb({ field: "fromSearch" })
      }
    })

    const wrapper = mount(FdExport, {
      props: {
        params: { field: "fromProps" },
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".fd-export__trigger").trigger("click")
    await new Promise(process.nextTick)

    expect(mockExport).toHaveBeenCalledWith(
      expect.objectContaining({
        field: "fromProps",
      }),
    )
  })
})
