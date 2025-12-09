import { buildContextMenuItems } from "../core/actions"
import { it, vi, expect, describe } from "vitest"

describe("buildContextMenuItems", () => {
  const scope = { row: { id: 1 }, column: { prop: "name" }, $index: 0 } as any
  const crud = {
    dict: {
      label: {
        detail: "Detail",
        update: "Update",
        delete: "Delete",
        refresh: "Refresh",
        restore: "Restore", // 如果有
      },
    },
    rowInfo: vi.fn(),
    rowEdit: vi.fn(),
    rowDelete: vi.fn(),
    loading: false,
  } as any
  const refresh = vi.fn()

  it("当无操作列和菜单配置时，只显示刷新", () => {
    const items = buildContextMenuItems(scope, [], crud, refresh)
    expect(items).toHaveLength(1)
    expect(items[0].label).toBe("刷新")
  })

  it("点击刷新触发回调", () => {
    const items = buildContextMenuItems(scope, [], crud, refresh)
    items[0].action()
    expect(refresh).toHaveBeenCalled()
  })

  it("从 action 列提取内置操作", () => {
    const columns = [{
      type: "action",
      actions: [{ type: "detail" }, { type: "update" }, { type: "delete" }],
    }] as any
    const items = buildContextMenuItems(scope, columns, crud, refresh)

    // 刷新 always at top
    expect(items.map(i => i.label)).toEqual(["刷新", "Detail", "Update", "Delete"])
  })

  it("处理 action 的 hidden 属性", () => {
    const columns = [{
      type: "action",
      actions: [
        { type: "detail", text: "Show", hidden: false },
        { type: "update", text: "Hide", hidden: true },
        { type: "delete", text: "FnHide", hidden: () => true },
      ],
    }] as any
    const items = buildContextMenuItems(scope, columns, crud, refresh)

    const labels = items.map(i => i.label)
    expect(labels).toContain("Show")
    expect(labels).not.toContain("Hide")
    expect(labels).not.toContain("FnHide")
  })
})
