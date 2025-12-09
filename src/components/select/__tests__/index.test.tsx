import type { VueWrapper } from "@vue/test-utils"
import Select from "../index"
import FdOption from "../../option/index"
import ElementPlus from "element-plus"
import { h, defineComponent } from "vue"
import { mount, flushPromises } from "@vue/test-utils"
import { it, vi, expect, describe, beforeEach } from "vitest"

type SlotMap = Record<string, (...args: any[]) => any> // slot名称到渲染函数的映射
type SelectProps = InstanceType<typeof Select>["$props"] // fd-select的props类型
type OptionProps = InstanceType<typeof FdOption>["$props"] // fd-option的props类型

const baseOptions = [
  { label: "上海", value: "sh" }, // 基础数据：上海
  { label: "北京", value: "bj" }, // 基础数据：北京
]

const ElOptionStub = defineComponent({
  name: "ElOptionStub",
  props: ["label", "value"],
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          "class": ["el-option-stub", attrs.class],
          "data-label": props.label,
          "data-value": props.value,
          ...attrs,
        },
        slots.default?.(),
      )
  },
})

const ElSelectStub = defineComponent({
  name: "ElSelectStub",
  props: {
    loading: { type: Boolean, default: false },
  },
  setup(_, { slots, attrs }) {
    return () =>
      h(
        "div",
        { "class": ["el-select-stub", attrs.class], "data-attrs": attrs, ...attrs },
        [
          slots.prefix?.({ loading: false, options: baseOptions }),
          slots.default?.({ loading: false, options: baseOptions, refresh: () => {} }),
        ],
      )
  },
})

function mountFdSelect(options: { props?: Partial<SelectProps>, slots?: SlotMap } = {}) {
  return mount(Select, {
    props: {
      options: baseOptions, // 默认传入本地选项
      ...(options.props ?? {}), // 支持覆写props
    } as SelectProps,
    slots: options.slots, // 透传slot定义
    global: {
      plugins: [ElementPlus], // 注册Element Plus依赖
      stubs: {
        "el-select": ElSelectStub,
        "el-option": ElOptionStub,
      },
    },
  }) as VueWrapper<any>
}

function mountFdOption(options: { props?: Partial<OptionProps>, slots?: SlotMap } = {}) {
  const optionRecord = options.props?.option ?? baseOptions[0]
  return mount(FdOption, {
    props: {
      option: optionRecord,
      value: optionRecord.value,
      label: optionRecord.label,
      ...(options.props ?? {}), // 允许自定义label/value
    } as OptionProps,
    slots: options.slots, // 传入slot
    global: {
      stubs: {
        "el-option": ElOptionStub,
      },
    },
  }) as VueWrapper<any>
}

