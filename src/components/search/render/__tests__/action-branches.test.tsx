import { ref } from "vue"
import { renderAction } from "../action"
import { it, vi, expect, describe } from "vitest"

const baseEngine = {
  collapsed: ref(false),
  collapseLabel: ref("展开"),
  crud: { dict: { label: { search: "搜", reset: "清空" } } },
  loading: ref(false),
  formModel: ref({}),
  getActionItemProps: () => ({}),
  getActionSlot: () => undefined,
  getComponentIs: () => "div",
  getComponentProps: () => ({}),
  getComponentEvents: () => ({}),
  getComponentStyle: () => undefined,
  getComponentSlots: () => ({}),
  search: vi.fn(),
  reset: vi.fn(),
  collapse: vi.fn(),
  resolvedActions: ref([]),
}

describe("renderAction 分支补测", () => {
  it("自定义 action.type 为空时使用插槽或渲染组件", () => {
    const vnode = renderAction(baseEngine as any, { text: "custom" } as any, 0, {
      action: () => "slot-content",
    } as any)
    expect(vnode).toBeTruthy()
  })

  it("collapse 动作应触发 collapse 回调", async () => {
    const engine = { ...baseEngine, collapse: vi.fn(), collapsed: ref(true) }
    const wrapper = (await import("@vue/test-utils")).mount(
      {
        render: () => renderAction(engine as any, { type: "collapse" } as any, 1, {} as any),
      },
      {
        global: {
          stubs: {
            "fd-grid-item": { template: "<div class='fd-grid-item'><slot /></div>" },
            "el-button": { template: "<button @click=\"$emit('click')\"><slot /></button>" },
            "el-icon": { template: "<span><slot /></span>" },
          },
        },
      },
    )

    await wrapper.find("button").trigger("click")
    expect(engine.collapse).toHaveBeenCalled()
  })
})
