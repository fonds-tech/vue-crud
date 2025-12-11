import Search from "../search"
import { mount } from "@vue/test-utils"
import { h, ref } from "vue"
import { it, vi, expect, describe, beforeEach } from "vitest"

const renderSearchSpy = vi.fn(() => h("div", "rendered"))

const mockEngine = {
  formModel: ref({ kw: "foo" }),
  formRef: ref("form-ref"),
  use: vi.fn(),
  reset: vi.fn(),
  search: vi.fn(),
  collapse: vi.fn(),
}

vi.mock("../render", () => ({
  renderSearch: (...args: any[]) => renderSearchSpy(...args),
}))

vi.mock("../core", () => ({
  useSearchCore: () => mockEngine,
}))

describe("fd-search 组件", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("应暴露 model/form/use/reset/search/collapse，并调用 renderSearch", () => {
    const wrapper = mount(Search as any, {
      slots: {
        default: () => h("div", "slot"),
      },
    })

    expect(renderSearchSpy).toHaveBeenCalled()
    expect(wrapper.vm.model).toEqual({ kw: "foo" })
    expect(wrapper.vm.form).toBe("form-ref")

    wrapper.vm.use({ foo: 1 })
    wrapper.vm.reset()
    wrapper.vm.search()
    wrapper.vm.collapse(true)

    expect(mockEngine.use).toHaveBeenCalled()
    expect(mockEngine.reset).toHaveBeenCalled()
    expect(mockEngine.search).toHaveBeenCalled()
    expect(mockEngine.collapse).toHaveBeenCalledWith(true)
  })
})
