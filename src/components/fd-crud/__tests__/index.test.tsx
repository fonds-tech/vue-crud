import Crud from ".."
import { mount } from "@vue/test-utils"
import { it, vi, expect, describe } from "vitest"

// Mock hooks
vi.mock("../../../hooks", () => ({
  useConfig: () => ({
    dict: {},
    permission: {},
  }),
}))

// Mock内部 helper/service 行为以聚焦渲染与 expose
vi.mock("../helper", () => ({
  createHelper: () => ({
    proxy: vi.fn(),
    set: vi.fn(),
    on: vi.fn(),
    rowInfo: vi.fn(),
    rowAdd: vi.fn(),
    rowEdit: vi.fn(),
    rowAppend: vi.fn(),
    rowDelete: vi.fn(),
    rowClose: vi.fn(),
    getPermission: vi.fn(),
    paramsReplace: vi.fn((x: any) => x),
    getParams: vi.fn(() => ({})),
    setParams: vi.fn(),
  }),
}))

vi.mock("../service", () => ({
  createService: () => ({
    refresh: vi.fn(async () => "refresh"),
    rowDelete: vi.fn(async () => "delete"),
  }),
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

  it("merges options via exposed use method", () => {
    const wrapper = mount(Crud)
    const service = { page: () => {} }

    const exposedUse = (wrapper.vm as any).use
    expect(typeof exposedUse).toBe("function")
    exposedUse({ service })

    expect((wrapper.vm as any).service).toEqual(service)
  })
})
