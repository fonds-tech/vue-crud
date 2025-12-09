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

  it("api 请求失败时重置 loading 并处理错误", async () => {
    // 组件会 swallow error in finally，我们验证 loading 重置即可
    // 或许可以 spy console.error 如果有 log
    // 查看组件源码，这里没有 try catch，直接 finally？
    // wait, refresh function has try/catch in cascader.tsx?
    // Yes: try { ... } finally { innerLoading.value = false }
    // But it doesn't catch error? No, it doesn't catch. So error throws out.
    // Wait, let me check cascader.tsx again.
    // The previous view_file says:
    // try { const result = await props.api(payload) ... } finally { innerLoading.value = false }
    // There is NO catch block. So it should throw.
    // But since it's called in watch/void context, the error might be unhandled promise rejection.
    // We should expect rejection if we call refresh directly, or handle unhandled rejection.

    const apiMock = vi.fn().mockRejectedValue(new Error("Cascader Error"))
    const wrapper = mountCascader({ props: { api: apiMock } })

    // watch calls void refresh(). It will be unhandled.
    // So we need to handle unhandledRejection
    const errorHandler = vi.fn()
    const originalHandler = process.listeners("unhandledRejection")
    process.removeAllListeners("unhandledRejection")
    process.on("unhandledRejection", errorHandler)

    await flushPromises()

    // Wait, unhandled rejection might crash process in some envs.
    // Vitest usually catches this.

    // 验证 loading 被重置
    expect(wrapper.vm.loading).toBe(false)
    expect(errorHandler).toHaveBeenCalled()

    process.removeAllListeners("unhandledRejection")
    originalHandler.forEach(h => process.on("unhandledRejection", h as any))
  })

  it("api 非函数时不执行刷新", async () => {
    // Pass empty options to avoid fallback
    const wrapper = mountCascader({ props: { api: "not-a-function", options: [] } })
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
})
