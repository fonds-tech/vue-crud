import Search from "../index"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import { it, vi, expect, describe, beforeEach } from "vitest"

// Hoist mocks
const mocks = vi.hoisted(() => ({
  mockFormSubmit: vi.fn(),
  mockFormCollapse: vi.fn(),
  mockFormUse: vi.fn(),
  mockFormResetFields: vi.fn(),
  mockFormClearValidate: vi.fn(),
  mockFormBindFields: vi.fn(),
  mockCrud: {
    refresh: vi.fn(),
    getParams: vi.fn(() => ({})),
    paramsReplace: vi.fn(p => p),
  },
  mockMitt: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}))

// Mock dependencies
vi.mock("../../../hooks", () => ({
  useCore: () => ({
    crud: mocks.mockCrud,
    mitt: mocks.mockMitt,
  }),
  useConfig: () => ({
    dict: {
      label: {
        search: "Search",
        reset: "Reset",
        collapse: "Collapse",
        expand: "Expand",
      },
    },
    style: {
      size: "default",
    },
  }),
}))

// Mock Form component with CORRECT relative path (../../form relative to __tests__)
vi.mock("../../form", async () => {
  const { h, defineComponent } = await import("vue")
  return {
    default: defineComponent({
      setup(_, { expose }) {
        expose({
          submit: mocks.mockFormSubmit,
          collapse: mocks.mockFormCollapse,
          use: mocks.mockFormUse,
          resetFields: mocks.mockFormResetFields,
          clearValidate: mocks.mockFormClearValidate,
          bindFields: mocks.mockFormBindFields,
          model: {},
        })
        return () => h("div", { class: "mock-form" }, "Mock Form")
      },
    }),
  }
})

// Mock Element Plus icons and components
vi.mock("@element-plus/icons-vue", () => ({
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
  RefreshRight: "RefreshRight",
  Search: "Search",
}))

describe("search Component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.mockFormSubmit.mockResolvedValue({ model: {}, errors: null })
  })

  it("renders correctly with default actions", async () => {
    const wrapper = mount(Search, {
      global: {
        stubs: {
          ElButton: {
            template: "<button class=\"el-button\"><slot /></button>",
            props: ["icon"],
          },
          ElRow: { template: "<div class=\"el-row\"><slot /></div>" },
          ElCol: { template: "<div class=\"el-col\"><slot /></div>" },
        },
      },
    })
    await nextTick()

    expect(wrapper.find(".fd-search").exists()).toBe(true)
    expect(wrapper.find(".mock-form").exists()).toBe(true)
    // Check for buttons
    const buttons = wrapper.findAll(".el-button")
    expect(buttons.length).toBe(3) // Search, Reset, Collapse
  })

  it("handles search action", async () => {
    const wrapper = mount(Search, {
      global: {
        stubs: {
          ElButton: {
            template: "<button class=\"el-button\" @click=\"$emit('click')\"><slot /></button>",
            props: ["icon"],
          },
          ElRow: { template: "<div class=\"el-row\"><slot /></div>" },
          ElCol: { template: "<div class=\"el-col\"><slot /></div>" },
        },
      },
    })
    await nextTick()

    // Setup form configuration
    const vm = wrapper.vm as any
    vm.use({
      form: {
        items: [{ field: "name", label: "Name" }],
      },
    })
    await nextTick()

    const searchButton = wrapper.findAll(".el-button")[0] // Assuming first is search
    await searchButton.trigger("click")

    // Check wrapper emitted "search"
    expect(wrapper.emitted()).toHaveProperty("search")

    // Check crud.refresh called
    // Search calls form.submit -> then runRefresh -> crud.refresh
    await nextTick()
    await nextTick() // Wait for async chains

    expect(mocks.mockFormSubmit).toHaveBeenCalled()
    expect(mocks.mockCrud.refresh).toHaveBeenCalled()
  })

  it("handles collapse action and toggles icon (BUG REPRODUCTION)", async () => {
    const wrapper = mount(Search, {
      global: {
        stubs: {
          ElButton: {
            name: "ElButton",
            template: "<button class=\"el-button\" :data-icon=\"icon\" @click=\"$emit('click')\"><slot /></button>",
            props: ["icon"],
          },
          ElRow: { template: "<div class=\"el-row\"><slot /></div>" },
          ElCol: { template: "<div class=\"el-col\"><slot /></div>" },
        },
      },
    })
    await nextTick()

    // Explicitly set to collapsed state
    const vm = wrapper.vm as any
    vm.use({
      form: {
        layout: {
          grid: {
            collapsed: true,
          },
        },
      },
    })
    await nextTick()

    const buttons = wrapper.findAll(".el-button")
    const collapseButton = buttons[2] // 3rd button

    // When collapsed=true (Hidden state):
    // Text should be "Expand"
    expect(collapseButton.text()).toContain("Expand")

    // Icon should be ArrowDown (to indicate action to expand)
    // CURRENT BUG: It is ArrowUp. The test will FAIL here, confirming the bug.
    expect(collapseButton.attributes("data-icon")).toBe("ArrowDown")

    // Trigger click to expand
    await collapseButton.trigger("click")
    await nextTick()

    // Check if form collapse method was called (indicating the internal collapse function ran)
    expect(mocks.mockFormCollapse).toHaveBeenCalled()
    expect(mocks.mockFormCollapse).toHaveBeenCalledWith(false) // Should be called with false (expanded)

    // Now collapsed=false (Expanded state)

    // Icon should be ArrowUp (to indicate action to collapse)
    // Note: We updated the logic in the component, so ArrowUp is correct for expanded state.
    expect(collapseButton.attributes("data-icon")).toBe("ArrowUp")

    // Text should be "Collapse"
    expect(collapseButton.text()).toContain("Collapse")
  })
})
