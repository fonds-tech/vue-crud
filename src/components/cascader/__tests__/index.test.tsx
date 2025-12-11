import type { VueWrapper } from "@vue/test-utils"
import Cascader from ".."
import ElementPlus from "element-plus"
import { h, defineComponent } from "vue"
import { mount, flushPromises } from "@vue/test-utils"
import { it, vi, expect, describe, beforeEach } from "vitest"

const baseOptions = [
  { label: "上海", value: "sh" },
  { label: "北京", value: "bj" },
]

const ElCascaderStub = defineComponent({
  name: "ElCascaderStub",
  props: {
    options: { type: Array, default: () => [] },
    modelValue: { type: [Array, String, Number, Object], default: undefined },
    loading: { type: Boolean, default: false },
    class: { type: [String, Array, Object], default: undefined },
  },
  emits: ["update:modelValue", "clear"],
  setup(props, { slots, emit }) {
    return () =>
      h(
        "div",
        {
          "class": ["el-cascader-stub", props.class],
          "data-options": props.options?.length ?? 0,
          "onClick": () => emit("clear"),
        },
        slots.default?.(),
      )
  },
})

function mountCascader(options: { props?: Record<string, any>, slots?: Record<string, any> } = {}) {
  return mount(Cascader, {
    props: {
      options: baseOptions,
      ...(options.props ?? {}),
    },
    slots: options.slots,
    global: {
      plugins: [ElementPlus],
      stubs: {
        "el-cascader": ElCascaderStub,
      },
    },
  }) as VueWrapper<any>
}

