import FdExport from "../export"
import ElementPlus from "element-plus"
import { mount } from "@vue/test-utils"
import { it, vi, expect, describe, beforeEach } from "vitest"

// Mocks
const { mockExport, mockGetPermission, mockEmit, mockDownloadFile } = vi.hoisted(() => {
  return {
    mockExport: vi.fn(),
    mockGetPermission: vi.fn(),
    mockEmit: vi.fn(),
    mockDownloadFile: vi.fn(),
  }
})

vi.mock("../../../hooks", () => ({
  useCore: () => ({
    crud: {
      getPermission: mockGetPermission,
      service: {
        export: mockExport,
      },
      selection: [{ id: "1" }, { id: "2" }],
      dict: {
        primaryId: "id",
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
})
