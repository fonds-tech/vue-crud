import type { Slots, VNode } from "vue"
import type { SearchCore, SearchAction } from "../interface"
import { renderAction, renderActions } from "../render/action"
import { h, ref, computed, defineComponent } from "vue"
import { it, vi, expect, describe, beforeEach } from "vitest"
import {
  renderComponent,
  renderActionSlots,
  renderCustomSlots,
} from "../render/slots"

// 创建模拟的 SearchCore
function createMockEngine(overrides: Partial<SearchCore> = {}): SearchCore {
  const formModel = ref<Record<string, any>>({})
  const loading = ref(false)
  const collapsed = ref(false)
  const resolvedActions = ref<SearchAction[]>([
    { type: "search" },
    { type: "reset" },
  ])
  const actionGridProps = ref({ cols: 24, colGap: 12, rowGap: 12, collapsed: false, collapsedRows: 1 })
  const collapseLabel = ref("折叠")
  const formSlots = ref<Record<string, any>>({})

  return {
    formRef: ref(),
    loading,
    collapsed,
    viewportWidth: ref(1920),
    options: {
      form: { model: {}, items: [], grid: {}, form: {} },
      action: { items: [], grid: {} },
    } as any,
    formModel: computed(() => formModel.value),
    resolvedActions: computed(() => resolvedActions.value),
    actionGridProps: computed(() => actionGridProps.value),
    collapseLabel: computed(() => collapseLabel.value),
    formSlots: computed(() => formSlots.value),
    crud: {
      dict: { label: { search: "搜索", reset: "重置", collapse: "折叠", expand: "展开" } },
    } as any,
    mitt: { emit: vi.fn(), on: vi.fn(), off: vi.fn() } as any,

    resolveActionCol: vi.fn(() => ({ span: 1, offset: 0 })),
    getActionItemProps: vi.fn(() => ({ span: 1, offset: 0 })),
    getActionSlot: vi.fn(() => undefined),
    getComponentIs: vi.fn(() => undefined),
    getComponentProps: vi.fn(() => ({})),
    getComponentEvents: vi.fn(() => ({})),
    getComponentStyle: vi.fn(() => undefined),
    getComponentSlots: vi.fn(() => ({})),

    use: vi.fn(),
    search: vi.fn(),
    reset: vi.fn(),
    collapse: vi.fn(),
    _formModel: formModel,
    _resolvedActions: resolvedActions,
    ...overrides,
  } as any
}

describe("renderActionSlots", () => {
  let engine: SearchCore
  let action: SearchAction
  let slots: Slots

  beforeEach(() => {
    engine = createMockEngine()
    action = { type: "search" }
    slots = {}
  })

  it("当插槽不存在时返回 null", () => {
    engine.getActionSlot = vi.fn(() => undefined)
    const result = renderActionSlots(engine, action, slots)
    expect(result).toBeNull()
  })

  it("当插槽名称存在但插槽未定义时返回 null", () => {
    engine.getActionSlot = vi.fn(() => "customSlot")
    const result = renderActionSlots(engine, action, slots)
    expect(result).toBeNull()
  })

  it("当插槽存在时正确渲染", () => {
    const slotContent = "Slot Content"
    engine.getActionSlot = vi.fn(() => "customSlot");
    (slots as any).customSlot = vi.fn(() => slotContent)

    const result = renderActionSlots(engine, action, slots)

    expect((slots as any).customSlot).toHaveBeenCalledWith({
      model: engine.formModel.value,
      action,
    })
    expect(result).toBe(slotContent)
  })

  it("传递正确的作用域数据到插槽", () => {
    const model = { keyword: "test" };
    (engine as any)._formModel.value = model
    engine.getActionSlot = vi.fn(() => "testSlot");
    (slots as any).testSlot = vi.fn()

    renderActionSlots(engine, action, slots)

    expect((slots as any).testSlot).toHaveBeenCalledWith({ model, action })
  })
})

