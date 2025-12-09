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

  it("toggleFullscreen 切换全屏并触发事件", () => {
    methods.toggleFullscreen(true)
    expect(state.isFullscreen.value).toBe(true)
    expect(mockMitt.emit).toHaveBeenCalledWith("fullscreen", true)
    expect(mockEmit).toHaveBeenCalledWith("fullscreenChange", true)

    methods.toggleFullscreen()
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
})
