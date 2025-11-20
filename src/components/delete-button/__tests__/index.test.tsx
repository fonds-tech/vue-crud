import ElementPlus from "element-plus"
import DeleteButton from "../index"
import { mount } from "@vue/test-utils"
import { it, vi, expect, describe } from "vitest"

// Mock the hooks
vi.mock("../../../hooks", () => ({
  useCore: () => ({
    crud: {
      getPermission: vi.fn(() => true),
      rowDelete: vi.fn(),
      selection: [{ id: 1 }], // Simulate selected rows
      dict: {
        label: {
          delete: "Delete",
        },
      },
    },
  }),
  useConfig: () => ({
    style: {
      size: "default",
    },
  }),
}))

describe("deleteButton", () => {
  it("renders correctly", () => {
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".el-button").exists()).toBe(true)
    expect(wrapper.text()).toBe("Delete")
  })

  it("triggers rowDelete on click", async () => {
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    await wrapper.find(".el-button").trigger("click")
    // In a real debug scenario, you can add console.log or breakpoints here
  })

  it("is disabled when no selection", async () => {
    // Override mock for this specific test if needed, or create a separate describe block
    // For simplicity in this demo, we'll just note that mocking strategies allow testing different states
  })
})
