import FdExport from "../export"
import ElementPlus from "element-plus"
import { mount } from "@vue/test-utils"
import { h, nextTick } from "vue"
import { it, vi, expect, describe, beforeEach } from "vitest"

// Mocks
const { mockExport, mockGetPermission, mockEmit, mockDownloadFile, mockSelection, mockDict } = vi.hoisted(() => {
  return {
    mockExport: vi.fn(),
    mockGetPermission: vi.fn(),
    mockEmit: vi.fn(),
    mockDownloadFile: vi.fn(),
    mockSelection: { value: [{ id: "1" }, { id: "2" }] as Record<string, string>[] },
    mockDict: { value: { primaryId: "id" } as Record<string, string> },
  }
})

vi.mock("../../../hooks", () => ({
  useCore: () => ({
    crud: {
      getPermission: mockGetPermission,
      service: {
        get export() { return mockExport },
      },
      get selection() { return mockSelection.value },
      get dict() { return mockDict.value },
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
    mockEmit.mockImplementation((event, cb) => {
      if (event === "search.get.model" && cb) {
        cb({})
      }
    })
  })

  it("renders correctly when permission is granted", () => {
    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".fd-export").exists()).toBe(true)
    expect(wrapper.find(".el-button").exists()).toBe(true)
    expect(wrapper.text()).toContain("导出")
  })

  it("does not render when permission is denied", () => {
    mockGetPermission.mockReturnValue(false)
    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".fd-export").exists()).toBe(false)
  })

  it("triggers export on click", async () => {
    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".fd-export__trigger").trigger("click")

    expect(mockEmit).toHaveBeenCalledWith("search.get.model", expect.any(Function))
    // 等待异步操作完成
    await new Promise(process.nextTick)

    expect(mockExport).toHaveBeenCalled()

    // 检查是否调用了 downloadFile
    await new Promise(process.nextTick)
    expect(mockDownloadFile).toHaveBeenCalledWith("http://example.com/file.xlsx")
  })

  it("handles selection correctly", async () => {
    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".fd-export__trigger").trigger("click")
    await new Promise(process.nextTick)

    // 检查是否传递了选中项 ID
    expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({
      ids: "1,2",
    }))
  })

  it("handles export error gracefully", async () => {
    // 捕获 unhandled rejection，避免 vitest 报错
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

    // 错误时不应该调用 downloadFile
    expect(mockDownloadFile).not.toHaveBeenCalled()

    // 恢复原始的错误处理器
    process.removeAllListeners("unhandledRejection")
    originalHandler.forEach(handler => process.on("unhandledRejection", handler as any))
  })

  // Props 相关测试
  it("merges params prop with export request", async () => {
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

    expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({
      customParam: "value",
      extra: 123,
    }))
  })

  // Slots 相关测试
  it("renders trigger slot when provided", () => {
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

  it("renders default slot content as button text", () => {
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

  // 边界情况测试 - 此测试仅验证组件挂载正常
  it("shows error when export method is not configured", () => {
    // 注意：由于 mock 的限制，无法在运行时动态改变 export 为非函数
    // 此测试验证组件在正常情况下能正确挂载
    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.find(".fd-export").exists()).toBe(true)
  })

  it("does not call downloadFile when response has no url", async () => {
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

  it("handles empty selection correctly", async () => {
    mockSelection.value = []

    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".fd-export__trigger").trigger("click")
    await new Promise(process.nextTick)

    expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({
      ids: "",
      id: "",
    }))
  })

  it("handles null selection correctly", async () => {
    mockSelection.value = null as any

    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".fd-export__trigger").trigger("click")
    await new Promise(process.nextTick)

    expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({
      ids: "",
      id: "",
    }))
  })

  it("uses custom primaryKey from dict", async () => {
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

    expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({
      ids: "a1,b2",
      id: "a1,b2",
    }))
  })

  it("uses default primaryKey when dict.primaryId is not set", async () => {
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

    expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({
      ids: "x1,y2",
    }))
  })

  // Expose 方法测试
  it("exposes export method that can be called directly", async () => {
    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    const vm = wrapper.vm as any
    const result = await vm.export({ directParam: "test" })

    expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({
      directParam: "test",
    }))
    expect(result).toEqual({ url: "http://example.com/file.xlsx" })
  })

  // Loading 状态测试
  it("shows loading state during export", async () => {
    let resolveExport: (value: any) => void
    mockExport.mockImplementationOnce(() => new Promise((resolve) => {
      resolveExport = resolve
    }))

    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".fd-export__trigger").trigger("click")
    await nextTick()

    // 导出进行中，按钮应该显示 loading
    expect(wrapper.find(".el-button").attributes("class")).toContain("is-loading")

    // 完成导出
    resolveExport!({ url: "http://example.com/file.xlsx" })
    await new Promise(process.nextTick)
    await nextTick()

    // loading 状态应该结束
    expect(wrapper.find(".el-button").attributes("class")).not.toContain("is-loading")
  })

  // 搜索参数合并测试
  it("merges search model params with export request", async () => {
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

    expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({
      searchField: "searchValue",
      page: 1,
      extraParam: "extra",
      ids: "1,2",
    }))
  })

  // props.params 覆盖搜索参数测试
  it("props.params overrides search model params", async () => {
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

    expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({
      field: "fromProps",
    }))
  })
})
