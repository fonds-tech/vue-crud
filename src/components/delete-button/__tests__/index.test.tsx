import ElementPlus from "element-plus"
import DeleteButton from ".."
import { mount } from "@vue/test-utils"
import { it, vi, expect, describe, afterEach, beforeEach } from "vitest"

const mockRowDelete = vi.fn()
const mockGetPermission = vi.fn(() => true)
let selectionMock: Array<{ id: number }> = [{ id: 1 }]

// Mock the hooks
vi.mock("../../../hooks", () => ({
  useCore: () => ({
    crud: {
      getPermission: mockGetPermission,
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

beforeEach(() => {
  mockGetPermission.mockReturnValue(true)
})

afterEach(() => {
  mockRowDelete.mockReset()
  mockGetPermission.mockReset()
  selectionMock = [{ id: 1 }]
})

describe("delete-button", () => {
  it("正确渲染按钮", () => {
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".el-button").exists()).toBe(true)
    expect(wrapper.text()).toBe("Delete")
    expect(wrapper.find(".el-button").classes()).toContain("el-button--danger")
  })

  it("点击时触发 rowDelete 删除选中项", async () => {
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    await wrapper.find(".el-button").trigger("click")
    expect(mockRowDelete).toHaveBeenCalledTimes(1)
    expect(mockRowDelete).toHaveBeenCalledWith({ id: 1 })
  })

  it("无选中项时按钮禁用", async () => {
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

  it("当无 delete 权限时不渲染按钮", () => {
    mockGetPermission.mockReturnValue(false)
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".el-button").exists()).toBe(false)
  })

  it("使用插槽内容替代默认标签", () => {
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
      slots: {
        default: "批量删除",
      },
    })
    expect(wrapper.text()).toBe("批量删除")
  })

  it("点击时触发 click 事件", async () => {
    const handleClick = vi.fn()
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
      attrs: {
        onClick: handleClick,
      },
    })
    await wrapper.find(".el-button").trigger("click")
    expect(handleClick).toHaveBeenCalled()
  })

  it("多个选中项时删除所有", async () => {
    selectionMock = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    await wrapper.find(".el-button").trigger("click")
    expect(mockRowDelete).toHaveBeenCalledWith({ id: 1 }, { id: 2 }, { id: 3 })
  })

  it("loading 属性正确传递", () => {
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
      props: {
        loading: true,
      },
    })
    expect(wrapper.find(".el-button").classes()).toContain("is-loading")
  })

  it("自定义 type 属性覆盖默认值", () => {
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
      props: {
        type: "warning",
      },
    })
    expect(wrapper.find(".el-button").classes()).toContain("el-button--warning")
  })

  it("自定义 size 属性覆盖全局配置", () => {
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
      props: {
        size: "small",
      },
    })
    expect(wrapper.find(".el-button").classes()).toContain("el-button--small")
  })

  it("disabled 属性为 true 时按钮禁用", () => {
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
      props: {
        disabled: true,
      },
    })
    expect(wrapper.find(".el-button").classes()).toContain("is-disabled")
  })
})