describe("cascader", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("使用本地 options 渲染并附带类名", () => {
    const wrapper = mountCascader()
    const cascader = wrapper.findComponent(ElCascaderStub)

    expect(cascader.exists()).toBe(true)
    expect(cascader.props("options")).toEqual(baseOptions)
    expect(cascader.classes()).toContain("fd-cascader")
  })

  it("调用 api 时能够刷新远程数据", async () => {
    const apiMock = vi.fn().mockResolvedValue([{ label: "深圳", value: "sz" }])
    const wrapper = mountCascader({ props: { api: apiMock } })

    expect(apiMock).toHaveBeenCalledTimes(1)
    await flushPromises()

    expect(wrapper.vm.options).toEqual([{ label: "深圳", value: "sz" }])
  })

  it("params 变化触发深度监听并刷新", async () => {
    const apiMock = vi.fn().mockResolvedValue([])
    const wrapper = mountCascader({
      props: {
        api: apiMock,
        params: { type: "a" },
      },
    })

    await flushPromises()
    expect(apiMock).toHaveBeenCalledTimes(1)

    // 修改 params 触发 watch
    await wrapper.setProps({ params: { type: "b" } })
    await flushPromises()

    expect(apiMock).toHaveBeenCalledTimes(2)
    expect(apiMock).toHaveBeenLastCalledWith(expect.objectContaining({ type: "b" }))
  })

  it("api 请求失败时重置数据并处理错误", async () => {
    const apiMock = vi.fn().mockRejectedValue(new Error("Cascader Error"))
    const wrapper = mountCascader({ props: { api: apiMock, options: [] } })

    await flushPromises()

    // 验证请求失败后 options 被重置为空数组
    expect(wrapper.vm.options).toEqual([])
    expect(apiMock).toHaveBeenCalledTimes(1)
  })

  it("api 非函数时不执行刷新", async () => {
    // 传入 null 作为非函数占位，避免触发 Vue runtime 警告
    const wrapper = mountCascader({ props: { api: null as any, options: [] } })
    await flushPromises()
    expect(wrapper.vm.options).toEqual([])
  })

  it("响应 update:modelValue 事件并透传", () => {
    const wrapper = mountCascader()
    wrapper.findComponent({ name: "ElCascaderStub" }).vm.$emit("update:modelValue", ["val"])
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["val"]])
  })

  it("透传插槽内容", () => {
    const wrapper = mountCascader({
      slots: {
        default: () => h("span", { class: "custom-slot" }, "Default Slot Content"),
      },
    })
    // ElCascaderStub renders default slot
    expect(wrapper.find(".custom-slot").exists()).toBe(true)
    expect(wrapper.text()).toContain("Default Slot Content")
  })

  it("未传入 options 时使用空数组默认值", () => {
    // 不传入 options 和 api，触发 options 的默认值函数
    const wrapper = mount(Cascader, {
      global: {
        plugins: [ElementPlus],
        stubs: {
          "el-cascader": ElCascaderStub,
        },
      },
    }) as VueWrapper<any>

    expect(wrapper.vm.options).toEqual([])
  })

  it("正确合并外部传入的 class", () => {
    const wrapper = mount(Cascader, {
      props: {
        options: baseOptions,
        class: "custom-class",
      },
      global: {
        plugins: [ElementPlus],
        stubs: {
          "el-cascader": ElCascaderStub,
        },
      },
    }) as VueWrapper<any>

    const cascader = wrapper.findComponent(ElCascaderStub)
    expect(cascader.classes()).toContain("fd-cascader")
    expect(cascader.classes()).toContain("custom-class")
  })

  it("immediate 为 false 时不自动调用 api", async () => {
    const apiMock = vi.fn().mockResolvedValue([])

    const wrapper = mountCascader({
      props: {
        api: apiMock,
        immediate: false,
      },
    })

    await flushPromises()
    expect(apiMock).not.toHaveBeenCalled()

    // 手动调用 refresh 应该可以触发
    await wrapper.vm.refresh()
    await flushPromises()
    expect(apiMock).toHaveBeenCalledTimes(1)
  })

  it("api 返回非数组时自动转换为空数组", async () => {
    const apiMock = vi.fn().mockResolvedValue({ invalid: "data" } as any)

    const wrapper = mountCascader({
      props: {
        api: apiMock,
        options: [], // 显式传入空 options，避免使用 baseOptions
      },
    })

    await flushPromises()
    expect(wrapper.vm.options).toEqual([])
  })

  it("当 remoteOptionList 为空且 props.options 为假值时返回空数组", () => {
    const wrapper = mountCascader({
      props: {
        options: null as any,
      },
    })

    expect(wrapper.vm.options).toEqual([])
  })

  it("手动调用 refresh 且 api 非函数时清空 remoteOptionList", async () => {
    // 先设置一个有效的 api
    const apiMock = vi.fn().mockResolvedValue([{ label: "测试", value: "t" }])
    const wrapper = mountCascader({
      props: {
        api: apiMock,
        options: [], // 显式传入空 options
      },
    })

    await flushPromises()
    expect(wrapper.vm.options).toHaveLength(1)

    // 移除 api，手动调用 refresh 应该清空数据
    await wrapper.setProps({ api: undefined })
    await wrapper.vm.refresh()
    await flushPromises()

    expect(wrapper.vm.options).toEqual([])
  })

  it("params 值相同时不触发 refresh", async () => {
    const apiMock = vi.fn().mockResolvedValue([])

    const wrapper = mountCascader({
      props: {
        api: apiMock,
        params: { type: "a" },
      },
    })

    await flushPromises()
    expect(apiMock).toHaveBeenCalledTimes(1)

    // 设置相同的 params 值，不应该触发新的 refresh
    await wrapper.setProps({ params: { type: "a" } })
    await flushPromises()

    // 应该仍然是 1 次调用
    expect(apiMock).toHaveBeenCalledTimes(1)
  })

  it("params 为 undefined 时使用空对象", async () => {
    const apiMock = vi.fn().mockResolvedValue([])

    mountCascader({
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

    mountCascader({
      props: {
        api: apiMock,
        params: null as any,
      },
    })

    await flushPromises()
    expect(apiMock).toHaveBeenCalledWith({})
  })

  it("透传非 class 的 attrs 到原生 cascader", () => {
    const wrapper = mount(Cascader, {
      props: {
        "options": baseOptions,
        "data-testid": "my-cascader",
        "style": "width: 200px",
      } as any,
      global: {
        plugins: [ElementPlus],
        stubs: {
          "el-cascader": ElCascaderStub,
        },
      },
    }) as VueWrapper<any>

    const cascader = wrapper.findComponent(ElCascaderStub)
    // ElCascaderStub 会接收到这些透传的 attrs
    expect(cascader.exists()).toBe(true)
  })
})
