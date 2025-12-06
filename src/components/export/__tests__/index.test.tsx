import FdExport from "../index.vue"
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
    // Because mockEmit executes the callback, exportData should be called
    // which calls crud.service.export
    // We need to wait for promises to resolve
    await new Promise(process.nextTick)

    expect(mockExport).toHaveBeenCalled()

    // Check if downloadFile is called (since we mocked response with url)
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

    // Check if ids are passed in params
    expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({
      ids: "1,2",
    }))
  })

  it("handles polling for large exports (status === 0)", async () => {
    // First call returns status 0 (processing)
    // Second call returns url
    mockExport
      .mockResolvedValueOnce({ status: 0, page: 1, fileName: "test.xlsx" })
      .mockResolvedValueOnce({ url: "http://example.com/final.xlsx" })

    const wrapper = mount(FdExport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".fd-export__trigger").trigger("click")

    // Wait for recursive calls to complete
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(mockExport).toHaveBeenCalledTimes(2)
    expect(mockDownloadFile).toHaveBeenCalledWith("http://example.com/final.xlsx")
  })
})
