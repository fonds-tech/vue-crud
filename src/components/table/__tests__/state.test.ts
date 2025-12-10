import { it, expect, describe } from "vitest"
import { createTableState, defaultPagination } from "../core/state"

describe("createTableState", () => {
  it("使用默认配置初始化状态", () => {
    const state = createTableState({}, {}, {})

    expect(state.tableRows.value).toEqual([])
    expect(state.selectedRows.value).toEqual([])
    expect(state.isFullscreen.value).toBe(false)
    expect(state.tableOptions.table.border).toBe(true)
    expect(state.tableOptions.table.size).toBe("default")
    expect(state.paginationState.pageSize).toBe(defaultPagination.pageSize)
  })

  it("响应 props.name 变化生成 cacheKey", () => {
    const state = createTableState({ name: "test-table" }, {}, {})
    expect(state.cacheKey.value).toBe("fd-table:test-table:columns")
  })

  it("正确合并初始分页参数", () => {
    const state = createTableState({}, {}, {}, { page: 2, size: 50 })

    expect(state.paginationState.currentPage).toBe(2)
    expect(state.paginationState.pageSize).toBe(50)
  })

  it("计算 elTableProps 时排除专用属性", () => {
    const state = createTableState({}, {}, {})
    // 直接操作 tableOptions 来模拟用户配置
    state.tableOptions.table = {
      ...state.tableOptions.table,
      height: "500px",
      tools: false, // 专用属性，不应透传
      fullscreen: true, // 专用属性，不应透传（虽然 state 中有独立 isFullscreen）
    }

    const props = state.elTableProps.value
    expect(props.height).toBe("500px")
    expect(props).not.toHaveProperty("tools")
  })

  it("根据 columnSettings 计算 visibleColumns", () => {
    const state = createTableState({}, {}, {})
    state.tableOptions.columns = [
      { prop: "name", label: "Name" },
      { prop: "age", label: "Age" },
    ]

    // 模拟列设置
    state.columnSettings.value = [
      { id: "age", label: "Age", show: true, order: 0, sort: false, pinned: false },
      { id: "name", label: "Name", show: false, order: 1, sort: false, pinned: false },
    ]

    const visible = state.visibleColumns.value
    expect(visible).toHaveLength(1)
    expect(visible[0].prop).toBe("age")
  })

  it("正确识别命名插槽", () => {
    const slots = {
      "default": () => [],
      "header": () => [],
      "toolbar": () => [],
      "custom-slot": () => [],
    }
    const state = createTableState({}, slots, {})

    expect(state.namedExtraSlots.value).toContain("custom-slot")
    expect(state.namedExtraSlots.value).not.toContain("default")
    expect(state.namedExtraSlots.value).not.toContain("toolbar")
  })
})
