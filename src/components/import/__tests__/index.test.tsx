import FdImport from "../import"
import ElementPlus from "element-plus"
import { mount } from "@vue/test-utils"
import { it, vi, expect, describe, beforeEach } from "vitest"

// Mocks
const { mockImport, mockGetPermission, mockRefresh } = vi.hoisted(() => {
  return {
    mockImport: vi.fn(),
    mockGetPermission: vi.fn(),
    mockRefresh: vi.fn(),
  }
})

vi.mock("../../../hooks", () => ({
  useCore: () => ({
    crud: {
      getPermission: mockGetPermission,
      service: {
        import: mockImport,
      },
      selection: [{ id: "1" }, { id: "2" }],
      dict: {
        primaryId: "id",
      },
      refresh: mockRefresh,
    },
  }),
}))

describe("fd-import", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPermission.mockReturnValue(true)
    mockImport.mockResolvedValue({ success: true, count: 10 })
  })

  it("renders correctly when permission is granted", () => {
    const wrapper = mount(FdImport, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".fd-import").exists()).toBe(true)
    expect(wrapper.find(".el-button").exists()).toBe(true)
    expect(wrapper.text()).toContain("导入")
  })

  it("does not render when permission is denied", () => {
    mockGetPermission.mockReturnValue(false)
    const wrapper = mount(FdImport, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".fd-import").exists()).toBe(false)
  })

  it("renders template download button when templateUrl is provided", () => {
    const wrapper = mount(FdImport, {
      props: {
        templateUrl: "http://example.com/template.xlsx",
      },
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".fd-import__template").exists()).toBe(true)
    expect(wrapper.text()).toContain("下载模板")
  })

  it("does not render template button when templateUrl is empty", () => {
    const wrapper = mount(FdImport, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".fd-import__template").exists()).toBe(false)
  })

  it("validates file type correctly", async () => {
    const wrapper = mount(FdImport, {
      props: {
        accept: ".xlsx,.csv",
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    const vm = wrapper.vm as any
    const invalidFile = new File(["content"], "test.txt", { type: "text/plain" })

    // 调用 exposed 的 import 方法
    await vm.import(invalidFile)

    // 不应该调用导入 API
    expect(mockImport).not.toHaveBeenCalled()
  })

  it("validates file size correctly", async () => {
    const wrapper = mount(FdImport, {
      props: {
        maxSize: 0.001, // 约 1KB
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    const vm = wrapper.vm as any
    // 创建一个超过限制大小的文件
    const largeContent = Array.from({ length: 2000 }, () => "a").join("")
    const largeFile = new File([largeContent], "test.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    await vm.import(largeFile)

    // 不应该调用导入 API
    expect(mockImport).not.toHaveBeenCalled()
  })

  it("calls import API with correct FormData", async () => {
    const wrapper = mount(FdImport, {
      props: {
        params: { type: "user" },
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    const vm = wrapper.vm as any
    const file = new File(["content"], "test.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    await vm.import(file)

    // 检查是否调用了导入 API
    expect(mockImport).toHaveBeenCalledTimes(1)

    // 检查 FormData 参数
    const formData = mockImport.mock.calls[0][0] as FormData
    expect(formData.get("file")).toBe(file)
    expect(formData.get("type")).toBe("user")
    expect(formData.get("ids")).toBe("1,2")
  })

  it("refreshes list after successful import", async () => {
    const wrapper = mount(FdImport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    const vm = wrapper.vm as any
    const file = new File(["content"], "test.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    await vm.import(file)

    // 检查是否刷新了列表
    expect(mockRefresh).toHaveBeenCalled()
  })
})
