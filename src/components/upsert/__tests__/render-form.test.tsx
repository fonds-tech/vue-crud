import type { Directive } from "vue"
import type { UpsertOptions } from "../interface"
import type { FormRef, FormRecord } from "../../form/interface"
import { h, ref } from "vue"
import { renderForm } from "../render/form"
import { mount, config } from "@vue/test-utils"
import { it, vi, expect, describe, beforeAll } from "vitest"

// 忽略 Element Plus 组件警告
beforeAll(() => {
  config.global.stubs = {
    FdForm: {
      name: "FdForm",
      template: "<div class=\"fd-form\"><slot /></div>",
      props: ["element-loading-text"],
    },
  }
})

// isFormRef 类型守卫的直接测试需要导出该函数
// 由于它是私有函数，我们通过 renderForm 的行为间接测试
describe("renderForm", () => {
  // 创建渲染上下文工厂函数
  function createRenderContext(overrides: Partial<Parameters<typeof renderForm>[0]> = {}) {
    const defaultContext = {
      options: {
        key: 0,
        mode: "add" as const,
        form: {},
        model: {},
        items: [],
        group: {},
        grid: { cols: 1 },
        actions: [],
        dialog: { width: "60%", loadingText: "加载中..." },
      } as UpsertOptions<FormRecord>,
      state: {
        loading: ref(false),
        formRef: ref<FormRef<FormRecord> | undefined>(undefined),
      },
      loadingDirective: undefined as Directive | undefined,
      handleFormSlots: () => ({}),
      setFormRef: vi.fn(),
    }
    return { ...defaultContext, ...overrides } as Parameters<typeof renderForm>[0]
  }

  describe("基础渲染", () => {
    it("渲染基础表单", () => {
      const context = createRenderContext()

      const result = renderForm(context)

      expect(result).toBeDefined()
      expect(result.type).toBeDefined()
    })

    it("传递 loadingText 到表单", () => {
      const context = createRenderContext({
        options: {
          key: 0,
          mode: "add",
          form: {},
          model: {},
          items: [],
          group: {},
          grid: { cols: 1 },
          actions: [],
          dialog: { width: "60%", loadingText: "正在处理..." },
        } as UpsertOptions<FormRecord>,
      })

      const result = renderForm(context)

      // 验证 VNode 的 props 中包含 loadingText
      expect(result.props).toHaveProperty("element-loading-text", "正在处理...")
    })
  })

  describe("formRef 设置", () => {
    it("有效的 FormRef 调用 setFormRef", () => {
      const setFormRefMock = vi.fn()
      const context = createRenderContext({
        setFormRef: setFormRefMock,
      })

      const result = renderForm(context)

      // 模拟 ref 回调被调用
      const refCallback = result.props?.ref as ((value: unknown) => void) | undefined
      if (typeof refCallback === "function") {
        const mockFormRef = {
          submit: vi.fn(),
          use: vi.fn(),
          model: {},
        }
        refCallback(mockFormRef)
        expect(setFormRefMock).toHaveBeenCalledWith(mockFormRef)
      }
    })

    it("无效的 FormRef 不调用 setFormRef", () => {
      const setFormRefMock = vi.fn()
      const context = createRenderContext({
        setFormRef: setFormRefMock,
      })

      const result = renderForm(context)

      // 模拟 ref 回调被调用，传入无效值
      const refCallback = result.props?.ref as ((value: unknown) => void) | undefined
      if (typeof refCallback === "function") {
        // 无效的 FormRef (缺少 submit 或 use)
        refCallback({ model: {} })
        expect(setFormRefMock).not.toHaveBeenCalled()

        // null 值
        refCallback(null)
        expect(setFormRefMock).not.toHaveBeenCalled()

        // undefined 值
        refCallback(undefined)
        expect(setFormRefMock).not.toHaveBeenCalled()

        // 非对象值
        refCallback("string")
        expect(setFormRefMock).not.toHaveBeenCalled()
      }
    })
  })

  describe("loading Directive", () => {
    it("有 loadingDirective 时通过 mount 正确应用指令", () => {
      let directiveApplied = false
      const mockDirective: Directive = {
        mounted: () => {
          directiveApplied = true
        },
      }
      const context = createRenderContext({
        loadingDirective: mockDirective,
        state: {
          loading: ref(true),
          formRef: ref(undefined),
        },
      })

      // 通过 mount 在真正的渲染上下文中测试
      mount({
        render: () => renderForm(context),
      })

      expect(directiveApplied).toBe(true)
    })

    it("无 loadingDirective 时直接返回表单", () => {
      const context = createRenderContext({
        loadingDirective: undefined,
      })

      const result = renderForm(context)

      // 无指令时，VNode 不应该有 dirs 或 dirs 为 null
      expect(result.dirs === undefined || result.dirs === null).toBe(true)
    })

    it("loading 值正确传递给指令", () => {
      let capturedValue: boolean | undefined
      const mockDirective: Directive = {
        mounted: (_el, binding) => {
          capturedValue = binding.value
        },
      }
      const loadingRef = ref(false)
      const context = createRenderContext({
        loadingDirective: mockDirective,
        state: {
          loading: loadingRef,
          formRef: ref(undefined),
        },
      })

      mount({
        render: () => renderForm(context),
      })

      expect(capturedValue).toBe(false)
    })

    it("loading 为 true 时指令接收 true", () => {
      let capturedValue: boolean | undefined
      const mockDirective: Directive = {
        mounted: (_el, binding) => {
          capturedValue = binding.value
        },
      }
      const context = createRenderContext({
        loadingDirective: mockDirective,
        state: {
          loading: ref(true),
          formRef: ref(undefined),
        },
      })

      mount({
        render: () => renderForm(context),
      })

      expect(capturedValue).toBe(true)
    })
  })

  describe("表单插槽", () => {
    it("调用 handleFormSlots 获取插槽", () => {
      const handleFormSlotsMock = vi.fn().mockReturnValue({
        default: () => h("div", "默认插槽内容"),
      })
      const context = createRenderContext({
        handleFormSlots: handleFormSlotsMock,
      })

      renderForm(context)

      expect(handleFormSlotsMock).toHaveBeenCalled()
    })
  })
})

