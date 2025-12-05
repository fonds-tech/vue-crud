import ElementPlus from "element-plus"
import DeleteButton from ".."
import { mount } from "@vue/test-utils"
import { it, vi, expect, describe, afterEach } from "vitest"

const mockRowDelete = vi.fn()
let selectionMock: Array<{ id: number }> = [{ id: 1 }]

// Mock the hooks
vi.mock("../../../hooks", () => ({
  useCore: () => ({
    crud: {
      getPermission: vi.fn(() => true),
      rowDelete: mockRowDelete,
      get selection() {
        return selectionMock
      },
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

afterEach(() => {
  mockRowDelete.mockReset()
  selectionMock = [{ id: 1 }]
})

describe("deleteButton", () => {
  it("renders correctly", () => {
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".el-button").exists()).toBe(true)
    expect(wrapper.text()).toBe("Delete")
    expect(wrapper.find(".el-button").classes()).toContain("el-button--danger")
  })

  it("triggers rowDelete on click", async () => {
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    await wrapper.find(".el-button").trigger("click")
    expect(mockRowDelete).toHaveBeenCalledTimes(1)
    expect(mockRowDelete).toHaveBeenCalledWith({ id: 1 })
  })

  it("is disabled when no selection", async () => {
    selectionMock = []
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    const button = wrapper.find(".el-button")
    expect(button.attributes("disabled")).toBeDefined()
    await button.trigger("click")
    expect(mockRowDelete).not.toHaveBeenCalled()
  })
})
