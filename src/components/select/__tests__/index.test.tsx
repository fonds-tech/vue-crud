import type { VueWrapper } from "@vue/test-utils"
import Select from ".."
import ElementPlus from "element-plus"
import { h, defineComponent } from "vue"
import { mount, flushPromises } from "@vue/test-utils"
import { it, vi, expect, describe, beforeEach } from "vitest"

const baseOptions = [
  { label: "上海", value: "sh" },
  { label: "北京", value: "bj" },
]

const ElSelectStub = defineComponent({
  name: "ElSelectStub",
  props: {
    options: { type: Array, default: () => [] },
    modelValue: { type: [Array, String, Number, Object, Boolean], default: undefined },
    loading: { type: Boolean, default: false },
    class: { type: [String, Array, Object], default: undefined },
  },
  emits: ["update:modelValue", "clear"],
  setup(props, { slots, emit }) {
    return () =>
      h(
        "div",
        {
          "class": ["el-select-stub", props.class],
          "data-options": props.options?.length ?? 0,
          "onClick": () => emit("clear"),
        },
        slots.default?.(),
      )
  },
})

function mountSelect(options: { props?: Record<string, any>, slots?: Record<string, any> } = {}) {
  return mount(Select, {
    props: {
      options: baseOptions,
      ...(options.props ?? {}),
    },
    slots: options.slots,
    global: {
      plugins: [ElementPlus],
      stubs: {
        "el-select": ElSelectStub,
      },
    },
  }) as VueWrapper<any>
}

