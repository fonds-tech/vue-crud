import AddButton from ".."

import ElementPlus from "element-plus"
import { mount } from "@vue/test-utils"
import { it, vi, expect, describe, afterEach, beforeEach } from "vitest"

const mockRowAdd = vi.fn()
const mockGetPermission = vi.fn(() => true)

// 创建一个可配置的 dict 对象
const mockCrudDict: any = {
  label: {
    add: "Add",
  },
}

// Mock the hooks
vi.mock("../../../hooks", () => ({
  useCore: () => ({
    crud: {
      getPermission: mockGetPermission,
      rowAdd: mockRowAdd,
      get dict() {
        return mockCrudDict.value
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
  // 重置 mockCrudDict 为默认值
  mockCrudDict.value = {
    label: {
      add: "Add",
    },
  }
})

afterEach(() => {
  mockRowAdd.mockReset()
  mockGetPermission.mockReset()
})

describe("add-button", () => {
  it("正确渲染按钮", () => {
    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".el-button").exists()).toBe(true)
    expect(wrapper.text()).toBe("Add")
  })

  it("点击时触发 rowAdd 打开新增弹窗", async () => {
    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    await wrapper.find(".el-button").trigger("click")
    expect(mockRowAdd).toHaveBeenCalledTimes(1)
  })

  it("当无 add 权限时不渲染按钮", () => {
    mockGetPermission.mockReturnValue(false)
    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".el-button").exists()).toBe(false)
  })

  it("使用插槽内容替代默认标签", () => {
    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
      slots: {
        default: "自定义新增",
      },
    })
    expect(wrapper.text()).toBe("自定义新增")
  })

  it("点击时触发 click 事件", async () => {
    const handleClick = vi.fn()
    const wrapper = mount(AddButton, {
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

  it("disabled 属性正确传递", () => {
    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
      props: {
        disabled: true,
      },
    })
    expect(wrapper.find(".el-button").classes()).toContain("is-disabled")
  })

  it("loading 属性正确传递", () => {
    const wrapper = mount(AddButton, {
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
    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
      props: {
        type: "success",
      },
    })
    expect(wrapper.find(".el-button").classes()).toContain("el-button--success")
  })

  it("自定义 size 属性覆盖全局配置", () => {
    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
      props: {
        size: "small",
      },
    })
    expect(wrapper.find(".el-button").classes()).toContain("el-button--small")
  })

  it("默认 type 为 primary", () => {
    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.find(".el-button").classes()).toContain("el-button--primary")
  })

  it("props.type 为 undefined 时使用 primary", () => {
    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
      props: {
        type: undefined,
      },
    })
    expect(wrapper.find(".el-button").classes()).toContain("el-button--primary")
  })

  it("props.type 为 null 时使用 primary", () => {
    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
      props: {
        type: null as any,
      },
    })
    expect(wrapper.find(".el-button").classes()).toContain("el-button--primary")
  })

  it("crud.dict 为 undefined 时显示默认标签", () => {
    mockCrudDict.value = undefined

    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.text()).toBe("新增")
  })

  it("crud.dict.label 为 undefined 时显示默认标签", () => {
    mockCrudDict.value = { label: undefined }

    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.text()).toBe("新增")
  })

  it("crud.dict.label.add 为 undefined 时显示默认标签", () => {
    mockCrudDict.value = { label: { add: undefined } }

    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.text()).toBe("新增")
  })
})