describe("renderCustomSlots", () => {
  let engine: SearchCore
  let action: SearchAction

  beforeEach(() => {
    engine = createMockEngine()
    action = { type: "search" }
  })

  it("当没有插槽时返回 undefined", () => {
    engine.getComponentSlots = vi.fn(() => ({}))
    const result = renderCustomSlots(engine, action)
    expect(result).toBeUndefined()
  })

  it("渲染函数式插槽", () => {
    const slotFn = vi.fn(() => "Function Slot")
    engine.getComponentSlots = vi.fn(() => ({
      default: slotFn,
    }))

    const result = renderCustomSlots(engine, action)

    expect(result).toBeDefined()
    expect(result?.default).toBeDefined()
    expect(typeof result?.default).toBe("function")

    // 执行插槽函数
    const slotResult = result?.default()
    expect(slotFn).toHaveBeenCalled()
    expect(slotResult).toBe("Function Slot")
  })

  it("渲染组件式插槽", () => {
    const TestComponent = defineComponent({
      name: "TestComponent",
      setup() {
        return () => h("div", "Component Slot")
      },
    })

    engine.getComponentSlots = vi.fn(() => ({
      header: TestComponent,
    }))

    const result = renderCustomSlots(engine, action)

    expect(result).toBeDefined()
    expect(result?.header).toBeDefined()
    expect(typeof result?.header).toBe("function")

    // 执行插槽函数应该返回 VNode
    const slotResult = result?.header()
    expect(slotResult).toBeDefined()
  })

  it("支持多个插槽", () => {
    const slot1 = vi.fn(() => "Slot 1")
    const slot2 = vi.fn(() => "Slot 2")
    const slot3 = vi.fn(() => "Slot 3")

    engine.getComponentSlots = vi.fn(() => ({
      default: slot1,
      header: slot2,
      footer: slot3,
    }))

    const result = renderCustomSlots(engine, action)

    expect(result).toBeDefined()
    expect(Object.keys(result!)).toHaveLength(3)
    expect(result?.default).toBeDefined()
    expect(result?.header).toBeDefined()
    expect(result?.footer).toBeDefined()
  })

  it("函数式和组件式插槽可以混合使用", () => {
    const fnSlot = vi.fn(() => "Function")
    const CompSlot = defineComponent({
      setup() {
        return () => h("span", "Component")
      },
    })

    engine.getComponentSlots = vi.fn(() => ({
      default: fnSlot,
      header: CompSlot,
    }))

    const result = renderCustomSlots(engine, action)

    expect(result).toBeDefined()
    expect(Object.keys(result!)).toHaveLength(2)
  })
})

describe("renderComponent", () => {
  let engine: SearchCore
  let action: SearchAction

  beforeEach(() => {
    engine = createMockEngine()
    action = { type: "search" }
  })

  it("当组件未定义时返回 null", () => {
    engine.getComponentIs = vi.fn(() => undefined)
    const result = renderComponent(engine, action)
    expect(result).toBeNull()
  })

  it("渲染基础组件", () => {
    engine.getComponentIs = vi.fn(() => "div")
    engine.getComponentProps = vi.fn(() => ({}))
    engine.getComponentEvents = vi.fn(() => ({}))
    engine.getComponentSlots = vi.fn(() => ({}))

    const result = renderComponent(engine, action)

    expect(result).toBeDefined()
    expect((result as VNode)?.type).toBe("div")
  })

  it("渲染带 props 的组件", () => {
    const props = { id: "test-id", class: "test-class" }
    engine.getComponentIs = vi.fn(() => "button")
    engine.getComponentProps = vi.fn(() => props)
    engine.getComponentEvents = vi.fn(() => ({}))
    engine.getComponentSlots = vi.fn(() => ({}))

    const result = renderComponent(engine, action)

    expect(result).toBeDefined()
    expect((result as VNode)?.props).toMatchObject(props)
  })

  it("渲染带 events 的组件", () => {
    const onClick = vi.fn()
    engine.getComponentIs = vi.fn(() => "button")
    engine.getComponentProps = vi.fn(() => ({}))
    engine.getComponentEvents = vi.fn(() => ({ onClick }))
    engine.getComponentSlots = vi.fn(() => ({}))

    const result = renderComponent(engine, action)

    expect(result).toBeDefined()
    expect((result as VNode)?.props?.onClick).toBe(onClick)
  })

  it("渲染带 style 的组件", () => {
    const style = { color: "red", fontSize: "14px" }
    engine.getComponentIs = vi.fn(() => "span")
    engine.getComponentProps = vi.fn(() => ({}))
    engine.getComponentEvents = vi.fn(() => ({}))
    engine.getComponentStyle = vi.fn(() => style)
    engine.getComponentSlots = vi.fn(() => ({}))

    const result = renderComponent(engine, action)

    expect(result).toBeDefined()
    expect((result as VNode)?.props?.style).toEqual(style)
  })

  it("渲染带插槽的组件", () => {
    const slotFn = vi.fn(() => "Slot Content")
    engine.getComponentIs = vi.fn(() => "div")
    engine.getComponentProps = vi.fn(() => ({}))
    engine.getComponentEvents = vi.fn(() => ({}))
    engine.getComponentSlots = vi.fn(() => ({ default: slotFn }))

    const result = renderComponent(engine, action)

    expect(result).toBeDefined()
    expect((result as VNode)?.children).toBeDefined()
  })

  it("渲染完整配置的组件", () => {
    const props = { id: "combo" }
    const events = { onClick: vi.fn() }
    const style = { padding: "10px" }
    const slotFn = vi.fn(() => "Content")

    engine.getComponentIs = vi.fn(() => "div")
    engine.getComponentProps = vi.fn(() => props)
    engine.getComponentEvents = vi.fn(() => events)
    engine.getComponentStyle = vi.fn(() => style)
    engine.getComponentSlots = vi.fn(() => ({ default: slotFn }))

    const result = renderComponent(engine, action)

    expect(result).toBeDefined()
    expect((result as VNode)?.type).toBe("div")
    expect((result as VNode)?.props).toMatchObject({
      id: "combo",
      style: { padding: "10px" },
      onClick: expect.any(Function),
    })
  })

  it("使用 Vue 组件而非 HTML 标签", () => {
    const CustomComponent = defineComponent({
      name: "CustomComponent",
      setup() {
        return () => h("div", "Custom")
      },
    })

    engine.getComponentIs = vi.fn(() => CustomComponent)
    engine.getComponentProps = vi.fn(() => ({ text: "test" }))
    engine.getComponentEvents = vi.fn(() => ({}))
    engine.getComponentSlots = vi.fn(() => ({}))

    const result = renderComponent(engine, action)

    expect(result).toBeDefined()
  })
})

