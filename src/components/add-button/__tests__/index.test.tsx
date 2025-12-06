import AddButton from ".."

import ElementPlus from "element-plus"
import { mount } from "@vue/test-utils"
import { it, vi, expect, describe, afterEach } from "vitest"

const mockRowAdd = vi.fn()

// Mock the hooks
vi.mock("../../../hooks", () => ({
  useCore: () => ({
    crud: {
      getPermission: vi.fn(() => true),
      rowAdd: mockRowAdd,
      dict: {
        label: {
          add: "Add",
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

afterEach(() => {
  mockRowAdd.mockReset()
})

describe("addButton", () => {
  it("renders correctly", () => {
    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".el-button").exists()).toBe(true)
    expect(wrapper.text()).toBe("Add")
  })

  it("triggers rowAdd on click", async () => {
    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    await wrapper.find(".el-button").trigger("click")
    expect(mockRowAdd).toHaveBeenCalledTimes(1)
  })
})
