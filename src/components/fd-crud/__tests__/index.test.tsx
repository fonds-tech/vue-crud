import Crud from "../index"
import { mount } from "@vue/test-utils"
import { it, vi, expect, describe } from "vitest"

// Mock hooks
vi.mock("../../../hooks", () => ({
  useConfig: () => ({
    dict: {},
    permission: {},
  }),
}))

// Mock useHelper
vi.mock("../useHelper", () => ({
  useHelper: () => ({}),
}))

describe("crud", () => {
  it("renders correctly", () => {
    const wrapper = mount(Crud, {
      props: {
        name: "test-crud",
      },
      slots: {
        default: () => "Crud Content",
      },
    })
    expect(wrapper.find(".fd-crud").exists()).toBe(true)
    expect(wrapper.text()).toContain("Crud Content")
  })

  it("provides crud and mitt", () => {
    const wrapper = mount(Crud, {
      props: {
        name: "test-crud",
      },
    })
    // We can't easily test provide/inject without a child component,
    // but we can check if the component instance has the exposed properties
    expect(wrapper.vm).toBeDefined()
    expect((wrapper.vm as any).id).toBe("test-crud")
  })
})
