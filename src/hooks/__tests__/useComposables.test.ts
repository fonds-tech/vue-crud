import { mount } from "@vue/test-utils"
import { useCrud } from "../useCrud"
import { useForm } from "../useForm"
import { useUpsert } from "../useUpsert"
import { it, vi, expect, describe } from "vitest"
import { h, nextTick, defineComponent } from "vue"

function mountWithParent(name: string, stub: any, childSetup: () => void) {
  const Child = defineComponent({
    setup() {
      childSetup()
      return () => null
    },
  })

  const Parent = defineComponent({
    name,
    setup(_, { slots, expose }) {
      expose(stub)
      return () => slots.default?.()
    },
  })

  mount(Parent, {
    slots: {
      default: () => h(Child),
    },
  })
}

describe("useCrud", () => {
  it("injects options and triggers callback once实例可用", async () => {
    const stub = { use: vi.fn() }
    const callback = vi.fn()
    const service = { page: vi.fn() }
    let received: any

    mountWithParent("fd-crud", stub, () => {
      received = useCrud({ service }, callback)
    })
    await nextTick()
    await nextTick()

    expect(received?.value).toBeDefined()
    expect(stub.use).toHaveBeenCalledWith({ service })
    expect(callback).toHaveBeenCalledWith(stub)
    expect(received?.value?.use).toBe(stub.use)
  })
})

describe("useForm", () => {
  it("调用 form.use 注入配置", async () => {
    const stub = { use: vi.fn() }
    const formOptions = {
      model: { name: "" },
      items: [],
    }
    let received: any

    mountWithParent("fd-form", stub, () => {
      received = useForm(formOptions)
    })
    await nextTick()

    expect(stub.use).toHaveBeenCalledWith(formOptions)
    expect(received?.value?.use).toBe(stub.use)
  })
})

describe("useUpsert", () => {
  it("自动在 upsert 实例上执行 use", async () => {
    const stub = { use: vi.fn() }
    const upsertOptions = {
      model: { status: 1 },
      items: [],
    }
    let received: any

    mountWithParent("fd-upsert", stub, () => {
      received = useUpsert(upsertOptions)
    })
    await nextTick()

    expect(stub.use).toHaveBeenCalledWith(upsertOptions)
    expect(received?.value?.use).toBe(stub.use)
  })
})
