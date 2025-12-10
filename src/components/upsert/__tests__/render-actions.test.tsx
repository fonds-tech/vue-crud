import type { UpsertAction } from "../interface"
import { mount } from "@vue/test-utils"
import { h, ref, computed } from "vue"
import { it, vi, expect, describe } from "vitest"
import { renderFooter, renderActions } from "../render/actions"

// 创建渲染上下文工厂函数
function createRenderContext(overrides: Partial<Parameters<typeof renderActions>[0]> = {}) {
  const defaultContext = {
    options: { actions: [] as UpsertAction[] },
    state: {
      mode: ref<"add" | "update">("add"),
      loading: ref(false),
      formModel: computed(() => ({ name: "测试" })),
    },
    service: {
      close: vi.fn(),
      submit: vi.fn().mockResolvedValue(undefined),
      handleNext: vi.fn(),
      handlePrev: vi.fn(),
    },
    actionHelpers: {
      resolveActionText: (action: UpsertAction) => (action.text as string) || "默认文本",
      isActionVisible: () => true,
    },
    componentHelper: {
      slotNameOf: () => undefined,
      componentOf: () => undefined,
      componentProps: () => ({}),
      componentStyle: () => undefined,
      componentEvents: () => ({}),
      componentSlots: () => ({}),
    },
    exposeSlots: {},
  }
  return { ...defaultContext, ...overrides } as Parameters<typeof renderActions>[0]
}