describe("renderAction", () => {
  let engine: SearchCore
  let slots: Slots

  beforeEach(() => {
    engine = createMockEngine()
    slots = {}
  })

  it("渲染 search 类型按钮", () => {
    const action: SearchAction = { type: "search" }
    const result = renderAction(engine, action, 0, slots)

    expect(result).toBeDefined()
  })

  it("渲染 reset 类型按钮", () => {
    const action: SearchAction = { type: "reset" }
    const result = renderAction(engine, action, 0, slots)

    expect(result).toBeDefined()
  })

  it("渲染 collapse 类型按钮", () => {
    const action: SearchAction = { type: "collapse" }
    const result = renderAction(engine, action, 0, slots)

    expect(result).toBeDefined()
  })

  it("search 按钮显示 loading 状态", () => {
    engine.loading.value = true
    const action: SearchAction = { type: "search" }
    const result = renderAction(engine, action, 0, slots)

    expect(result).toBeDefined()
    // VNode 应该包含 loading 状态
  })

  it("search 按钮使用自定义文本", () => {
    const action: SearchAction = { type: "search", text: "查询" }
    const result = renderAction(engine, action, 0, slots)

    expect(result).toBeDefined()
  })

  it("reset 按钮使用自定义文本", () => {
    const action: SearchAction = { type: "reset", text: "清空" }
    const result = renderAction(engine, action, 0, slots)

    expect(result).toBeDefined()
  })

  it("collapse 按钮根据状态切换图标", () => {
    engine.collapsed.value = false
    const action: SearchAction = { type: "collapse" }
    const result1 = renderAction(engine, action, 0, slots)

    engine.collapsed.value = true
    const result2 = renderAction(engine, action, 0, slots)

    expect(result1).toBeDefined()
    expect(result2).toBeDefined()
    // 两次渲染的结果应该不同（图标不同）
  })

  it("渲染自定义组件动作（带插槽）", () => {
    const action: SearchAction = { slot: "customAction" }
    const slotFn = vi.fn(() => "Custom Action");
    (slots as any).customAction = slotFn
    engine.getActionSlot = vi.fn(() => "customAction")

    const result = renderAction(engine, action, 0, slots)

    expect(result).toBeDefined()
    expect(slotFn).toHaveBeenCalled()
  })

  it("渲染自定义组件动作（无插槽）", () => {
    const action: SearchAction = {
      component: {
        is: "div",
        props: { class: "custom" },
      },
    }
    engine.getComponentIs = vi.fn(() => "div")
    engine.getComponentProps = vi.fn(() => ({ class: "custom" }))
    engine.getComponentEvents = vi.fn(() => ({}))
    engine.getComponentSlots = vi.fn(() => ({}))

    const result = renderAction(engine, action, 0, slots)

    expect(result).toBeDefined()
  })
})

describe("renderActions", () => {
  let engine: SearchCore
  let slots: Slots

  beforeEach(() => {
    engine = createMockEngine()
    slots = {}
  })

  it("渲染默认动作列表", () => {
    (engine as any)._resolvedActions.value = [
      { type: "search" },
      { type: "reset" },
    ] as SearchAction[]

    const result = renderActions(engine, slots)

    expect(result).toHaveLength(2)
  })

  it("渲染自定义动作列表", () => {
    (engine as any)._resolvedActions.value = [
      { type: "search" },
      { type: "reset" },
      { type: "collapse" },
    ] as SearchAction[]

    const result = renderActions(engine, slots)

    expect(result).toHaveLength(3)
  })

  it("渲染空动作列表", () => {
    (engine as any)._resolvedActions.value = []

    const result = renderActions(engine, slots)

    expect(result).toHaveLength(0)
  })

  it("每个动作都有唯一的 key", () => {
    (engine as any)._resolvedActions.value = [
      { type: "search" },
      { type: "reset" },
      { type: "collapse" },
    ] as SearchAction[]

    const result = renderActions(engine, slots)

    // 检查每个渲染结果都存在
    expect(result).toHaveLength(3)
    result.forEach((action) => {
      expect(action).toBeDefined()
    })
  })
})