describe("select", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("使用本地 options 渲染并附带类名", () => {
    const wrapper = mountSelect()
    const select = wrapper.findComponent(ElSelectStub)

    expect(select.exists()).toBe(true)
    expect(select.props("options")).toEqual(baseOptions)
    expect(select.classes()).toContain("fd-select")
  })

  it("调用 api 时能够刷新远程数据", async () => {
    const apiMock = vi.fn().mockResolvedValue([{ label: "深圳", value: "sz" }])
    const wrapper = mountSelect({ props: { api: apiMock } })

    expect(apiMock).toHaveBeenCalledTimes(1)
    await flushPromises()

    expect(wrapper.vm.options).toEqual([{ label: "深圳", value: "sz" }])
  })

  it("params 变化触发深度监听并刷新", async () => {
    const apiMock = vi.fn().mockResolvedValue([])
    const wrapper = mountSelect({
      props: {
        api: apiMock,
        params: { type: "a" },
      },
    })

    await flushPromises()
    expect(apiMock).toHaveBeenCalledTimes(1)

    await wrapper.setProps({ params: { type: "b" } })
    await flushPromises()

    expect(apiMock).toHaveBeenCalledTimes(2)
    expect(apiMock).toHaveBeenLastCalledWith(expect.objectContaining({ type: "b" }))
  })

  it("api 请求失败时重置数据并处理错误", async () => {
    const apiMock = vi.fn().mockRejectedValue(new Error("Select Error"))
    const wrapper = mountSelect({ props: { api: apiMock, options: [] } })

    await flushPromises()

    expect(wrapper.vm.options).toEqual([])
    expect(apiMock).toHaveBeenCalledTimes(1)
  })

  it("api 非函数时不执行刷新", async () => {
    const wrapper = mountSelect({ props: { api: "not-a-function", options: [] } })
    await flushPromises()
    expect(wrapper.vm.options).toEqual([])
  })

  it("响应 update:modelValue 事件并透传", () => {
    const wrapper = mountSelect()
    wrapper.findComponent({ name: "ElSelectStub" }).vm.$emit("update:modelValue", "val")
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["val"])
  })

  it("透传插槽内容", () => {
    const wrapper = mountSelect({
      slots: {
        default: () => h("span", { class: "custom-slot" }, "Default Slot Content"),
      },
    })
    expect(wrapper.find(".custom-slot").exists()).toBe(true)
    expect(wrapper.text()).toContain("Default Slot Content")
  })

  it("未传入 options 时使用空数组默认值", () => {
    const wrapper = mount(Select, {
      global: {
        plugins: [ElementPlus],
        stubs: {
          "el-select": ElSelectStub,
        },
      },
    }) as VueWrapper<any>

    expect(wrapper.vm.options).toEqual([])
  })

  it("正确合并外部传入的 class", () => {
    const wrapper = mountSelect({
      props: {
        options: baseOptions,
        class: "custom-class",
      },
    })

    const select = wrapper.findComponent(ElSelectStub)
    expect(select.classes()).toContain("fd-select")
    expect(select.classes()).toContain("custom-class")
  })

  it("immediate 为 false 时不自动调用 api", async () => {
    const apiMock = vi.fn().mockResolvedValue([])

    const wrapper = mountSelect({
      props: {
        api: apiMock,
        immediate: false,
      },
    })

    await flushPromises()
    expect(apiMock).not.toHaveBeenCalled()

    await wrapper.vm.refresh()
    await flushPromises()
    expect(apiMock).toHaveBeenCalledTimes(1)
  })

  it("api 返回非数组时自动转换为空数组", async () => {
    const apiMock = vi.fn().mockResolvedValue({ invalid: "data" } as any)

    const wrapper = mountSelect({
      props: {
        api: apiMock,
        options: [],
      },
    })

    await flushPromises()
    expect(wrapper.vm.options).toEqual([])
  })

  it("label-key 与 value-key 能映射自定义字段", async () => {
    const customOptions = [
      { userName: "张三", userId: 1 },
      { userName: "李四", userId: 2 },
    ]

    const wrapper = mountSelect({
      props: {
        options: customOptions,
        labelKey: "userName",
        valueKey: "userId",
      },
    })

    const select = wrapper.findComponent(ElSelectStub)
    const optionsProp = select.props("options") as any[]

    expect(optionsProp[0]).toMatchObject({ label: "张三", value: 1 })
    expect(optionsProp[1]).toMatchObject({ label: "李四", value: 2 })
  })

  it("label/value 在缺少自定义字段时回退到 label/value 或空字符串", () => {
    const wrapper = mountSelect({
      props: {
        options: [
          { name: "姓名", id: 1 },
          { label: "备用 label", value: "备用 value" },
          { other: "空值回退" },
        ],
        labelKey: "name",
        valueKey: "id",
      },
    })

    const optionsProp = wrapper.findComponent(ElSelectStub).props("options") as any[]

    expect(optionsProp[0]).toMatchObject({ label: "姓名", value: 1 })
    expect(optionsProp[1]).toMatchObject({ label: "备用 label", value: "备用 value" })
    expect(optionsProp[2]).toMatchObject({ label: "", value: "" })
  })

  it("api 变更会重置远程数据并触发 refresh", async () => {
    const apiMock1 = vi.fn().mockResolvedValue([{ label: "A", value: "a" }])
    const apiMock2 = vi.fn().mockResolvedValue([{ label: "B", value: "b" }])

    const wrapper = mountSelect({ props: { api: apiMock1 } })
    await flushPromises()
    expect(apiMock1).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.options[0]).toMatchObject({ label: "A", value: "a" })

    await wrapper.setProps({ api: apiMock2 })
    await flushPromises()

    expect(apiMock2).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.options[0]).toMatchObject({ label: "B", value: "b" })
  })

  it("移除 api 后回退到本地 options", async () => {
    const apiMock = vi.fn().mockResolvedValue([{ label: "远程", value: "remote" }])
    const wrapper = mountSelect({
      props: {
        api: apiMock,
        options: [{ label: "本地", value: "local" }],
      },
    })

    await flushPromises()
    expect(wrapper.vm.options[0]).toMatchObject({ label: "远程", value: "remote" })

    await wrapper.setProps({ api: undefined })
    await wrapper.vm.refresh()
    await flushPromises()

    expect(wrapper.vm.options[0]).toMatchObject({ label: "本地", value: "local" })
  })

  it("当 remoteOptionList 为空且 props.options 为假值时返回空数组", () => {
    const wrapper = mountSelect({
      props: {
        options: null as any,
      },
    })

    expect(wrapper.vm.options).toEqual([])
  })

  it("手动调用 refresh 且 api 非函数时清空 remoteOptionList", async () => {
    const apiMock = vi.fn().mockResolvedValue([{ label: "测试", value: "t" }])
    const wrapper = mountSelect({
      props: {
        api: apiMock,
        options: [],
      },
    })

    await flushPromises()
    expect(wrapper.vm.options).toHaveLength(1)

    await wrapper.setProps({ api: undefined })
    await wrapper.vm.refresh()
    await flushPromises()

    expect(wrapper.vm.options).toEqual([])
  })

  it("params 为 undefined 时使用空对象", async () => {
    const apiMock = vi.fn().mockResolvedValue([])

    mountSelect({
      props: {
        api: apiMock,
        params: undefined,
      },
    })

    await flushPromises()
    expect(apiMock).toHaveBeenCalledWith({})
  })

  it("params 为 null 时使用空对象", async () => {
    const apiMock = vi.fn().mockResolvedValue([])

    mountSelect({
      props: {
        api: apiMock,
        params: null as any,
      },
    })

    await flushPromises()
    expect(apiMock).toHaveBeenCalledWith({})
  })

  it("params 深度相等时不会重复触发 refresh", async () => {
    const apiMock = vi.fn().mockResolvedValue([])

    const wrapper = mountSelect({
      props: {
        api: apiMock,
        params: { type: "a", nested: { value: 1 } },
      },
    })

    await flushPromises()
    expect(apiMock).toHaveBeenCalledTimes(1)

    await wrapper.setProps({ params: { type: "a", nested: { value: 1 } } })
    await flushPromises()

    expect(apiMock).toHaveBeenCalledTimes(1)
  })
})
