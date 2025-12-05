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

  it("清空时触发 refresh 并向外派发 clear", async () => {
    const apiMock = vi.fn().mockResolvedValue(baseOptions)
    const wrapper = mountCascader({ props: { api: apiMock } })

    await flushPromises()
    expect(apiMock).toHaveBeenCalledTimes(1)

    wrapper.findComponent(ElCascaderStub).vm.$emit("clear")
    await flushPromises()

    expect(apiMock).toHaveBeenCalledTimes(2)
    expect(wrapper.emitted("clear")).toBeTruthy()
  })
})