describe("isFormRef 类型守卫", () => {
  // 通过 renderForm 的 ref 回调间接测试 isFormRef

  // 创建渲染上下文工厂函数
  function createTestContext(setFormRefMock: ReturnType<typeof vi.fn>) {
    return {
      options: {
        key: 0,
        mode: "add" as const,
        form: {},
        model: {},
        items: [],
        group: {},
        grid: { cols: 1 },
        actions: [],
        dialog: { width: "60%" },
      } as UpsertOptions<FormRecord>,
      state: {
        loading: ref(false),
        formRef: { value: undefined } as { value?: FormRef<FormRecord> },
      },
      loadingDirective: undefined,
      handleFormSlots: () => ({}),
      setFormRef: setFormRefMock,
    } as Parameters<typeof renderForm>[0]
  }

  it("有 submit 和 use 的对象是有效的 FormRef", () => {
    const setFormRefMock = vi.fn()
    const context = createTestContext(setFormRefMock)

    const result = renderForm(context)
    const refCallback = result.props?.ref as ((value: unknown) => void) | undefined

    if (typeof refCallback === "function") {
      // 有效的 FormRef
      refCallback({ submit: vi.fn(), use: vi.fn() })
      expect(setFormRefMock).toHaveBeenCalledTimes(1)

      // 只有 submit
      refCallback({ submit: vi.fn() })
      expect(setFormRefMock).toHaveBeenCalledTimes(1) // 不应增加

      // 只有 use
      refCallback({ use: vi.fn() })
      expect(setFormRefMock).toHaveBeenCalledTimes(1) // 不应增加
    }
  })
})
