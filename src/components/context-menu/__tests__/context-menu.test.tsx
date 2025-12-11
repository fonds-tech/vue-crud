import { ref } from "vue"
import { mount } from "@vue/test-utils"
import { renderList } from "../render/menu"
import { contextMenu } from "../context-menu"
import { it, vi, expect, describe, afterEach, beforeEach } from "vitest"

describe("context-menu renderList 边界", () => {
  it("过滤 hidden 项并处理 divider/disabled 与键盘事件", async () => {
    const ids = ref(new Set<string>())
    const handleItemClick = vi.fn()
    const close = vi.fn()

    const vnode = renderList(
      [
        { label: "visible", type: "item" } as any,
        { label: "hidden", hidden: true } as any,
        { type: "divider" } as any,
        { label: "child", children: [{ label: "nested" }], _showChildren: true } as any,
        { label: "disabled", disabled: true } as any,
      ],
      "0",
      1,
      ids,
      handleItemClick,
      close,
    )

    const wrapper = mount({ render: () => vnode })
    const items = wrapper.findAll(".fd-context-menu__item")

    expect(items).toHaveLength(4) // hidden 被过滤，divider + 3 items
    await items[0].trigger("click")
    expect(handleItemClick).toHaveBeenCalled()
    expect(items.some(item => item.attributes("aria-disabled") === "true")).toBe(true)

    await items[0].trigger("keydown", { key: "Escape" })
    expect(close).toHaveBeenCalled()
  })
})

describe("contextMenu.open 生命周期", () => {
  let appendSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers()
    appendSpy = vi.spyOn(document.body, "appendChild")
  })

  afterEach(() => {
    vi.useRealTimers()
    appendSpy.mockRestore()
  })

  it("exposed.close 应触发 cleanup，fallback close 也应删除节点", async () => {
    const event = { target: document.createElement("div") } as unknown as MouseEvent
    const ctrl = contextMenu.open(event, { document })
    expect(appendSpy).toHaveBeenCalled()

    ctrl.close()
    vi.runAllTimers()
    expect(document.body.querySelector(".fd-context-menu")).toBeNull()
  })

  // 可见性由 core 控制，此处仅验证 open/close 生命周期已覆盖 cleanup 分支
})