describe("renderActions", () => {
  describe("基础动作类型渲染", () => {
    it("渲染 cancel 类型按钮", () => {
      const context = createRenderContext({
        options: { actions: [{ type: "cancel", text: "取消" }] },
      })

      const result = renderActions(context)

      expect(result).toHaveLength(1)
      expect(result[0]).toBeDefined()
    })

    it("渲染 ok 类型按钮", () => {
      const context = createRenderContext({
        options: { actions: [{ type: "ok", text: "确定" }] },
      })

      const result = renderActions(context)

      expect(result).toHaveLength(1)
      expect(result[0]).toBeDefined()
    })

    it("渲染 next 类型按钮", () => {
      const context = createRenderContext({
        options: { actions: [{ type: "next", text: "下一步" }] },
      })

      const result = renderActions(context)

      expect(result).toHaveLength(1)
      expect(result[0]).toBeDefined()
    })

    it("渲染 prev 类型按钮", () => {
      const context = createRenderContext({
        options: { actions: [{ type: "prev", text: "上一步" }] },
      })

      const result = renderActions(context)

      expect(result).toHaveLength(1)
      expect(result[0]).toBeDefined()
    })

    it("多个动作按顺序渲染", () => {
      const context = createRenderContext({
        options: {
          actions: [
            { type: "cancel", text: "取消" },
            { type: "ok", text: "确定" },
          ],
        },
      })

      const result = renderActions(context)

      expect(result).toHaveLength(2)
    })
  })

  describe("动作可见性", () => {
    it("隐藏不可见动作", () => {
      const context = createRenderContext({
        options: { actions: [{ type: "ok", text: "确定" }] },
        actionHelpers: {
          resolveActionText: () => "确定",
          isActionVisible: () => false, // 不可见
        },
      })

      const result = renderActions(context)

      expect(result[0]).toBeNull()
    })

    it("显示可见动作", () => {
      const context = createRenderContext({
        options: { actions: [{ type: "ok", text: "确定" }] },
        actionHelpers: {
          resolveActionText: () => "确定",
          isActionVisible: () => true, // 可见
        },
      })

      const result = renderActions(context)

      expect(result[0]).not.toBeNull()
    })
  })

  describe("按钮点击事件", () => {
    it("cancel 按钮点击调用 close", () => {
      const closeMock = vi.fn()
      const context = createRenderContext({
        options: { actions: [{ type: "cancel", text: "取消" }] },
        service: {
          close: closeMock,
          submit: vi.fn(),
          handleNext: vi.fn(),
          handlePrev: vi.fn(),
        },
      })

      const result = renderActions(context)
      const wrapper = mount({
        render: () => h("div", result),
      })

      wrapper.find("button").trigger("click")
      expect(closeMock).toHaveBeenCalledWith("cancel")
    })

    it("ok 按钮点击调用 submit", () => {
      const submitMock = vi.fn().mockResolvedValue(undefined)
      const context = createRenderContext({
        options: { actions: [{ type: "ok", text: "确定" }] },
        service: {
          close: vi.fn(),
          submit: submitMock,
          handleNext: vi.fn(),
          handlePrev: vi.fn(),
        },
      })

      const result = renderActions(context)
      const wrapper = mount({
        render: () => h("div", result),
      })

      wrapper.find("button").trigger("click")
      expect(submitMock).toHaveBeenCalled()
    })

    it("next 按钮点击调用 handleNext", () => {
      const handleNextMock = vi.fn()
      const context = createRenderContext({
        options: { actions: [{ type: "next", text: "下一步" }] },
        service: {
          close: vi.fn(),
          submit: vi.fn(),
          handleNext: handleNextMock,
          handlePrev: vi.fn(),
        },
      })

      const result = renderActions(context)
      const wrapper = mount({
        render: () => h("div", result),
      })

      wrapper.find("button").trigger("click")
      expect(handleNextMock).toHaveBeenCalled()
    })

    it("prev 按钮点击调用 handlePrev", () => {
      const handlePrevMock = vi.fn()
      const context = createRenderContext({
        options: { actions: [{ type: "prev", text: "上一步" }] },
        service: {
          close: vi.fn(),
          submit: vi.fn(),
          handleNext: vi.fn(),
          handlePrev: handlePrevMock,
        },
      })

      const result = renderActions(context)
      const wrapper = mount({
        render: () => h("div", result),
      })

      wrapper.find("button").trigger("click")
      expect(handlePrevMock).toHaveBeenCalled()
    })
  })

  describe("自定义组件/插槽", () => {
    it("渲染自定义插槽动作", () => {
      const customSlot = vi.fn().mockReturnValue(h("span", "自定义内容"))
      const context = createRenderContext({
        options: {
          actions: [{ component: { slot: "custom-action" } } as any],
        },
        componentHelper: {
          slotNameOf: () => "custom-action",
          componentOf: () => undefined,
          componentProps: () => ({}),
          componentStyle: () => undefined,
          componentEvents: () => ({}),
          componentSlots: () => ({}),
        },
        exposeSlots: {
          "custom-action": customSlot,
        },
      })

      renderActions(context)

      expect(customSlot).toHaveBeenCalledWith({
        index: 0,
        mode: "add",
        model: { name: "测试" },
      })
    })

    it("渲染自定义组件动作", () => {
      const CustomButton = {
        name: "CustomButton",
        render: () => h("button", "自定义按钮"),
      }
      const context = createRenderContext({
        options: {
          actions: [{ component: { is: CustomButton } } as any],
        },
        componentHelper: {
          slotNameOf: () => undefined,
          componentOf: () => CustomButton,
          componentProps: () => ({ label: "测试" }),
          componentStyle: () => ({ color: "red" }),
          componentEvents: () => ({ onClick: vi.fn() }),
          componentSlots: () => ({}),
        },
      })

      const result = renderActions(context)

      expect(result[0]).toBeDefined()
    })

    it("渲染带子插槽的自定义组件", () => {
      const ChildComponent = {
        name: "ChildComponent",
        render: () => h("span", "子组件"),
      }
      const CustomButton = {
        name: "CustomButton",
        render: () => h("button", "自定义按钮"),
      }
      const context = createRenderContext({
        options: {
          actions: [{ component: { is: CustomButton } } as any],
        },
        componentHelper: {
          slotNameOf: () => undefined,
          componentOf: () => CustomButton,
          componentProps: () => ({}),
          componentStyle: () => undefined,
          componentEvents: () => ({}),
          componentSlots: () => ({
            default: ChildComponent,
          }),
        },
      })

      const result = renderActions(context)

      expect(result[0]).toBeDefined()
    })

    it("无组件返回 null", () => {
      const context = createRenderContext({
        options: {
          actions: [{ component: undefined } as any],
        },
        componentHelper: {
          slotNameOf: () => undefined,
          componentOf: () => undefined,
          componentProps: () => ({}),
          componentStyle: () => undefined,
          componentEvents: () => ({}),
          componentSlots: () => ({}),
        },
      })

      const result = renderActions(context)

      expect(result[0]).toBeNull()
    })
  })

  describe("loading 状态", () => {
    it("ok 按钮显示 loading 状态", () => {
      const context = createRenderContext({
        options: { actions: [{ type: "ok", text: "确定" }] },
        state: {
          mode: ref<"add" | "update">("add"),
          loading: ref(true), // loading 中
          formModel: computed(() => ({})),
        },
      })

      const result = renderActions(context)
      const wrapper = mount({
        render: () => h("div", result),
      })

      // 验证按钮有 loading 类
      expect(wrapper.find(".is-loading").exists()).toBe(true)
    })
  })
})

describe("renderFooter", () => {
  it("渲染底部区域容器", () => {
    const context = createRenderContext({
      options: { actions: [{ type: "ok", text: "确定" }] },
    })

    const result = renderFooter(context)
    const wrapper = mount({
      render: () => result,
    })

    expect(wrapper.find(".fd-upsert__footer").exists()).toBe(true)
  })

  it("底部区域包含动作按钮", () => {
    const context = createRenderContext({
      options: {
        actions: [
          { type: "cancel", text: "取消" },
          { type: "ok", text: "确定" },
        ],
      },
    })

    const result = renderFooter(context)
    const wrapper = mount({
      render: () => result,
    })

    expect(wrapper.findAll("button")).toHaveLength(2)
  })
})
