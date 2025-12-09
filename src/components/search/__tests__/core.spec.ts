import { useSearchCore } from "../core/index"
import { it, vi, expect, describe, beforeEach } from "vitest"

// Mock hooks
const mockCrud = {
  dict: { label: { expand: "Expand", collapse: "Collapse" } },
  params: { size: 20 },
  getParams: vi.fn(() => ({ page: 1, size: 20 })),
  setParams: vi.fn(),
  refresh: vi.fn(),
}
const mockMitt = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
}

vi.mock("@/hooks", () => ({
  useCore: () => ({
    crud: mockCrud,
    mitt: mockMitt,
  }),
}))

describe("useSearchCore", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCrud.refresh.mockResolvedValue("ok")
  })

  it("初始化状态", () => {
    const { loading, collapsed, collapseLabel } = useSearchCore({})
    expect(loading.value).toBe(false)
    expect(collapsed.value).toBe(false)
    expect(collapseLabel.value).toBe("Collapse")
  })

  it("resolvedActions 默认包含 search 和 reset", () => {
    const { resolvedActions } = useSearchCore({})
    expect(resolvedActions.value).toHaveLength(2)
    expect(resolvedActions.value[0].type).toBe("search")
  })

  it("use 方法合并配置", () => {
    const { use, options, collapsed } = useSearchCore({})
    use({
      grid: { collapsed: true },
      action: { items: [{ type: "search" }] },
    })

    expect(options.form.grid!.collapsed).toBe(true)
    expect(collapsed.value).toBe(true)
    expect(options.action.items).toHaveLength(1)
  })

  it("collapse 切换折叠状态", () => {
    const { collapse, collapsed } = useSearchCore({})

    collapse(true)
    expect(collapsed.value).toBe(true)

    collapse()
    expect(collapsed.value).toBe(false)
  })

  it("search 触发 crud.refresh", async () => {
    const { search, formRef } = useSearchCore({})

    // Mock formRef
    formRef.value = {
      model: {},
      submit: (cb: any) => cb({ keyword: "Vue" }, undefined),
      resetFields: vi.fn(),
      bindFields: vi.fn(),
      use: vi.fn(),
      collapse: vi.fn(),
    } as any

    await search({ status: 1 })

    expect(mockCrud.setParams).toHaveBeenCalledWith(expect.objectContaining({
      keyword: "Vue",
      status: 1,
      page: 1,
    }))
    expect(mockCrud.refresh).toHaveBeenCalled()
  })

  it("search 处理校验错误", async () => {
    const { search, formRef } = useSearchCore({})

    formRef.value = {
      submit: (cb: any) => cb({}, { field: "error" }),
    } as any

    await expect(search()).rejects.toEqual({ field: "error" })
    expect(mockCrud.refresh).not.toHaveBeenCalled()
  })

  it("reset 重置表单并刷新", async () => {
    const { reset, formRef } = useSearchCore({})

    const bindFields = vi.fn()
    const resetFields = vi.fn()

    formRef.value = {
      model: {},
      resetFields,
      bindFields,
    } as any

    await reset({ extra: 1 })

    expect(resetFields).toHaveBeenCalled()
    expect(bindFields).toHaveBeenCalledWith({ extra: 1 })
    expect(mockMitt.emit).toHaveBeenCalledWith("table.clearSelection")
    expect(mockCrud.refresh).toHaveBeenCalled()
  })
})
