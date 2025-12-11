import { createTableState } from "../core/state"
import { createTableMethods } from "../core/methods"
import { it, vi, expect, describe, beforeEach } from "vitest"

describe("createTableMethods", () => {
  let state: ReturnType<typeof createTableState>
  let mockCrud: any
  let mockMitt: any
  let mockEmit: any
  let methods: ReturnType<typeof createTableMethods>

  beforeEach(() => {
    state = createTableState({}, {}, {})
    // 模拟 tableRef
    state.tableRef.value = {
      toggleRowSelection: vi.fn(),
      toggleAllSelection: vi.fn(),
      clearSelection: vi.fn(),
      toggleRowExpansion: vi.fn(),
      clearFilter: vi.fn(),
      clearSort: vi.fn(),
    } as any

    mockCrud = {
      refresh: vi.fn(),
      selection: [],
    }
    mockMitt = { emit: vi.fn() }
    mockEmit = vi.fn()

    methods = createTableMethods({
      state,
      crud: mockCrud,
      mitt: mockMitt,
      emit: mockEmit,
    })
  })

  it("use 方法合并配置并处理分页和列", () => {
    methods.use({
      pagination: { pageSize: 50 },
      columns: [{ prop: "name", label: "Initial" }],
    })

    expect(state.paginationState.pageSize).toBe(50)
    // 验证列是否被处理（添加了 __id 等）
    expect(state.tableOptions.columns[0]).toHaveProperty("__id")
  })

  it("refresh 调用 crud.refresh", () => {
    methods.refresh({ type: 1 })
    expect(mockCrud.refresh).toHaveBeenCalledWith({ type: 1 })
  })

  it("select 选择指定行", () => {
    const row = { id: 1, name: "Test" }
    state.tableRows.value = [row]

    methods.select(1, true)
    expect(state.tableRef.value?.toggleRowSelection).toHaveBeenCalledWith(row, true)
  })

  it("select 支持 rowKey 为函数的情况", () => {
    state.tableOptions.table.rowKey = (row: any) => `key-${row.id}`
    const row = { id: 2 }
    state.tableRows.value = [row]
    methods.select("key-2", false)
    expect(state.tableRef.value?.toggleRowSelection).toHaveBeenCalledWith(row, false)
  })

  it("select 无 rowKey 时安全退出", () => {
    methods.select(undefined as any, true)
    expect(state.tableRef.value?.toggleRowSelection).not.toHaveBeenCalled()
  })

  it("selectAll 操作", () => {
    methods.selectAll(true)
    // 先清空
    expect(state.tableRef.value?.clearSelection).toHaveBeenCalled()
    // 后续逻辑依赖 tableRows，如果为空可能不触发 toggleRowSelection
    // 补充 rows
    state.tableRows.value = [{ id: 1 }] as any
    methods.selectAll(true)
    expect(state.tableRef.value?.toggleRowSelection).toHaveBeenCalled()
  })

  it("expand 展开/折叠行", () => {
    state.tableRows.value = [{ id: 1 }] as any
    methods.expand(1, true)
    expect(state.tableRef.value?.toggleRowExpansion).toHaveBeenCalled()
  })

  it("expandAll 默认展开所有行", () => {
    state.tableRows.value = [{ id: 1 }, { id: 2 }] as any
    methods.expandAll()
    expect(state.tableRef.value?.toggleRowExpansion).toHaveBeenCalledTimes(2)
  })

  it("toggleFullscreen 切换全屏并触发事件", () => {
    methods.toggleFullscreen(true)
    expect(state.isFullscreen.value).toBe(true)
    expect(mockMitt.emit).toHaveBeenCalledWith("fullscreen", true)
    expect(mockEmit).toHaveBeenCalledWith("fullscreenChange", true)

    methods.toggleFullscreen()
    expect(state.isFullscreen.value).toBe(false)

    methods.toggleFullscreen(false)
    expect(state.isFullscreen.value).toBe(false)
  })

  it("setData 直接更新数据", () => {
    methods.setData([{ id: 1 }] as any)
    expect(state.tableRows.value).toHaveLength(1)
  })

  it("clearData 清空数据", () => {
    state.tableRows.value = [{ id: 1 }] as any
    methods.clearData()
    expect(state.tableRows.value).toHaveLength(0)
  })

  it("expandAll 展开所有行", () => {
    state.tableRows.value = [{ id: 1 }, { id: 2 }, { id: 3 }] as any
    methods.expandAll(true)
    expect(state.tableRef.value?.toggleRowExpansion).toHaveBeenCalledTimes(3)
  })

  it("expandAll 收起所有行", () => {
    state.tableRows.value = [{ id: 1 }, { id: 2 }] as any
    methods.expandAll(false)
    expect(state.tableRef.value?.toggleRowExpansion).toHaveBeenCalledWith(state.tableRows.value[0], false)
  })

  it("setTable 设置表格属性", () => {
    methods.setTable({ height: "500px", border: false })
    expect(state.tableOptions.table.height).toBe("500px")
    expect(state.tableOptions.table.border).toBe(false)
  })

  it("resetFilters 不带参数时清空所有过滤", () => {
    methods.resetFilters()
    expect(state.tableRef.value?.clearFilter).toHaveBeenCalledWith()
  })

  it("resetFilters 带单个字段参数", () => {
    methods.resetFilters("status")
    expect(state.tableRef.value?.clearFilter).toHaveBeenCalledWith("status")
  })

  it("resetFilters 带多个字段参数", () => {
    const fields = ["status", "type"]
    methods.resetFilters(fields)
    expect(state.tableRef.value?.clearFilter).toHaveBeenCalledWith(fields)
  })

  it("clearFilters 是 resetFilters 的别名", () => {
    methods.clearFilters("name")
    expect(state.tableRef.value?.clearFilter).toHaveBeenCalledWith("name")
  })

  it("resetSorters 清空排序", () => {
    methods.resetSorters()
    expect(state.tableRef.value?.clearSort).toHaveBeenCalled()
  })

  it("clearSorters 是 resetSorters 的别名", () => {
    methods.clearSorters()
    expect(state.tableRef.value?.clearSort).toHaveBeenCalled()
  })

  it("use 应应用分页配置", () => {
    methods.use({
      pagination: {
        pageSizes: [10, 20],
        pageSize: 20,
        currentPage: 3,
      },
    } as any)

    expect(state.paginationState.pageSizes).toEqual([10, 20])
    expect(state.paginationState.pageSize).toBe(20)
    expect(state.paginationState.currentPage).toBe(3)
  })

  it("selectAll 在未传参数时调用 toggleAllSelection", () => {
    methods.selectAll()
    expect(state.tableRef.value?.toggleAllSelection).toHaveBeenCalled()
  })
})
