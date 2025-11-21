import type { ComponentPublicInstance } from "vue"

import Select from "../index"
import ElementPlus from "element-plus"
import { mount, flushPromises } from "@vue/test-utils"
import { it, vi, expect, describe } from "vitest"

interface SelectExpose extends ComponentPublicInstance {
  refresh: (payload?: Record<string, any>) => void
}

function mountSelect(props: Record<string, any> = {}) {
  return mount(Select, {
    props,
    global: {
      plugins: [ElementPlus],
    },
  })
}

function getElSelectVm(wrapper: ReturnType<typeof mountSelect>) {
  return wrapper.findComponent({ name: "ElSelect" }).vm as ComponentPublicInstance & {
    $emit: (event: string, ...args: any[]) => void
    remoteMethod?: (keyword: string) => void
  }
}

describe("el-select", () => {
  it("透传 options 并在 change 时返回匹配项", async () => {
    const options = [
      { label: "选项A", value: "a" },
      { label: "选项B", value: "b" },
    ]
    const wrapper = mountSelect({ options })

    const elSelectVm = getElSelectVm(wrapper)
    elSelectVm.$emit("update:modelValue", "a")
    elSelectVm.$emit("change", "a")
    await flushPromises()

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["a"])
    expect(wrapper.emitted("change")?.[0]).toEqual(["a", options[0]])
  })

  it("多选 change 返回对应项集合", async () => {
    const options = [
      { label: "一", value: 1 },
      { label: "二", value: 2 },
    ]
    const wrapper = mountSelect({ options, multiple: true })
    const elSelectVm = getElSelectVm(wrapper)

    elSelectVm.$emit("change", [1, 2])
    await flushPromises()

    expect(wrapper.emitted("change")?.[0]).toEqual([[1, 2], options])
  })

  it("远程搜索与 refresh 会触发 api 调用", async () => {
    const api = vi.fn().mockResolvedValue([{ label: "远程", value: "remote" }])
    const wrapper = mountSelect({ api, searchField: "keyword" })

    await flushPromises()
    expect(api).toHaveBeenCalledTimes(1)

    const remoteMethod = wrapper.findComponent({ name: "ElSelect" }).props("remoteMethod") as ((keyword: string) => void) | undefined
    expect(typeof remoteMethod).toBe("function")

    remoteMethod?.("test")
    await flushPromises()
    expect(api).toHaveBeenCalledTimes(2)
    expect(api).toHaveBeenLastCalledWith(expect.objectContaining({ keyword: "test" }))
    expect(wrapper.emitted("search")?.[0]).toEqual(["test"])

    const refresh = (wrapper.vm as unknown as SelectExpose).refresh
    refresh()
    await flushPromises()
    expect(api).toHaveBeenCalledTimes(3)
  })

  it("focus / blur / clear 事件按需刷新", async () => {
    const api = vi.fn().mockResolvedValue([{ label: "远程", value: "remote" }])
    const wrapper = mountSelect({ api })
    await flushPromises()

    const elSelectVm = getElSelectVm(wrapper)
    const remoteMethod = wrapper.findComponent({ name: "ElSelect" }).props("remoteMethod") as ((keyword: string) => void) | undefined
    remoteMethod?.("keyword")
    await flushPromises()

    const callsAfterSearch = api.mock.calls.length

    elSelectVm.$emit("focus")
    await flushPromises()
    expect(api.mock.calls.length).toBe(callsAfterSearch + 1)

    elSelectVm.$emit("blur")
    await flushPromises()
    expect(api.mock.calls.length).toBe(callsAfterSearch + 2)

    elSelectVm.$emit("clear")
    await flushPromises()
    expect(api.mock.calls.length).toBe(callsAfterSearch + 3)
    expect(wrapper.emitted("clear")).toBeTruthy()
  })
})
