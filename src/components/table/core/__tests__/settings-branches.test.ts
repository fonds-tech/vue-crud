import type { ColumnSetting } from "../state"
import { ref } from "vue"
import { it, expect, describe } from "vitest"
import { onDragMove, toggleFixed, sortColumnSettings } from "../settings"

function createState(settings: ColumnSetting[]) {
  return {
    columnSettings: ref(settings),
  } as any
}

describe("table/core/settings 分支补测", () => {
  describe("onDragMove", () => {
    it("缺少拖拽项或不可排序时返回 false", () => {
      expect(onDragMove({} as any)).toBe(false)
      const dragged = { sort: false }
      expect(onDragMove({ draggedContext: { element: dragged } } as any)).toBe(false)
    })

    it("固定列或 fixed 不一致时返回 false，其余情况返回 true", () => {
      const base = { id: "base", label: "Base", show: true, order: 0, sort: true, pinned: true, fixed: "left" as const }
      expect(onDragMove({ draggedContext: { element: base } } as any)).toBe(false)

      const dragged = { id: "a", label: "A", show: true, order: 0, sort: true, pinned: false, fixed: "left" as const }
      const related = { id: "b", label: "B", show: true, order: 1, sort: true, pinned: false, fixed: "right" as const }
      expect(onDragMove({ draggedContext: { element: dragged }, relatedContext: { element: related } })).toBe(false)

      const okDragged = { id: "c", label: "C", show: true, order: 0, sort: true, pinned: false, fixed: "left" as const }
      const okRelated = { id: "d", label: "D", show: true, order: 1, sort: true, pinned: false, fixed: "left" as const }
      expect(onDragMove({ draggedContext: { element: okDragged }, relatedContext: { element: okRelated } })).toBe(true)
    })
  })

  describe("toggleFixed 与排序", () => {
    it("切换固定状态并保持排序结果稳定", () => {
      const state = createState([
        { id: "a", label: "A", show: true, order: 0, sort: true, pinned: false },
        { id: "b", label: "B", show: true, order: 1, sort: true, pinned: false },
      ])

      toggleFixed(state, "a", "left")
      expect(state.columnSettings.value[0].fixed).toBe("left")
      expect(state.columnSettings.value[0].sort).toBe(true)

      toggleFixed(state, "a", "left")
      expect(state.columnSettings.value[0].fixed).toBeUndefined()

      // 调整 order 后重新排序，确保排序稳定且重新编号
      state.columnSettings.value = [
        { id: "b", label: "B", show: true, order: 0, sort: true, pinned: false },
        { id: "a", label: "A", show: true, order: 1, sort: true, pinned: false },
      ]
      sortColumnSettings(state)
      expect(state.columnSettings.value.map((item: ColumnSetting) => item.id)).toEqual(["b", "a"])
      expect(state.columnSettings.value[0].order).toBe(0)
      expect(state.columnSettings.value[1].order).toBe(1)
    })
  })
})
