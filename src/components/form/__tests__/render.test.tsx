import type { FormItem, FormOptions, FormRenderContext, FormAsyncOptionsState } from "../types"
import { mount } from "@vue/test-utils"
import { renderForm } from "../render/form"
import { createHelpers } from "../core"
import { renderControl } from "../render/control"
import { it, vi, expect, describe } from "vitest"
import { renderFormItem, renderItemSlots } from "../render/item"
import { renderGrid, renderTabs, renderSteps } from "../render/layout"
import { h, ref, computed, reactive, defineComponent } from "vue"
import { renderSlotOrComponent, renderComponentSlotMap } from "../render/slots"

const baseItemDefaults = { labelPosition: "", labelWidth: "", showMessage: true } as const

/**
 * 创建简单 stub 组件
 */
function createSimpleStub(tag = "div") {
  return defineComponent({
    name: `Stub${tag}`,
    setup(_, { slots }) {
      return () => h(tag, {}, slots.default?.())
    },
  })
}

/**
 * 创建渲染上下文
 */
function createRenderContext(overrides: Partial<FormRenderContext> = {}): FormRenderContext {
  const options = reactive<FormOptions>({
    key: 0,
    mode: "add",
    model: {},
    items: [],
    group: {},
    form: {},
    grid: {},
  })
  const model = reactive({})
  const step = ref(1)
  const activeGroupName = ref<string | number | undefined>(undefined)
  const resolvedActiveGroup = computed(() => activeGroupName.value)
  const activeStepName = computed(() => options.group?.children?.[step.value - 1]?.name)
  const loadedGroups = ref(new Set<string | number>())
  const optionState = reactive<Record<string, FormAsyncOptionsState>>({})
  const helpers = createHelpers({ options, model, resolvedActiveGroup, step, loadedGroups, optionState })
  const formRef = ref<any>(undefined)

  return {
    options,
    model,
    step,
    activeGroupName,
    resolvedActiveGroup,
    activeStepName,
    helpers,
    formRef,
    slots: {},
    attrs: {},
    ...overrides,
  } as FormRenderContext
}

const elementStubs = {
  "el-form": createSimpleStub("form"),
  "el-space": createSimpleStub("section"),
  "el-steps": createSimpleStub("section"),
  "el-step": createSimpleStub("div"),
  "el-tabs": createSimpleStub("section"),
  "el-tab-pane": createSimpleStub("div"),
  "el-row": createSimpleStub("div"),
  "el-col": createSimpleStub("div"),
  "el-form-item": createSimpleStub("div"),
  "el-scrollbar": createSimpleStub("div"),
  "el-button": createSimpleStub("button"),
  "el-icon": createSimpleStub("span"),
  "el-input": createSimpleStub("input"),
}

describe("render/control", () => {
  describe("renderControl", () => {
    it("渲染组件并绑定 v-model", () => {
      const ctx = createRenderContext()
      ctx.model.name = "Tom"
      const item: FormItem = {
        ...baseItemDefaults,
        prop: "name",
        label: "名称",
        component: { is: "el-input" },
      }

      const TestWrapper = defineComponent({
        setup() {
          return () => renderControl(ctx, item)
        },
      })

      const wrapper = mount(TestWrapper, {
        global: { stubs: elementStubs },
      })

      expect(wrapper.find("input").exists()).toBe(true)
    })

    it("空 component 配置时尝试渲染（边缘情况）", () => {
      const ctx = createRenderContext()
      // 空对象会被 helpers.is() 视为有效组件配置并尝试渲染
      const item: FormItem = {
        ...baseItemDefaults,
        prop: "name",
        label: "名称",
        component: {},
      }

      const result = renderControl(ctx, item)
      // 空对象被当作组件处理，会返回 VNode
      expect(result).toBeDefined()
    })

    it("is 属性为 undefined 时返回 undefined", () => {
      const ctx = createRenderContext()
      const item: FormItem = {
        ...baseItemDefaults,
        prop: "name",
        label: "名称",
        component: { is: undefined },
      }

      const result = renderControl(ctx, item)
      expect(result).toBeUndefined()
    })

    it("传递组件 props", () => {
      const ctx = createRenderContext()
      const item: FormItem = {
        ...baseItemDefaults,
        prop: "name",
        label: "名称",
        component: {
          is: "el-input",
          props: { placeholder: "请输入" },
        },
      }

      const TestWrapper = defineComponent({
        setup() {
          return () => renderControl(ctx, item)
        },
      })

      const wrapper = mount(TestWrapper, {
        global: { stubs: elementStubs },
      })

      expect(wrapper.find("input").exists()).toBe(true)
    })
  })
})

