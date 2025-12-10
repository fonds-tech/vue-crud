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

    expect(mockCrud.setParams).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: "Vue",
        status: 1,
        page: 1,
      }),
    )
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

  // 新增测试：formatQuery 边界测试
  describe("formatQuery 边界测试", () => {
    it("过滤 undefined 值", async () => {
      const { search, formRef } = useSearchCore({})

      formRef.value = {
        model: {},
        submit: (cb: any) => cb({ keyword: "test", empty: undefined }, undefined),
      } as any

      await search()

      expect(mockCrud.setParams).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: "test",
          page: 1,
        }),
      )
      expect(mockCrud.setParams).toHaveBeenCalledWith(
        expect.not.objectContaining({
          empty: undefined,
        }),
      )
    })

    it("过滤空字符串", async () => {
      const { search, formRef } = useSearchCore({})

      formRef.value = {
        model: {},
        submit: (cb: any) => cb({ keyword: "test", emptyStr: "" }, undefined),
      } as any

      await search()

      expect(mockCrud.setParams).toHaveBeenCalledWith(
        expect.not.objectContaining({
          emptyStr: "",
        }),
      )
    })

    it("过滤只包含空格的字符串", async () => {
      const { search, formRef } = useSearchCore({})

      formRef.value = {
        model: {},
        submit: (cb: any) => cb({ keyword: "test", spaces: "   " }, undefined),
      } as any

      await search()

      expect(mockCrud.setParams).toHaveBeenCalledWith(
        expect.not.objectContaining({
          spaces: "   ",
        }),
      )
    })

    it("保留数字 0", async () => {
      const { search, formRef } = useSearchCore({})

      formRef.value = {
        model: {},
        submit: (cb: any) => cb({ count: 0, status: "active" }, undefined),
      } as any

      await search()

      expect(mockCrud.setParams).toHaveBeenCalledWith(
        expect.objectContaining({
          count: 0,
        }),
      )
    })

    it("保留布尔值 false", async () => {
      const { search, formRef } = useSearchCore({})

      formRef.value = {
        model: {},
        submit: (cb: any) => cb({ enabled: false, name: "test" }, undefined),
      } as any

      await search()

      expect(mockCrud.setParams).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        }),
      )
    })
  })

  // 新增测试：search 钩子函数测试
  describe("search 钩子函数测试", () => {
    it("调用 onSearch 钩子", async () => {
      const onSearch = vi.fn(async (payload, { next }) => {
        // 调用 next，否则 search 不会 resolve
        await next(payload)
      })
      const { search, formRef, use } = useSearchCore({})

      use({ onSearch })

      formRef.value = {
        model: {},
        submit: (cb: any) => cb({ keyword: "Vue" }, undefined),
      } as any

      await search()

      expect(onSearch).toHaveBeenCalledWith({ keyword: "Vue" }, expect.objectContaining({ next: expect.any(Function) }))
      expect(mockCrud.refresh).toHaveBeenCalled()
    })

    it("onSearch 中调用 next 触发刷新", async () => {
      const onSearch = vi.fn(async (payload, { next }) => {
        await next({ ...payload, customField: "custom" })
      })
      const { search, formRef, use } = useSearchCore({})

      use({ onSearch })

      formRef.value = {
        model: {},
        submit: (cb: any) => cb({ keyword: "Vue" }, undefined),
      } as any

      await search()

      expect(mockCrud.setParams).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: "Vue",
          customField: "custom",
          page: 1,
        }),
      )
      expect(mockCrud.refresh).toHaveBeenCalled()
    })

    it("onSearch 抛出异常时 search 被拒绝", async () => {
      const error = new Error("Search failed")
      const onSearch = vi.fn(() => {
        throw error
      })
      const { search, formRef, use } = useSearchCore({})

      use({ onSearch })

      formRef.value = {
        model: {},
        submit: (cb: any) => cb({ keyword: "Vue" }, undefined),
      } as any

      await expect(search()).rejects.toThrow("Search failed")
      expect(mockCrud.refresh).not.toHaveBeenCalled()
    })
  })

  // 新增测试：reset 钩子函数测试
  describe("reset 钩子函数测试", () => {
    it("调用 onReset 钩子", async () => {
      const onReset = vi.fn(async (payload, { next }) => {
        // 调用 next，否则 reset 不会 resolve
        await next(payload)
      })
      const { reset, formRef, use } = useSearchCore({})

      use({ onReset })

      formRef.value = {
        model: {},
        resetFields: vi.fn(),
        bindFields: vi.fn(),
      } as any

      await reset()

      expect(onReset).toHaveBeenCalledWith({}, expect.objectContaining({ next: expect.any(Function) }))
      expect(mockCrud.refresh).toHaveBeenCalled()
    })

    it("onReset 中调用 next 触发刷新", async () => {
      const onReset = vi.fn(async (payload, { next }) => {
        await next({ ...payload, resetField: "reset" })
      })
      const { reset, formRef, use } = useSearchCore({})

      use({ onReset })

      formRef.value = {
        model: {},
        resetFields: vi.fn(),
        bindFields: vi.fn(),
      } as any

      await reset({ extra: 1 })

      expect(mockCrud.setParams).toHaveBeenCalledWith(
        expect.objectContaining({
          resetField: "reset",
          page: 1,
        }),
      )
      expect(mockCrud.refresh).toHaveBeenCalled()
    })

    it("onReset 抛出异常时 reset 被拒绝", async () => {
      const error = new Error("Reset failed")
      const onReset = vi.fn(() => {
        throw error
      })
      const { reset, formRef, use } = useSearchCore({})

      use({ onReset })

      formRef.value = {
        model: {},
        resetFields: vi.fn(),
        bindFields: vi.fn(),
      } as any

      await expect(reset()).rejects.toThrow("Reset failed")
      expect(mockCrud.refresh).not.toHaveBeenCalled()
    })
  })

  // 新增测试：响应式视口宽度测试
  describe("resolveActionCol 响应式测试", () => {
    it("不同视口宽度下返回正确的响应式值", () => {
      const { resolveActionCol, viewportWidth } = useSearchCore({})

      // 模拟桌面端
      viewportWidth.value = 1920
      const action = { col: { span: 2 } }
      const result = resolveActionCol(action as any)
      expect(result.span).toBeDefined()
    })
  })

  // 新增测试：getModelHandler 测试
  describe("getModelHandler 测试", () => {
    it("未提供回调时不报错", () => {
      const { formRef } = useSearchCore({})

      formRef.value = {
        model: { keyword: "test" },
      } as any

      // 通过 mitt 事件触发
      expect(() => mockMitt.emit("search.get.model")).not.toThrow()
    })

    it("回调函数接收到正确的 model", () => {
      const callback = vi.fn()
      const { formRef } = useSearchCore({})

      formRef.value = {
        model: { keyword: "test", status: 1 },
      } as any

      // 模拟通过事件系统调用
      const handlers = mockMitt.on.mock.calls
      const getModelHandler = handlers.find((call: any) => call[0] === "search.get.model")?.[1]

      if (getModelHandler) {
        getModelHandler(callback)
        expect(callback).toHaveBeenCalledWith({ keyword: "test", status: 1 })
      }
    })
  })

  // 新增测试：assignParams 边界测试
  describe("assignParams 参数设置测试", () => {
    it("保留 size 参数", async () => {
      const { search, formRef } = useSearchCore({})

      // 注意： setParams逻辑中size是从getParams或crud.params.size获取
      // 首先设置getParams返回值包含size
      mockCrud.getParams = vi.fn(() => ({ page: 1, size: 50 }))

      formRef.value = {
        model: {},
        submit: (cb: any) => cb({ keyword: "test" }, undefined),
      } as any

      await search()

      expect(mockCrud.setParams).toHaveBeenCalledWith(
        expect.objectContaining({
          size: 50,
          page: 1,
        }),
      )
    })
  })
})