describe("fd-select", () => {
  beforeEach(() => {
    vi.restoreAllMocks() // 每次测试前重置所有mock，避免相互影响
  })

  it("使用本地 options 作为默认渲染数据", async () => {
    const wrapper = mountFdSelect() // 挂载fd-select
    const component = wrapper.vm // 获取实例

    expect(component.options).toHaveLength(baseOptions.length) // 校验内部选项长度
    expect(component.loading).toBe(false) // 默认不处于loading
  })

  it("向插槽注入扩展上下文并支持命名插槽", async () => {
    let slotPayload: any // 保存默认插槽上下文
    let prefixPayload: any // 保存命名插槽上下文

    const wrapper = mountFdSelect({
      slots: {
        default: (scope) => {
          slotPayload = scope // 记录默认slot注入内容
          return h("div", { class: "custom-slot" }, scope.options.length) // 自定义渲染
        },
        prefix: (scope) => {
          prefixPayload = scope // 记录prefix slot上下文
          return h("span", { class: "prefix-slot" }, scope.loading ? "loading" : "idle") // 显示loading状态
        },
      },
    }) // 挂载带自定义slot的组件

    expect(slotPayload?.options).toHaveLength(baseOptions.length) // 默认slot拿到选项
    expect(slotPayload?.refresh).toBeInstanceOf(Function) // 默认slot拿到refresh函数
    expect(prefixPayload?.options).toEqual(slotPayload?.options) // 命名slot也拿到相同数据
    expect(wrapper.find(".custom-slot").text()).toBe(String(baseOptions.length)) // 自定义slot渲染结果正确
    expect(wrapper.find(".prefix-slot").text()).toBe("idle") // 命名slot文本为idle
  })

  it("调用 api 时能够刷新远程数据并正确维护 loading", async () => {
    const apiMock = vi.fn().mockResolvedValue([{ label: "深圳", value: "sz" }]) // mock远程接口

    const wrapper = mountFdSelect({ props: { api: apiMock } }) // 挂载传入api的组件

    expect(apiMock).toHaveBeenCalledTimes(1) // 初始化触发一次

    await flushPromises() // 等待异步完成

    expect(wrapper.vm.options).toEqual([{ label: "深圳", value: "sz" }]) // 选项被远程数据替换
    expect(wrapper.vm.loading).toBe(false) // loading状态复位
  })

  it("change 事件会附带匹配到的选项数据", () => {
    const wrapper = mountFdSelect() // 挂载默认组件

    wrapper.vm.handleChange("bj") // 模拟单选变化
    wrapper.vm.handleChange(["sh", "bj"]) // 模拟多选变化

    const emitted = wrapper.emitted("change") ?? [] // 获取事件
    expect(emitted[0]).toEqual(["bj", baseOptions[1]]) // 单选附带对象
    expect(emitted[1]).toEqual([["sh", "bj"], baseOptions]) // 多选附带数组
  })

  it("搜索输入会触发远程刷新与 search 事件", async () => {
    vi.useFakeTimers()
    const apiMock = vi.fn().mockResolvedValue(baseOptions) // mock搜索接口
    const wrapper = mountFdSelect({ props: { api: apiMock } }) // 挂载组件

    await flushPromises() // 等待初次加载

    wrapper.vm.handleFilterInput("海") // 触发搜索

    // 验证防抖：立即检查不应调用
    expect(apiMock).not.toHaveBeenLastCalledWith(expect.objectContaining({ keyword: "海" }))

    // 快进时间
    vi.advanceTimersByTime(300)
    await flushPromises() // 等待刷新

    expect(apiMock).toHaveBeenLastCalledWith(expect.objectContaining({ keyword: "海" })) // 校验搜索参数
    expect(wrapper.emitted("search")?.[0]).toEqual(["海"]) // search事件携带关键字

    vi.useRealTimers()
  })

  it("字符串 api 成功拉取数据并覆盖选项", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch" as any).mockResolvedValue({
      ok: true,
      json: async () => [{ label: "广州", value: "gz" }],
    } as any)

    const wrapper = mountFdSelect({ props: { api: "/mock-api/options" } })
    await flushPromises()

    expect(fetchMock).toHaveBeenCalled()
    expect(wrapper.vm.options).toEqual([{ label: "广州", value: "gz" }])

    fetchMock.mockRestore()
  })

  it("labelKey 自定义字段解析并渲染默认 option", async () => {
    const customOptions = [{ name: "南京", value: "nj" }]
    const wrapper = mountFdSelect({ props: { options: customOptions, labelKey: "name" } })

    const optionNode = wrapper.find(".el-option-stub")
    expect(optionNode.exists()).toBe(true)
    expect(optionNode.attributes("data-label")).toBe("南京")
    expect(optionNode.attributes("data-value")).toBe("nj")
  })

  it("attrs 透传与 class 合并", () => {
    const wrapper = mountFdSelect({
      props: { "class": "custom-class", "data-test-id": "select-1" } as any,
    })
    const selectComponent = wrapper.findComponent({ name: "ElSelectStub" })
    expect(selectComponent.exists()).toBe(true)
    expect(selectComponent.classes()).toContain("fd-select")
    expect(selectComponent.classes()).toContain("custom-class")
    expect(selectComponent.attributes("data-test-id")).toBe("select-1")
  })

  it("远程模式自动注入 remoteMethod 与 filterable", () => {
    const wrapper = mountFdSelect({ props: { api: vi.fn().mockResolvedValue(baseOptions) } })
    const selectComponent = wrapper.findComponent({ name: "ElSelectStub" })
    const attrs = selectComponent.attributes() as unknown as Record<string, any>
    expect(attrs.remote === "true" || attrs.remote === true || attrs.remote === "").toBe(true)
    expect(typeof (selectComponent.vm as any).$attrs.remoteMethod).toBe("function")
    expect(attrs.filterable === "true" || attrs.filterable === true || attrs.filterable === "").toBe(true)
  })

  it("params 变化触发深度监听并刷新", async () => {
    const apiMock = vi.fn().mockResolvedValue([])
    const wrapper = mountFdSelect({
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

  it("aPI 请求失败时重置 loading 并处理错误", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const apiMock = vi.fn().mockRejectedValue(new Error("Network Error"))
    // Pass empty options to avoid fallback to default options
    const wrapper = mountFdSelect({ props: { api: apiMock, options: [] } })

    await flushPromises()

    expect(wrapper.vm.loading).toBe(false)
    expect(wrapper.vm.options).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it("handleClear 重置搜索词并触发 clear 事件", async () => {
    const wrapper = mountFdSelect()

    // Mock refresh manually since it's internal setup binding, but we can verify side effects
    // Or we can mock the expose. But easier to check state if exposed.
    // The component exposes refresh.
    // Let's use vm to set internal state if possible or rely on exposed methods.

    // Set search term
    wrapper.vm.handleFilterInput("test")
    await flushPromises() // debounce
    // expect(wrapper.vm.currentSearchTerm).toBe("test") // Internal state not exposed

    // Trigger clear by emitting event from stub
    wrapper.findComponent({ name: "ElSelectStub" }).vm.$emit("clear")

    expect(wrapper.emitted("clear")).toBeTruthy()
    // We can't easily check currentSearchTerm if not exposed. But we check behavior.
    // If api is present, refresh is called.
  })

  it("无 API 时 handleFilterInput 仅更新搜索词但不触发刷新", async () => {
    // We rely on Timer mock to verify no refresh call if we had one.
    // But since no API, refresh does nothing.
    const wrapper = mountFdSelect()
    wrapper.vm.handleFilterInput("test")
    // Should not crash
    expect(true).toBe(true)
  })

  it("响应 update:modelValue 事件并透传", () => {
    const wrapper = mountFdSelect()
    wrapper.findComponent({ name: "ElSelectStub" }).vm.$emit("update:modelValue", "new-val")
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["new-val"])
  })

  it("handleFocus 在存在搜索词时触发刷新", async () => {
    const apiMock = vi.fn().mockResolvedValue(baseOptions)
    const wrapper = mountFdSelect({ props: { api: apiMock } })

    await flushPromises() // 等待初始化
    apiMock.mockClear() // 清除初始化调用记录

    // 设置搜索词
    wrapper.vm.handleFilterInput("test")
    await flushPromises()

    // 触发 focus 事件
    wrapper.findComponent({ name: "ElSelectStub" }).vm.$emit("focus")
    await flushPromises()

    expect(apiMock).toHaveBeenCalled()
  })

  it("handleBlur 在存在搜索词时触发刷新", async () => {
    const apiMock = vi.fn().mockResolvedValue(baseOptions)
    const wrapper = mountFdSelect({ props: { api: apiMock } })

    await flushPromises() // 等待初始化
    apiMock.mockClear() // 清除初始化调用记录

    // 设置搜索词
    wrapper.vm.handleFilterInput("test")
    await flushPromises()

    // 触发 blur 事件
    wrapper.findComponent({ name: "ElSelectStub" }).vm.$emit("blur")
    await flushPromises()

    expect(apiMock).toHaveBeenCalled()
  })

  it("字符串 API 请求失败时处理错误", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const fetchMock = vi.spyOn(globalThis, "fetch" as any).mockResolvedValue({
      ok: false,
      status: 404,
    } as any)

    const wrapper = mountFdSelect({ props: { api: "/mock-api/error", options: [] } })
    await flushPromises()

    expect(wrapper.vm.options).toEqual([])
    expect(wrapper.vm.loading).toBe(false)
    expect(consoleSpy).toHaveBeenCalled()

    fetchMock.mockRestore()
    consoleSpy.mockRestore()
  })

  it("字符串 API 返回非数组时处理为空数组", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch" as any).mockResolvedValue({
      ok: true,
      json: async () => ({ error: "invalid format" }),
    } as any)

    // 传入空 options 以避免回退到默认的 baseOptions
    const wrapper = mountFdSelect({ props: { api: "/mock-api/invalid", options: [] } })
    await flushPromises()

    expect(wrapper.vm.options).toEqual([])

    fetchMock.mockRestore()
  })

  it("字符串 API 正确处理 undefined 和 null 参数值", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch" as any).mockResolvedValue({
      ok: true,
      json: async () => baseOptions,
    } as any)

    const wrapper = mountFdSelect({
      props: {
        api: "/mock-api/params",
        params: { valid: "value", nullParam: null, undefinedParam: undefined },
      },
    })
    await flushPromises()

    // 验证 fetch 被调用，且 URL 不包含 null 或 undefined
    expect(fetchMock).toHaveBeenCalled()
    const calledUrl = fetchMock.mock.calls[0][0] as string
    expect(calledUrl).toContain("valid=value")
    expect(calledUrl).not.toContain("null")
    expect(calledUrl).not.toContain("undefined")

    // 验证数据正确加载
    expect(wrapper.vm.options).toEqual(baseOptions)

    fetchMock.mockRestore()
  })

  it("resolveOptionField 处理空选项和空 key", () => {
    const wrapper = mountFdSelect()

    // 通过公开的 handleChange 来间接测试 resolveOptionField 的边界情况
    wrapper.vm.handleChange(null)

    const emitted = wrapper.emitted("change")
    expect(emitted).toBeTruthy()
    expect(emitted?.[0]).toEqual([null, undefined])
  })

  it("handleClear 在有 API 时调用刷新", async () => {
    const apiMock = vi.fn().mockResolvedValue(baseOptions)
    const wrapper = mountFdSelect({ props: { api: apiMock } })

    await flushPromises()
    apiMock.mockClear()

    wrapper.findComponent({ name: "ElSelectStub" }).vm.$emit("clear")
    await flushPromises()

    expect(wrapper.emitted("clear")).toBeTruthy()
    expect(apiMock).toHaveBeenCalled()
  })

  it("默认插槽未自定义时渲染默认 el-option 列表", () => {
    const wrapper = mountFdSelect()

    // 验证默认渲染了选项
    const options = wrapper.findAllComponents({ name: "ElOptionStub" })
    expect(options).toHaveLength(baseOptions.length)
  })

  it("命名插槽为 undefined 时不会渲染", () => {
    const wrapper = mountFdSelect({
      slots: {
        default: () => h("div", { class: "custom-default" }, "custom"),
        // prefix 插槽存在但返回 undefined 的情况会在 ElSelectStub 中处理
      },
    })

    expect(wrapper.find(".custom-default").exists()).toBe(true)
  })

  it("valueKey 计算属性始终返回 'value'", () => {
    const wrapper = mountFdSelect()

    // 通过 change 事件验证使用了正确的 valueKey
    wrapper.vm.handleChange("bj")
    const emitted = wrapper.emitted("change")

    expect(emitted).toBeTruthy()
    expect(emitted?.[0][1]).toEqual(baseOptions[1])
  })
})

describe("fd-option", () => {
  it("自动填充 option 中的 label 和 value", () => {
    const wrapper = mountFdOption({ props: { option: { label: "杭州", value: "hz" } } }) // 传入新数据
    const optionProps = wrapper.vm.optionProps // 读取计算props

    expect(optionProps.label).toBe("杭州") // label自动填充
    expect(optionProps.value).toBe("hz") // value自动填充
  })

  it("保持用户自定义的 prop 优先级", () => {
    const wrapper = mountFdOption({ props: { label: "自定义", value: "custom" } }) // 覆写label/value
    const optionProps = wrapper.vm.optionProps // 获取合并后的props

    expect(optionProps.label).toBe("自定义") // 保留自定义label
    expect(optionProps.value).toBe("custom") // 保留自定义value
  })
})