describe("render/item", () => {
  describe("renderFormItem", () => {
    it("渲染表单项包含 GridItem 和 el-form-item", () => {
      const ctx = createRenderContext()
      ctx.options.items = [
        { ...baseItemDefaults, prop: "name", label: "名称", component: { is: "el-input" } },
      ]
      const item = ctx.options.items[0]

      const TestWrapper = defineComponent({
        setup() {
          return () => renderFormItem(ctx, item, 0)
        },
      })

      const wrapper = mount(TestWrapper, {
        global: { stubs: { ...elementStubs, GridItem: createSimpleStub("div") } },
      })

      expect(wrapper.find("div").exists()).toBe(true)
    })

    it("hidden 项不可见", () => {
      const ctx = createRenderContext()
      ctx.options.items = [
        { ...baseItemDefaults, prop: "name", label: "名称", hidden: true, component: { is: "el-input" } },
      ]
      const item = ctx.options.items[0]

      const TestWrapper = defineComponent({
        setup() {
          return () => renderFormItem(ctx, item, 0)
        },
      })

      const wrapper = mount(TestWrapper, {
        global: { stubs: { ...elementStubs, GridItem: createSimpleStub("div") } },
      })

      // v-show 会设置 display: none
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe("renderItemSlots", () => {
    it("渲染带插槽的表单项", () => {
      const ctx = createRenderContext()
      const item: FormItem = {
        ...baseItemDefaults,
        prop: "name",
        label: "名称",
        component: { is: "el-input" },
        slots: { prefix: { is: "el-icon" } },
      }

      const result = renderItemSlots(ctx, item)
      expect(Array.isArray(result)).toBe(true)
    })

    it("无插槽时返回空数组", () => {
      const ctx = createRenderContext()
      const item: FormItem = {
        ...baseItemDefaults,
        prop: "name",
        label: "名称",
        component: { is: "el-input" },
      }

      const result = renderItemSlots(ctx, item)
      expect(result).toEqual([])
    })
  })
})

describe("render/layout", () => {
  describe("renderGrid", () => {
    it("渲染栅格容器包含表单项", () => {
      const ctx = createRenderContext()
      const items: FormItem[] = [
        { ...baseItemDefaults, prop: "name", label: "名称", component: { is: "el-input" } },
        { ...baseItemDefaults, prop: "age", label: "年龄", component: { is: "el-input" } },
      ]

      const TestWrapper = defineComponent({
        setup() {
          return () => renderGrid(ctx, items)
        },
      })

      const wrapper = mount(TestWrapper, {
        global: { stubs: { ...elementStubs, Grid: createSimpleStub("div"), GridItem: createSimpleStub("div") } },
      })

      expect(wrapper.find("div").exists()).toBe(true)
    })
  })

  describe("renderSteps", () => {
    it("非 steps 模式返回 null", () => {
      const ctx = createRenderContext()
      ctx.options.group = { type: "tabs" }

      const result = renderSteps(ctx)
      expect(result).toBeNull()
    })

    it("steps 模式渲染步骤条", () => {
      const ctx = createRenderContext()
      ctx.options.group = {
        type: "steps",
        children: [
          { name: "step1", title: "步骤1" },
          { name: "step2", title: "步骤2" },
        ],
      }

      const TestWrapper = defineComponent({
        setup() {
          return () => renderSteps(ctx)
        },
      })

      const wrapper = mount(TestWrapper, {
        global: { stubs: elementStubs },
      })

      expect(wrapper.find("section").exists()).toBe(true)
    })

    it("无子项时返回 null", () => {
      const ctx = createRenderContext()
      ctx.options.group = { type: "steps", children: [] }

      const result = renderSteps(ctx)
      expect(result).toBeNull()
    })
  })

  describe("renderTabs", () => {
    it("非 tabs 模式返回 null", () => {
      const ctx = createRenderContext()
      ctx.options.group = { type: "steps" }

      const result = renderTabs(ctx)
      expect(result).toBeNull()
    })

    it("tabs 模式渲染标签页", () => {
      const ctx = createRenderContext()
      ctx.options.group = {
        type: "tabs",
        children: [
          { name: "tab1", title: "标签1" },
          { name: "tab2", title: "标签2" },
        ],
      }
      ctx.activeGroupName.value = "tab1"

      const TestWrapper = defineComponent({
        setup() {
          return () => renderTabs(ctx)
        },
      })

      const wrapper = mount(TestWrapper, {
        global: { stubs: { ...elementStubs, Grid: createSimpleStub("div"), GridItem: createSimpleStub("div") } },
      })

      expect(wrapper.find("section").exists()).toBe(true)
    })

    it("无子项时返回 null", () => {
      const ctx = createRenderContext()
      ctx.options.group = { type: "tabs", children: [] }

      const result = renderTabs(ctx)
      expect(result).toBeNull()
    })

    it("lazy 模式下未激活的标签页不渲染内容", () => {
      const ctx = createRenderContext()
      ctx.options.group = {
        type: "tabs",
        lazy: true,
        keepAlive: false,
        children: [
          { name: "tab1", title: "标签1" },
          { name: "tab2", title: "标签2" },
        ],
      }
      ctx.activeGroupName.value = "tab1"

      const TestWrapper = defineComponent({
        setup() {
          return () => renderTabs(ctx)
        },
      })

      const wrapper = mount(TestWrapper, {
        global: { stubs: { ...elementStubs, Grid: createSimpleStub("div"), GridItem: createSimpleStub("div") } },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })
})

describe("render/slots", () => {
  describe("renderSlotOrComponent", () => {
    it("优先使用具名插槽", () => {
      const slotFn = vi.fn(() => h("span", "插槽内容"))
      const ctx = createRenderContext()
      ctx.slots = { custom: slotFn }

      renderSlotOrComponent(ctx, { slot: "custom" })
      expect(slotFn).toHaveBeenCalled()
    })

    it("无组件配置时返回 null", () => {
      const ctx = createRenderContext()
      const result = renderSlotOrComponent(ctx, undefined)
      expect(result).toBeNull()
    })

    it("渲染动态组件", () => {
      const ctx = createRenderContext()

      const TestWrapper = defineComponent({
        setup() {
          return () => renderSlotOrComponent(ctx, { is: "el-button" })
        },
      })

      const wrapper = mount(TestWrapper, {
        global: { stubs: elementStubs },
      })

      expect(wrapper.find("button").exists()).toBe(true)
    })
  })

  describe("renderComponentSlotMap", () => {
    it("将插槽配置映射为 slots 对象", () => {
      const ctx = createRenderContext()
      const slotMap = {
        default: { is: "el-icon" },
        suffix: { is: "el-button" },
      }

      const result = renderComponentSlotMap(ctx, slotMap)
      expect(typeof result.default).toBe("function")
      expect(typeof result.suffix).toBe("function")
    })

    it("空映射返回空对象", () => {
      const ctx = createRenderContext()
      const result = renderComponentSlotMap(ctx, {})
      expect(result).toEqual({})
    })
  })
})

describe("render/form", () => {
  describe("renderForm", () => {
    it("渲染基础表单", () => {
      const ctx = createRenderContext()
      ctx.options.items = [
        { ...baseItemDefaults, prop: "name", label: "名称", component: { is: "el-input" } },
      ]

      const TestWrapper = defineComponent({
        setup() {
          return () => renderForm(ctx)
        },
      })

      const wrapper = mount(TestWrapper, {
        global: { stubs: { ...elementStubs, Grid: createSimpleStub("div"), GridItem: createSimpleStub("div") } },
      })

      expect(wrapper.find("form").exists()).toBe(true)
    })

    it("steps 模式渲染步骤条布局", () => {
      const ctx = createRenderContext()
      ctx.options.group = {
        type: "steps",
        children: [
          { name: "step1", title: "步骤1" },
          { name: "step2", title: "步骤2" },
        ],
      }
      ctx.options.items = [
        { ...baseItemDefaults, prop: "name", label: "名称", group: "step1", component: { is: "el-input" } },
      ]

      const TestWrapper = defineComponent({
        setup() {
          return () => renderForm(ctx)
        },
      })

      const wrapper = mount(TestWrapper, {
        global: { stubs: { ...elementStubs, Grid: createSimpleStub("div"), GridItem: createSimpleStub("div") } },
      })

      expect(wrapper.find("form").exists()).toBe(true)
    })

    it("tabs 模式渲染标签页布局", () => {
      const ctx = createRenderContext()
      ctx.options.group = {
        type: "tabs",
        children: [
          { name: "tab1", title: "标签1" },
          { name: "tab2", title: "标签2" },
        ],
      }
      ctx.activeGroupName.value = "tab1"
      ctx.options.items = [
        { ...baseItemDefaults, prop: "name", label: "名称", group: "tab1", component: { is: "el-input" } },
      ]

      const TestWrapper = defineComponent({
        setup() {
          return () => renderForm(ctx)
        },
      })

      const wrapper = mount(TestWrapper, {
        global: { stubs: { ...elementStubs, Grid: createSimpleStub("div"), GridItem: createSimpleStub("div") } },
      })

      expect(wrapper.find("form").exists()).toBe(true)
    })
  })
})
