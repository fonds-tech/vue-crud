import type FdFormComponent from "../fd-form/index.vue"
import type { SearchExpose } from "../type"
import type { MountingOptions } from "@vue/test-utils"
import Search from "../index.vue"
import { mount } from "@vue/test-utils"
import { it, vi, expect, describe, beforeEach } from "vitest"
import { h, nextTick, reactive, defineComponent } from "vue"

interface FormExposeStub {
  model: Record<string, any>
  use: ReturnType<typeof vi.fn>
  submit: ReturnType<typeof vi.fn>
  resetFields: ReturnType<typeof vi.fn>
  bindFields: ReturnType<typeof vi.fn>
  collapse: ReturnType<typeof vi.fn>
}

function createFormExpose(): FormExposeStub {
  const model = reactive<Record<string, any>>({})
  return {
    model,
    use: vi.fn(),
    submit: vi.fn((callback: (model: Record<string, any>, errors?: Record<string, any>) => void) => {
      callback(model, undefined)
    }),
    resetFields: vi.fn(),
    bindFields: vi.fn(),
    collapse: vi.fn(),
  }
}

let formExpose: FormExposeStub = createFormExpose()

interface CrudStub {
  params: Record<string, any>
  refresh: ReturnType<typeof vi.fn>
  setParams: ReturnType<typeof vi.fn>
  getParams: () => Record<string, any>
  dict: { label: Record<string, string> }
}

function createCrudStub(): CrudStub {
  const stub: CrudStub = {
    params: { page: 1, size: 20 },
    refresh: vi.fn(async () => "refresh-result"),
    setParams: vi.fn((data: Record<string, any>) => {
      stub.params = { ...stub.params, ...data }
    }),
    getParams: () => stub.params,
    dict: { label: { search: "搜索", reset: "重置", collapse: "收起", expand: "展开更多" } },
  }
  return stub
}

function createMittStub() {
  const handlers: Record<string, Array<(payload?: any) => void>> = {}
  return {
    handlers,
    on: vi.fn((event: string, handler: (payload?: any) => void) => {
      handlers[event] = handlers[event] ?? []
      handlers[event].push(handler)
    }),
    off: vi.fn((event: string, handler?: (payload?: any) => void) => {
      if (!handlers[event])
        return
      if (!handler) {
        handlers[event] = []
      }
      else {
        handlers[event] = handlers[event].filter(item => item !== handler)
      }
    }),
    emit: vi.fn((event: string, payload?: any) => {
      handlers[event]?.forEach(handler => handler(payload))
    }),
  }
}

const coreStore = {
  crud: createCrudStub(),
  mitt: createMittStub(),
}

vi.mock("@/hooks", () => ({
  useCore: () => coreStore,
}))

const ElButtonStub = defineComponent({
  name: "ElButtonStub",
  emits: ["click"],
  setup(_, { slots, emit }) {
    return () =>
      h(
        "button",
        {
          type: "button",
          class: "el-button-stub",
          onClick: () => emit("click"),
        },
        slots.default?.(),
      )
  },
})

const ElIconStub = defineComponent({
  name: "ElIconStub",
  setup(_, { slots }) {
    return () => h("span", { class: "el-icon-stub" }, slots.default?.())
  },
})

function mountSearch(options: MountingOptions<any> = {}) {
  const toWithArray = (slot?: any) => {
    if (slot === undefined)
      return undefined
    return Array.isArray(slot) ? slot : [slot]
  }

  const mergedSlots: Record<string, any> = { ...(options.slots ?? {}) }
  mergedSlots.default = toWithArray(options.slots?.default) ?? [() => h("div", "slot")]
  Object.keys(mergedSlots).forEach((key) => {
    mergedSlots[key] = toWithArray(mergedSlots[key]) ?? mergedSlots[key]
  })

  return mount(Search, {
    slots: mergedSlots as MountingOptions<any>["slots"],
    global: {
      stubs: {
        "el-button": ElButtonStub,
        "el-icon": ElIconStub,
        ...(options.global?.stubs ?? {}),
      },
      ...(options.global ?? {}),
    },
    shallow: true,
    ...options,
  })
}

function getExpose(wrapper: ReturnType<typeof mountSearch>) {
  return (wrapper.vm.$.exposed ?? {}) as SearchExpose
}

describe("fd-search", () => {
  beforeEach(() => {
    formExpose = createFormExpose()
    coreStore.crud = createCrudStub()
    coreStore.mitt = createMittStub()
  })

  it("use 将配置透传给 fd-form", async () => {
    const wrapper = mountSearch()
    const search = getExpose(wrapper)
    expect(search.form).toBeDefined()
    search.form!.value = formExpose as unknown as FdFormInstance
    await nextTick()
    const options: Parameters<SearchExpose["use"]>[0] = {
      form: {
        model: { keyword: "" },
        items: [
          { field: "keyword", label: "关键字", component: { is: "el-input" } },
        ],
      },
      actions: [{ type: "search", text: "查询" }],
    }
    search.use(options)
    expect(formExpose.use).toHaveBeenCalledTimes(1)
    expect(formExpose.use).toHaveBeenCalledWith(expect.objectContaining({
      model: expect.objectContaining({ keyword: "" }),
      items: expect.arrayContaining([
        expect.objectContaining({ field: "keyword" }),
      ]),
    }))
  })

  it("search 会写入查询参数并调用 crud.refresh", async () => {
    const wrapper = mountSearch()
    const search = getExpose(wrapper)
    expect(search.form).toBeDefined()
    search.form!.value = formExpose as unknown as FdFormInstance
    await nextTick()
    formExpose.model.keyword = "Vue3"
    coreStore.crud.refresh = vi.fn(async () => "ok")
    const result = await search.search({ status: true })
    expect(coreStore.crud.setParams).toHaveBeenCalledWith(expect.objectContaining({
      keyword: "Vue3",
      status: true,
      page: 1,
      size: 20,
    }))
    expect(coreStore.crud.refresh).toHaveBeenCalledWith(expect.objectContaining({
      keyword: "Vue3",
      status: true,
    }))
    expect(result).toBe("ok")
  })

  it("reset 会清空模型并触发 table.clearSelection", async () => {
    const wrapper = mountSearch()
    const search = getExpose(wrapper)
    expect(search.form).toBeDefined()
    search.form!.value = formExpose as unknown as FdFormInstance
    await nextTick()
    coreStore.crud.refresh = vi.fn(async () => "reset-ok")
    const result = await search.reset({ status: false })
    expect(formExpose.resetFields).toHaveBeenCalled()
    expect(formExpose.bindFields).toHaveBeenCalledWith({ status: false })
    expect(coreStore.mitt.emit).toHaveBeenCalledWith("table.clearSelection")
    expect(coreStore.crud.refresh).toHaveBeenCalled()
    expect(result).toBe("reset-ok")
  })
})
type FdFormInstance = InstanceType<typeof FdFormComponent>
