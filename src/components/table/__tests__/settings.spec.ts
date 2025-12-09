import { createTableState } from "../core/state"
import { it, expect, describe, beforeEach } from "vitest"
import { onDragMove, writeCache, rebuildColumnSettings } from "../core/settings"

describe("table settings", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe("cache", () => {
    it("writeCache 写入缓存", () => {
      const state = createTableState({ name: "test-write" }, {}, {})
      state.columnSettings.value = [
        { id: "col1", label: "Col1", show: false, order: 0, sort: true, pinned: false },
      ]

      writeCache(state)

      const saved = JSON.parse(localStorage.getItem("fd-table:test-write:columns") || "{}")
      expect(saved.columns.col1.show).toBe(false)
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
  })
})
