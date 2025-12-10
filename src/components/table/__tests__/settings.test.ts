import { createTableState } from "../core/state"
import { it, vi, expect, describe, beforeEach } from "vitest"
import {
  onDragMove,
  writeCache,
  saveColumns,
  toggleFixed,
  toggleAllColumns,
  syncOrderFromList,
  onColumnShowChange,
  sortColumnSettings,
  rebuildColumnSettings,
} from "../core/settings"

describe("table settings", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe("cache", () => {
    it("writeCache 写入缓存", () => {
      const state = createTableState({ name: "test-write" }, {}, {})
      ;(state.columnSettings as any).value = [{ id: "col1", label: "Col1", show: false, order: 0, sort: true, pinned: false }]

      writeCache(state)

      const saved = JSON.parse(localStorage.getItem("fd-table:test-write:columns") || "{}")
      expect(saved.columns.col1.show).toBe(false)
    })

    it("无效的缓存结构会被清理并回退默认值", () => {
      localStorage.setItem("fd-table:bad:columns", JSON.stringify({ version: 123 }))
      const state = createTableState({ name: "bad" }, {}, {})
      state.tableOptions.columns = [{ __id: "x", label: "X" }] as any

      rebuildColumnSettings(state)

      expect(localStorage.getItem("fd-table:bad:columns")).toBeNull()
      expect(state.columnSettings.value[0].show).toBe(true)
    })

    it("localStorage 不可用时应安全跳过缓存", () => {
      const original = globalThis.localStorage
      const brokenStorage = {
        setItem: () => {
          throw new Error("forbidden")
        },
        getItem: () => {
          throw new Error("forbidden")
        },
        removeItem: vi.fn(),
        clear: vi.fn(),
      } as any
      try {
        globalThis.localStorage = brokenStorage

        const state = createTableState({ name: "unavailable" }, {}, {})
        state.tableOptions.columns = [{ __id: "a", label: "A" }] as any
        expect(() => rebuildColumnSettings(state)).not.toThrow()
        expect(state.columnSettings.value[0].id).toBe("a")
        expect(() => saveColumns(state, vi.fn())).not.toThrow()
      }
      finally {
        globalThis.localStorage = original
      }
    })

    it("缓存版本不匹配时返回 undefined 但不删除缓存", () => {
      const cacheKey = "fd-table:version-mismatch:columns"
      const cacheData = {
        version: "old-version",
        order: ["a"],
        columns: { a: { show: false } },
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
      const state = createTableState({ name: "version-mismatch" }, {}, {})
      state.tableOptions.columns = [{ __id: "a", label: "A" }] as any

      rebuildColumnSettings(state)

      expect(state.columnSettings.value[0].show).toBe(true)
      expect(localStorage.getItem(cacheKey)).not.toBeNull()
    })

    it("writeCache 在存储异常时不会抛错", () => {
      const original = globalThis.localStorage
      const storageData: Record<string, string> = {}
      const throwingStorage = {
        setItem: (key: string, value: string) => {
          if (key === "__fd_table_test__") {
            storageData[key] = value
            return
          }
          throw new Error("quota exceeded")
        },
        getItem: (key: string) => storageData[key],
        removeItem: (key: string) => delete storageData[key],
        clear: vi.fn(),
      } as any
      try {
        globalThis.localStorage = throwingStorage
        const state = createTableState({ name: "write-cache-err" }, {}, {})
        ;(state.columnSettings as any).value = [{ id: "a", label: "A", show: true, order: 0, sort: true, pinned: false }]
        expect(() => saveColumns(state, vi.fn())).not.toThrow()
      }
      finally {
        globalThis.localStorage = original
      }
    })

    it("saveColumns 会触发列变更回调", () => {
      const state = createTableState({ name: "emit" }, {}, {})
      ;(state.visibleColumns as any).value = [{ id: "c1" }] as any
      const emit = vi.fn()
      saveColumns(state, emit)
      expect(emit).toHaveBeenCalledWith(state.visibleColumns.value)
    })
  })

  describe("rebuildColumnSettings", () => {
    it("根据 options.columns 初始化设置", () => {
      const state = createTableState({}, {}, {})
      state.tableOptions.columns = [
        { __id: "c1", label: "C1", prop: "p1" },
        { __id: "c2", label: "C2", prop: "p2" },
      ] as any

      rebuildColumnSettings(state)

      expect(state.columnSettings.value).toHaveLength(2)
      expect(state.columnSettings.value[0].id).toBe("c1")
    })

    it("应用缓存中的设置", () => {
      // 预设缓存：c1 隐藏，顺序交换
      const cacheData = {
        version: "c1|c2", // 根据 getVersion 逻辑自动生成
        order: ["c2", "c1"],
        columns: {
          c1: { show: false, order: 1 },
          c2: { show: true, order: 0 },
        },
      }
      localStorage.setItem("fd-table:test:columns", JSON.stringify(cacheData))

      const state = createTableState({ name: "test" }, {}, {})
      state.tableOptions.columns = [
        { __id: "c1", label: "C1" },
        { __id: "c2", label: "C2" },
      ] as any

      rebuildColumnSettings(state)

      const settings = state.columnSettings.value
      expect(settings[0].id).toBe("c2") // 顺序变了
      expect(settings[1].id).toBe("c1")
      expect(settings[1].show).toBe(false) // 隐藏生效
    })

    it("应用缓存的固定列与显示状态", () => {
      const state = createTableState({ name: "cache-fixed" }, {}, {})
      state.tableOptions.columns = [
        { __id: "a", label: "A", show: true, fixed: "left" },
        { __id: "b", label: "B", show: true },
      ] as any

      // 写入缓存：a 隐藏，b 固定左侧并取消排序
      const cacheData = {
        version: "a|b",
        order: ["b", "a"],
        columns: {
          a: { show: false, fixed: "left" },
          b: { show: true, fixed: "left", pinned: true },
        },
      }
      localStorage.setItem("fd-table:cache-fixed:columns", JSON.stringify(cacheData))

      rebuildColumnSettings(state)

      const map = Object.fromEntries(state.columnSettings.value.map(item => [item.id, item]))
      expect(map.a.show).toBe(false)
      expect(map.a.fixed).toBe("left")
      expect(map.b.fixed).toBe("left")
      expect(map.b.pinned).toBe(true)
      expect(map.b.sort).toBe(false)
    })

    it("resetColumns 会清理缓存并重建", () => {
      const state = createTableState({ name: "reset" }, {}, {})
      state.tableOptions.columns = [{ __id: "x", label: "X" }] as any
      ;(state.columnSettings as any).value = [{ id: "x", label: "X", show: false, order: 0, sort: true, pinned: false }]
      writeCache(state)
      rebuildColumnSettings(state)
      // 缓存存在
      expect(localStorage.getItem("fd-table:reset:columns")).not.toBeNull()
      // 重置
      ;(state.columnSettings as any).value[0].show = false
      rebuildColumnSettings(state, false)
      expect(state.columnSettings.value[0].show).toBe(true)
    })
  })

  describe("onDragMove", () => {
    it("阻止跨越不同 fixed 区域的拖拽", () => {
      const leftCtx = { element: { fixed: "left", sort: true } }
      const centerCtx = { element: { fixed: undefined, sort: true } }

      // 左 -> 中：禁止
      expect(onDragMove({ draggedContext: leftCtx, relatedContext: centerCtx } as any)).toBe(false)
      // 中 -> 左：禁止
      expect(onDragMove({ draggedContext: centerCtx, relatedContext: leftCtx } as any)).toBe(false)
      // 中 -> 中：允许
      expect(onDragMove({ draggedContext: centerCtx, relatedContext: centerCtx } as any)).toBe(true)
    })

    it("固定列或 pinned 列拖拽直接拒绝", () => {
      const pinnedCtx = { element: { fixed: "left", sort: true, pinned: true } }
      const freeCtx = { element: { fixed: undefined, sort: true } }
      expect(onDragMove({ draggedContext: pinnedCtx, relatedContext: freeCtx } as any)).toBe(false)
      expect(onDragMove({ draggedContext: freeCtx, relatedContext: pinnedCtx } as any)).toBe(false)
    })
  })

  describe("列设置操作", () => {
    it("onColumnShowChange 更新指定列可见性", () => {
      const state = createTableState({}, {}, {})
      ;(state.columnSettings as any).value = [
        { id: "a", label: "A", show: true, order: 0, sort: true, pinned: false },
        { id: "b", label: "B", show: true, order: 1, sort: true, pinned: false },
      ]
      onColumnShowChange(state, "b", false)
      expect(state.columnSettings.value.find(i => i.id === "b")?.show).toBe(false)
    })

    it("toggleAllColumns 批量切换可见性", () => {
      const state = createTableState({}, {}, {})
      ;(state.columnSettings as any).value = [
        { id: "a", label: "A", show: true, order: 0, sort: true, pinned: false },
        { id: "b", label: "B", show: false, order: 1, sort: true, pinned: false },
      ]
      toggleAllColumns(state, true)
      expect(state.columnSettings.value.every(i => i.show)).toBe(true)
    })

    it("toggleFixed 切换固定列并重新排序", () => {
      const state = createTableState({}, {}, {})
      ;(state.columnSettings as any).value = [
        { id: "a", label: "A", show: true, order: 0, sort: true, pinned: false, fixed: undefined },
        { id: "b", label: "B", show: true, order: 1, sort: true, pinned: false, fixed: undefined },
      ]
      toggleFixed(state, "b", "left")
      const b = state.columnSettings.value.find(i => i.id === "b")!
      expect(b.fixed).toBe("left")
      expect(b.order).toBe(0)
    })

    it("syncOrderFromList 和 sortColumnSettings 维护顺序", () => {
      const state = createTableState({}, {}, {})
      ;(state.columnSettings as any).value = [
        { id: "a", label: "A", show: true, order: 1, sort: true, pinned: false, fixed: "right" },
        { id: "b", label: "B", show: true, order: 0, sort: true, pinned: false, fixed: undefined },
      ]
      syncOrderFromList(state)
      expect(state.columnSettings.value[0].order).toBe(0)
      sortColumnSettings(state)
      expect(state.columnSettings.value[0].id).toBe("b")
      expect(state.columnSettings.value[1].id).toBe("a")
    })
  })
})
