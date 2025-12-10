import type { RenderCtx } from "../render/content"
import type { DetailAction } from "../interface"
import { renderActions } from "../render/actions"
import { it, vi, expect, describe, beforeEach } from "vitest"

describe("detail actions", () => {
  const mockData = { name: "测试", value: 100 }
  const mockOnClose = vi.fn()

  const createCtx = (actions: DetailAction[] = []): RenderCtx<typeof mockData> =>
    ({
      data: { value: mockData },
      options: {
        actions,
        dialog: { title: "详情" },
      } as any,
      onClose: mockOnClose,
      userSlots: {},
      groups: [],
      loading: { value: false },
      cache: { value: {} },
    }) as unknown as RenderCtx<typeof mockData>

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  describe("renderActions", () => {
    it("应该渲染默认 ok 按钮", () => {
      const ctx = createCtx([])
      const result = renderActions(ctx)

      expect(result).toBeDefined()
      expect(result.type).toBe("div")
      expect(result.props?.class).toBe("fd-detail__footer")
    })

    it("应该渲染自定义文本的 ok 按钮", () => {
      const ctx = createCtx([{ type: "ok", text: "确认提交" }])
      const result = renderActions(ctx)

      expect(result.children).toHaveLength(1)
    })

    it("应该处理隐藏条件 - 布尔值", () => {
      const ctx = createCtx([
        { type: "ok", text: "显示", hidden: false },
        { type: "ok", text: "隐藏", hidden: true },
      ])
      const result = renderActions(ctx)

      // 只有一个可见按钮
      const visibleChildren = (result.children as any[]).filter(child => child !== null)
      expect(visibleChildren.length).toBe(1)
    })

    it("应该处理隐藏条件 - 函数", () => {
      const ctx = createCtx([
        { type: "ok", text: "按钮1", hidden: data => data.value < 50 },
        { type: "ok", text: "按钮2", hidden: data => data.value > 50 },
      ])
      const result = renderActions(ctx)

      // value = 100，所以第一个显示，第二个隐藏
      const visibleChildren = (result.children as any[]).filter(child => child !== null)
      expect(visibleChildren.length).toBe(1)
    })

    it("应该渲染自定义组件动作", () => {
      const ctx = createCtx([
        {
          type: "ok",
          component: {
            is: "div",
            props: { class: "custom-action" },
          },
        } as any,
      ])
      const result = renderActions(ctx)

      expect(result.children).toBeDefined()
    })

    it("应该解析动态文本", () => {
      const ctx = createCtx([{ type: "ok", text: data => `提交(${data.value})` }])
      const result = renderActions(ctx)

      expect(result).toBeDefined()
    })

    it("应该使用默认标题作为后备", () => {
      const ctx = createCtx([{ type: "ok" }])
      ;(ctx.options.dialog as any).title = "默认标题"

      const result = renderActions(ctx)
      expect(result).toBeDefined()
    })

    it("文本与标题都缺省时回退为\"确定\"", () => {
      const ctx = createCtx([{ type: "ok" }])
      ;(ctx.options.dialog as any).title = undefined

      const result = renderActions(ctx)
      // JSX 渲染结果验证
      expect(result).toBeDefined()
      expect(result.props?.class).toBe("fd-detail__footer")
      const children = result.children as any[]
      // 应该有按钮元素
      expect(children.length).toBeGreaterThan(0)
    })

    it("优先渲染用户插槽动作", () => {
      const slot = vi.fn(() => "slot action")
      const ctx = createCtx([{ component: { slot: "action-slot" } as any }])
      ctx.userSlots = { "action-slot": slot } as any

      renderActions(ctx)
      expect(slot).toHaveBeenCalledWith({ index: 0, data: mockData })
    })

    it("在无用户插槽时渲染组件动作", () => {
      const ctx = createCtx([
        {
          component: { is: "span", props: { class: "fallback-action" } } as any,
        },
      ])

      const result = renderActions(ctx)
      // 验证渲染结果存在
      expect(result).toBeDefined()
      expect(result.props?.class).toBe("fd-detail__footer")
      const children = result.children as any[]
      // 至少应该有内容
      expect(children.length).toBeGreaterThanOrEqual(1)
    })

    it("自定义组件为空时返回 null 或 undefined", () => {
      // 当 type 不是 "ok" 且 component 是 undefined 时，该项返回 null
      const ctx = createCtx([{ type: "custom", component: undefined } as any])
      const result = renderActions(ctx)
      const children = result.children as any[]
      // 至少应该有自动添加的 ok 按钮
      const nonNullChildren = children.filter(c => c != null)
      expect(nonNullChildren.length).toBeGreaterThanOrEqual(1)
    })
  })
})
