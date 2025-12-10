import AddButton from "../../add-button"
import ElementPlus from "element-plus"
import DeleteButton from "../../delete-button"
import { mount } from "@vue/test-utils"
import { h, nextTick } from "vue"
import { it, vi, expect, describe, afterEach, beforeEach } from "vitest"

// 模拟 crud 上下文
const mockSelection = [
  { id: 1, name: "项目1" },
  { id: 2, name: "项目2" },
]
const mockRowDelete = vi.fn()
const mockRowAdd = vi.fn()
const mockRefresh = vi.fn()

// Mock hooks 返回完整的 crud 对象
vi.mock("../../../hooks", () => ({
  useCore: () => ({
    crud: {
      id: "test-crud",
      selection: mockSelection,
      getPermission: vi.fn((key: string) => ["add", "delete"].includes(key)),
      rowDelete: mockRowDelete,
      rowAdd: mockRowAdd,
      refresh: mockRefresh,
      dict: {
        label: {
          delete: "删除",
          add: "新增",
          tips: "提示",
          deleteConfirm: "确认删除选中的记录？",
          deleteSuccess: "删除成功",
        },
        primaryId: "id",
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
  mockRowDelete.mockClear()
  mockRowAdd.mockClear()
  mockRefresh.mockClear()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe("deleteButton 集成测试", () => {
  it("通过 inject 获取 crud 上下文", async () => {
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.find(".el-button").exists()).toBe(true)
    expect(wrapper.text()).toBe("删除")
  })

  it("点击删除按钮调用 crud.rowDelete 并传入选中项", async () => {
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".el-button").trigger("click")
    await nextTick()

    expect(mockRowDelete).toHaveBeenCalledTimes(1)
    expect(mockRowDelete).toHaveBeenCalledWith({ id: 1, name: "项目1" }, { id: 2, name: "项目2" })
  })

  it("使用 crud.dict 中的标签", () => {
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.text()).toBe("删除")
  })

  it("检查 crud.getPermission 测试权限控制", () => {
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    // 权限mock返回true，应该存在
    expect(wrapper.find(".el-button").exists()).toBe(true)
  })

  it("配合使用自定义插槽", async () => {
    const wrapper = mount(DeleteButton, {
      global: {
        plugins: [ElementPlus],
      },
      slots: {
        default: () => h("span", { class: "custom-icon" }, "🗑️ 批量删除"),
      },
    })

    expect(wrapper.find(".custom-icon").exists()).toBe(true)
    expect(wrapper.text()).toContain("批量删除")

    await wrapper.find(".el-button").trigger("click")
    expect(mockRowDelete).toHaveBeenCalled()
  })
})

describe("addButton 集成测试", () => {
  it("通过 inject 获取 crud 上下文", async () => {
    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.find(".el-button").exists()).toBe(true)
    expect(wrapper.text()).toBe("新增")
  })

  it("点击新增按钮调用 crud.rowAdd", async () => {
    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find(".el-button").trigger("click")
    await nextTick()

    expect(mockRowAdd).toHaveBeenCalledTimes(1)
  })

  it("使用 crud.dict 中的标签", () => {
    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
    })
    expect(wrapper.text()).toBe("新增")
  })

  it("配合使用自定义插槽", async () => {
    const wrapper = mount(AddButton, {
      global: {
        plugins: [ElementPlus],
      },
      slots: {
        default: () => h("span", { class: "custom-icon" }, "➕ 添加记录"),
      },
    })

    expect(wrapper.find(".custom-icon").exists()).toBe(true)
    expect(wrapper.text()).toContain("添加记录")

    await wrapper.find(".el-button").trigger("click")
    expect(mockRowAdd).toHaveBeenCalled()
  })
})
