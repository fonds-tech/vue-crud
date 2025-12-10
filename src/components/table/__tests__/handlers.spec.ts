import type { CrudBridge } from "../core/actions"
import type { TableRecord } from "../interface"
import type { TableHandlersContext } from "../core/handlers"
import { createTableState } from "../core/state"
import { createTableHandlers } from "../core/handlers"
import { it, vi, expect, describe, beforeEach } from "vitest"

describe("createTableHandlers", () => {
  let state: ReturnType<typeof createTableState>
  let mockCrud: TableHandlersContext["crud"]
  let mockCrudBridge: CrudBridge
  let mockRefresh: (params?: Record<string, unknown>) => void
  let mockEmit: (event: string, ...args: unknown[]) => void
  let handlers: ReturnType<typeof createTableHandlers>

  beforeEach(() => {
    state = createTableState({}, {}, {})
    mockCrud = {
      selection: [],
      setParams: vi.fn(),
      refresh: vi.fn(),
    }
    mockCrudBridge = {
      refresh: vi.fn(),
      rowInfo: vi.fn(),
      rowEdit: vi.fn(),
      rowDelete: vi.fn(),
      dict: {
        label: { detail: "详情", update: "编辑", delete: "删除" },
        primaryId: "id",
      },
    }
    mockRefresh = vi.fn()
    mockEmit = vi.fn()

    handlers = createTableHandlers({
      state,
      crud: mockCrud,
      crudBridge: mockCrudBridge,
      refresh: mockRefresh,
      emit: mockEmit,
    })
  })

  describe("onSizeChange", () => {
    it("应该更新表格尺寸并触发事件", () => {
      handlers.onSizeChange("small")
      expect(state.tableOptions.table.size).toBe("small")
      expect(mockEmit).toHaveBeenCalledWith("sizeChange", "small")
    })

    it("应该支持不同的尺寸值", () => {
      handlers.onSizeChange("large")
      expect(state.tableOptions.table.size).toBe("large")
      expect(mockEmit).toHaveBeenCalledWith("sizeChange", "large")

      handlers.onSizeChange("default")
      expect(state.tableOptions.table.size).toBe("default")
      expect(mockEmit).toHaveBeenCalledWith("sizeChange", "default")
    })
  })

  describe("onSelectionChange", () => {
    it("应该同步选中行到状态和 crud", () => {
      const rows: TableRecord[] = [
        { id: 1, name: "张三" },
        { id: 2, name: "李四" },
      ]
      handlers.onSelectionChange(rows)
      expect(state.selectedRows.value).toEqual(rows)
      expect(mockCrud.selection).toEqual(rows)
    })

    it("应该支持清空选择", () => {
      // 先设置选中
      state.selectedRows.value = [{ id: 1, name: "张三" }]
      mockCrud.selection = [{ id: 1, name: "张三" }]

      // 清空
      handlers.onSelectionChange([])
      expect(state.selectedRows.value).toEqual([])
      expect(mockCrud.selection).toEqual([])
    })
  })

  describe("onPageChange", () => {
    it("应该更新页码并触发刷新", () => {
      handlers.onPageChange(3)
      expect(state.paginationState.currentPage).toBe(3)
      expect(mockCrud.setParams).toHaveBeenCalledWith({ page: 3 })
      expect(mockCrud.refresh).toHaveBeenCalled()
      expect(mockEmit).toHaveBeenCalledWith("pageChange", 3)
    })

    it("应该支持第一页", () => {
      state.paginationState.currentPage = 5
      handlers.onPageChange(1)
      expect(state.paginationState.currentPage).toBe(1)
      expect(mockCrud.setParams).toHaveBeenCalledWith({ page: 1 })
    })
  })

  describe("onPageSizeChange", () => {
    it("应该更新每页数量并重置页码为 1", () => {
      state.paginationState.currentPage = 5
      handlers.onPageSizeChange(50)
      expect(state.paginationState.pageSize).toBe(50)
      expect(state.paginationState.currentPage).toBe(1)
      expect(mockCrud.setParams).toHaveBeenCalledWith({ page: 1, size: 50 })
      expect(mockCrud.refresh).toHaveBeenCalled()
      expect(mockEmit).toHaveBeenCalledWith("pageSizeChange", 50)
    })

    it("应该支持不同的页容量值", () => {
      handlers.onPageSizeChange(100)
      expect(state.paginationState.pageSize).toBe(100)
      expect(mockCrud.setParams).toHaveBeenCalledWith({ page: 1, size: 100 })
    })
  })

  describe("closeContextMenu", () => {
    it("应该关闭右键菜单", () => {
      state.contextMenuState.visible = true
      handlers.closeContextMenu()
      expect(state.contextMenuState.visible).toBe(false)
    })

    it("已关闭时调用应该保持关闭", () => {
      state.contextMenuState.visible = false
      handlers.closeContextMenu()
      expect(state.contextMenuState.visible).toBe(false)
    })
  })

  describe("tableRefreshHandler", () => {
    it("应该更新数据列表", () => {
      const list: TableRecord[] = [
        { id: 1, name: "张三" },
        { id: 2, name: "李四" },
      ]
      handlers.tableRefreshHandler({ list })
      expect(state.tableRows.value).toEqual(list)
    })

    it("应该更新分页信息", () => {
      handlers.tableRefreshHandler({
        list: [{ id: 1 }],
        page: 3,
        count: 100,
        pageSize: 25,
      })
      expect(state.paginationState.currentPage).toBe(3)
      expect(state.paginationState.total).toBe(100)
      expect(state.paginationState.pageSize).toBe(25)
    })

    it("无 list 时应设置为空数组", () => {
      state.tableRows.value = [{ id: 1 }]
      handlers.tableRefreshHandler({ count: 0 })
      expect(state.tableRows.value).toEqual([])
    })

    it("无 count 时应使用数据长度作为 total", () => {
      const list = [{ id: 1 }, { id: 2 }, { id: 3 }]
      handlers.tableRefreshHandler({ list })
      expect(state.paginationState.total).toBe(3)
    })

    it("payload 为 null 时应该不做任何操作", () => {
      const originalRows = [{ id: 1 }]
      state.tableRows.value = originalRows
      handlers.tableRefreshHandler(null)
      expect(state.tableRows.value).toEqual(originalRows)
    })

    it("payload 为非对象时应该不做任何操作", () => {
      const originalRows = [{ id: 1 }]
      state.tableRows.value = originalRows
      handlers.tableRefreshHandler("invalid")
      expect(state.tableRows.value).toEqual(originalRows)
    })

    it("仅更新部分字段", () => {
      state.paginationState.currentPage = 1
      state.paginationState.pageSize = 20
      handlers.tableRefreshHandler({ page: 5 })
      expect(state.paginationState.currentPage).toBe(5)
      expect(state.paginationState.pageSize).toBe(20) // 未改变
    })
  })

  describe("onCellContextmenu", () => {
    it("应该阻止默认行为", () => {
      const row: TableRecord = { id: 1, name: "张三" }
      const column = { prop: "name" } as any
      const event = new MouseEvent("contextmenu", { clientX: 100, clientY: 200 })
      const preventDefaultSpy = vi.spyOn(event, "preventDefault")

      state.tableRows.value = [row]
      handlers.onCellContextmenu(row, column, event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it("应该设置菜单位置", () => {
      const row: TableRecord = { id: 1, name: "张三" }
      const column = { prop: "name" } as any
      const event = new MouseEvent("contextmenu", { clientX: 150, clientY: 250 })

      state.tableRows.value = [row]
      handlers.onCellContextmenu(row, column, event)

      expect(state.contextMenuState.x).toBe(150)
      expect(state.contextMenuState.y).toBe(250)
    })

    it("应该显示菜单", () => {
      const row: TableRecord = { id: 1, name: "张三" }
      const column = { prop: "name" } as any
      const event = new MouseEvent("contextmenu")

      state.tableRows.value = [row]
      handlers.onCellContextmenu(row, column, event)

      expect(state.contextMenuState.visible).toBe(true)
    })

    it("应该构建菜单项", () => {
      const row: TableRecord = { id: 1, name: "张三" }
      const column = { prop: "name" } as any
      const event = new MouseEvent("contextmenu")

      state.tableRows.value = [row]
      state.tableOptions.columns = [{ type: "action", actions: [{ type: "delete" }] }]

      handlers.onCellContextmenu(row, column, event)

      expect(state.contextMenuState.items.length).toBeGreaterThan(0)
      expect(state.contextMenuState.items[0].label).toBe("刷新")
    })

    it("行不在列表中时 $index 应为 0", () => {
      const row: TableRecord = { id: 999, name: "不存在" }
      const column = { prop: "name" } as any
      const event = new MouseEvent("contextmenu")

      state.tableRows.value = [{ id: 1, name: "张三" }]
      handlers.onCellContextmenu(row, column, event)

      // 菜单应该正常打开，$index 为 0
      expect(state.contextMenuState.visible).toBe(true)
    })
  })

  describe("handleContextAction", () => {
    it("应该执行操作并关闭菜单", () => {
      const action = vi.fn()
      const item = { action, label: "测试操作" }

      state.contextMenuState.visible = true
      handlers.handleContextAction(item)

      expect(action).toHaveBeenCalled()
      expect(state.contextMenuState.visible).toBe(false)
    })

    it("应该按顺序执行操作", () => {
      const callOrder: number[] = []
      const action = () => callOrder.push(1)
      const item = { action, label: "测试" }

      state.contextMenuState.visible = true
      handlers.handleContextAction(item)
      callOrder.push(2)

      expect(callOrder).toEqual([1, 2])
      expect(state.contextMenuState.visible).toBe(false)
    })
  })
})
