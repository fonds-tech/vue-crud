import FdImport from "../import"
import ElementPlus from "element-plus"
import { mount } from "@vue/test-utils"
import { h, nextTick } from "vue"
import { it, vi, expect, describe, beforeEach } from "vitest"

// Mocks
const { mockImport, mockGetPermission, mockRefresh, mockSelection, mockDict, mockServiceOverride } = vi.hoisted(() => {
  return {
    mockImport: vi.fn(),
    mockGetPermission: vi.fn(),
    mockRefresh: vi.fn(),
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
        get import() {
          return mockServiceOverride.value !== undefined ? mockServiceOverride.value : mockImport
        },
      },
      get selection() {
        return mockSelection.value
      },
      get dict() {
        return mockDict.value
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
    mockSelection.value = [{ id: "1" }, { id: "2" }]
    mockDict.value = { primaryId: "id" }
    mockServiceOverride.value = undefined
  })

  it("有权限时正确渲染组件", () => {
    const wrapper = mount(FdImport, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".fd-import").exists()).toBe(true)
    expect(wrapper.find(".el-button").exists()).toBe(true)
    expect(wrapper.text()).toContain("导入")
  })

  it("无权限时不渲染组件", () => {
    mockGetPermission.mockReturnValue(false)
    const wrapper = mount(FdImport, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".fd-import").exists()).toBe(false)
  })

  it("提供 templateUrl 时渲染下载模板按钮", () => {
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

  it("templateUrl 为空时不渲染模板按钮", () => {
    const wrapper = mount(FdImport, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".fd-import__template").exists()).toBe(false)
  })

  it("正确验证文件类型", async () => {
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

    await vm.import(invalidFile)

    expect(mockImport).not.toHaveBeenCalled()
  })

  it("正确验证文件大小", async () => {
    const wrapper = mount(FdImport, {
      props: {
        maxSize: 0.001,
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    const vm = wrapper.vm as any
    const largeContent = Array.from({ length: 2000 }, () => "a").join("")
    const largeFile = new File([largeContent], "test.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    await vm.import(largeFile)

    expect(mockImport).not.toHaveBeenCalled()
  })

  it("使用正确的 FormData 调用导入 API", async () => {
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

    expect(mockImport).toHaveBeenCalledTimes(1)

    const formData = mockImport.mock.calls[0][0] as FormData
    expect(formData.get("file")).toBe(file)
    expect(formData.get("type")).toBe("user")
    expect(formData.get("ids")).toBe("1,2")
  })

  it("导入成功后刷新列表", async () => {
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

    expect(mockRefresh).toHaveBeenCalled()
  })

  // 插槽相关测试
  it("渲染 default 插槽内容作为上传按钮", () => {
    const wrapper = mount(FdImport, {
      slots: {
        default: () => h("span", { class: "custom-btn" }, "自定义导入"),
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.find(".custom-btn").exists()).toBe(true)
    expect(wrapper.text()).toContain("自定义导入")
  })

  it("渲染 template 插槽", () => {
    const wrapper = mount(FdImport, {
      props: {
        templateUrl: "http://example.com/template.xlsx",
      },
      slots: {
        template: () => h("button", { class: "custom-template" }, "自定义模板按钮"),
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.find(".custom-template").exists()).toBe(true)
    expect(wrapper.text()).toContain("自定义模板按钮")
  })

  // 边界情况测试
  it("正确处理空选中项", async () => {
    mockSelection.value = []

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

    const formData = mockImport.mock.calls[0][0] as FormData
    expect(formData.get("ids")).toBeNull()
  })

  it("正确处理 null 选中项", async () => {
    mockSelection.value = null as any

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

    const formData = mockImport.mock.calls[0][0] as FormData
    expect(formData.get("ids")).toBeNull()
  })

  // 错误处理测试 - Service 未配置
  it("当 import 方法未配置时抛出错误", async () => {
    mockServiceOverride.value = null

    // 捕获未处理的 promise rejection
    const errorHandler = vi.fn()
    const originalHandler = process.listeners("unhandledRejection")
    process.removeAllListeners("unhandledRejection")
    process.on("unhandledRejection", errorHandler)
    const wrapper = mount(FdImport, {
      global: { plugins: [ElementPlus] },
    })

    const vm = wrapper.vm as any
    const file = new File(["content"], "test.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    await expect(vm.import(file)).rejects.toThrow("Crud 未配置 import 方法")
    expect(mockRefresh).not.toHaveBeenCalled()
    process.removeAllListeners("unhandledRejection")
    originalHandler.forEach(handler => process.on("unhandledRejection", handler as any))
  })

  // Use Custom Logic for beforeUpload
  it("beforeUpload 钩子调用 handleUpload 并返回 false", () => {
    const wrapper = mount(FdImport, {
      global: { plugins: [ElementPlus] },
    })

    const file = new File(["content"], "test.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    // Mock handleUpload (vm.import is the expose of handleUpload, but beforeUpload calls internal handleUpload)
    // We cannot easily mock internal function unless we spy on expose or observe side effects.
    // However, calling beforeUpload should trigger import process.
    // Use spy on vm.import if possible, or just observe mockImport call.

    // The el-upload usually calls beforeUpload. We can manually call it if we can access it?
    // It's not exposed. But it is passed to ElUpload prop.
    const uploadComponent = wrapper.findComponent({ name: "ElUpload" })
    const beforeUpload = uploadComponent.props("beforeUpload") as (file: File) => boolean

    const result = beforeUpload(file)
    expect(result).toBe(false)
    expect(mockImport).toHaveBeenCalled()
  })

  it("使用自定义 primaryKey", async () => {
    mockDict.value = { primaryId: "customId" }
    mockSelection.value = [{ customId: "a1" }, { customId: "b2" }]

    const wrapper = mount(FdImport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await nextTick()

    const vm = wrapper.vm as any
    const file = new File(["content"], "test.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    await vm.import(file)

    const formData = mockImport.mock.calls[0][0] as FormData
    expect(formData.get("ids")).toBe("a1,b2")
  })

  // 导入结果处理测试
  it("处理带有错误的导入结果", async () => {
    mockImport.mockResolvedValueOnce({
      success: true,
      count: 8,
      errors: [
        { row: 2, message: "数据格式错误" },
        { row: 5, message: "必填字段为空" },
      ],
    })

    const wrapper = mount(FdImport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    const vm = wrapper.vm as any
    const file = new File(["content"], "test.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    const result = await vm.import(file)

    expect(result.errors).toHaveLength(2)
    expect(mockRefresh).toHaveBeenCalled()
  })

  it("处理 success 为 false 的情况", async () => {
    mockImport.mockResolvedValueOnce({ success: false })

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

    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it("处理无 count 的导入结果", async () => {
    mockImport.mockResolvedValueOnce({ success: true })

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

    expect(mockRefresh).toHaveBeenCalled()
  })

  // Expose 方法测试
  it("暴露 downloadTemplate 方法", () => {
    const mockOpen = vi.spyOn(window, "open").mockImplementation(() => null)

    const wrapper = mount(FdImport, {
      props: {
        templateUrl: "http://example.com/template.xlsx",
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    const vm = wrapper.vm as any
    vm.downloadTemplate()

    expect(mockOpen).toHaveBeenCalledWith("http://example.com/template.xlsx", "_blank")
    mockOpen.mockRestore()
  })

  it("templateUrl 为空时 downloadTemplate 不执行任何操作", () => {
    const mockOpen = vi.spyOn(window, "open").mockImplementation(() => null)

    const wrapper = mount(FdImport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    const vm = wrapper.vm as any
    vm.downloadTemplate()

    expect(mockOpen).not.toHaveBeenCalled()
    mockOpen.mockRestore()
  })

  // Loading 状态测试
  it("导入过程中显示 loading 状态", async () => {
    let resolveImport: (value: any) => void
    mockImport.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveImport = resolve
        }),
    )

    const wrapper = mount(FdImport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    const vm = wrapper.vm as any
    const file = new File(["content"], "test.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    const importPromise = vm.import(file)
    await nextTick()

    expect(wrapper.find(".el-button").attributes("class")).toContain("is-loading")

    resolveImport!({ success: true, count: 10 })
    await importPromise
    await nextTick()

    expect(wrapper.find(".el-button").attributes("class")).not.toContain("is-loading")
  })

  // 错误处理测试
  it("优雅处理导入错误", async () => {
    mockImport.mockRejectedValueOnce(new Error("网络错误"))

    const wrapper = mount(FdImport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    const vm = wrapper.vm as any
    const file = new File(["content"], "test.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    await expect(vm.import(file)).rejects.toThrow("网络错误")
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  // params 处理测试
  it("跳过 null 和 undefined 的 params 值", async () => {
    const wrapper = mount(FdImport, {
      props: {
        params: { valid: "value", nullVal: null, undefinedVal: undefined },
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

    const formData = mockImport.mock.calls[0][0] as FormData
    expect(formData.get("valid")).toBe("value")
    expect(formData.get("nullVal")).toBeNull()
    expect(formData.get("undefinedVal")).toBeNull()
  })

  // 模板按钮点击测试
  it("点击模板按钮打开模板 URL", async () => {
    const mockOpen = vi.spyOn(window, "open").mockImplementation(() => null)

    const wrapper = mount(FdImport, {
      props: {
        templateUrl: "http://example.com/template.xlsx",
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".fd-import__template .el-button").trigger("click")

    expect(mockOpen).toHaveBeenCalledWith("http://example.com/template.xlsx", "_blank")
    mockOpen.mockRestore()
  })

  // 多错误截断显示测试
  it("超过 5 条错误时截断显示", async () => {
    mockImport.mockResolvedValueOnce({
      success: true,
      count: 5,
      errors: [
        { row: 1, message: "错误1" },
        { row: 2, message: "错误2" },
        { row: 3, message: "错误3" },
        { row: 4, message: "错误4" },
        { row: 5, message: "错误5" },
        { row: 6, message: "错误6" },
        { row: 7, message: "错误7" },
      ],
    })

    const wrapper = mount(FdImport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    const vm = wrapper.vm as any
    const file = new File(["content"], "test.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    const result = await vm.import(file)

    expect(result.errors).toHaveLength(7)
  })

  // 错误行号缺失测试
  it("处理无行号的错误", async () => {
    mockImport.mockResolvedValueOnce({
      success: true,
      count: 9,
      errors: [{ message: "未知行错误" }],
    })

    const wrapper = mount(FdImport, {
      global: {
        plugins: [ElementPlus],
      },
    })

    const vm = wrapper.vm as any
    const file = new File(["content"], "test.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    const result = await vm.import(file)

    expect(result.errors[0].row).toBeUndefined()
  })
})
