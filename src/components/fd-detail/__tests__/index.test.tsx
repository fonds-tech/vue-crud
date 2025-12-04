import type { MountingOptions } from "@vue/test-utils"
import type { DetailRef, DetailUseOptions } from "../types"
import Detail from "../index"
import { mount } from "@vue/test-utils"
import { it, vi, expect, describe } from "vitest"
import { h, nextTick, defineComponent } from "vue"

const FdDialogStub = defineComponent({
  name: "FdDialogStub",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "open", "close"],
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          ...attrs,
          "class": ["fd-dialog-stub", attrs.class],
          "data-visible": props.modelValue,
        },
        [slots.default?.(), slots.footer?.()],
      )
  },
})

const ElDescriptionsStub = defineComponent({
  name: "ElDescriptionsStub",
  inheritAttrs: false,
  props: {
    title: String,
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "section",
        {
          ...attrs,
          "class": ["el-descriptions-stub", attrs.class],
          "data-title": props.title ?? "",
        },
        slots.default?.(),
      )
  },
})

const ElDescriptionsItemStub = defineComponent({
  name: "ElDescriptionsItemStub",
  inheritAttrs: false,
  props: {
    label: String,
  },
  setup(props, { slots, attrs }) {
    return () =>
      h("div", { ...attrs, class: ["el-descriptions-item-stub", attrs.class] }, [
        h("strong", { class: "label" }, props.label ?? ""),
        h("div", { class: "value" }, slots.default?.()),
      ])
  },
})

const ElSpaceStub = defineComponent({
  name: "ElSpaceStub",
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () => h("div", { ...attrs, class: ["el-space-stub", attrs.class] }, slots.default?.())
  },
})

const ElButtonStub = defineComponent({
  name: "ElButtonStub",
  inheritAttrs: false,
  emits: ["click"],
  setup(_, { slots, emit, attrs }) {
    return () =>
      h(
        "button",
        {
          type: "button",
          ...attrs,
          class: ["el-button-stub", attrs.class],
          onClick: (event: MouseEvent) => emit("click", event),
        },
        slots.default?.(),
      )
  },
})

const ElTagStub = defineComponent({
  name: "ElTagStub",
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () => h("span", { ...attrs, class: ["el-tag-stub", attrs.class] }, slots.default?.())
  },
})

interface DetailExpose extends DetailRef {
  use: (options: DetailUseOptions) => void
  setData: (value: Record<string, any>) => void
  detail: (row: Record<string, any>) => Promise<any>
}

interface CrudStub {
  dict: {
    primaryId: string
    api: Record<string, string>
    label: Record<string, string>
  }
  service: {
    detail: ReturnType<typeof vi.fn>
  }
  permission: Record<string, any>
}

type MittHandler = (payload?: any) => void

const coreStore = {
  crud: createCrudStub(),
  mitt: createMittStub(),
}

vi.mock("@/hooks", () => ({
  useCore: () => coreStore,
}))

function createCrudStub(overrides: Partial<CrudStub> = {}): CrudStub {
  const detailFn = vi.fn().mockResolvedValue({ name: "默认姓名" })
  const base: CrudStub = {
    dict: {
      primaryId: "id",
      api: { detail: "detail" },
      label: { confirm: "确认", detail: "详情" },
    },
    service: { detail: detailFn },
    permission: {},
  }
  return {
    ...base,
    ...overrides,
    dict: { ...base.dict, ...(overrides.dict ?? {}) },
    service: { ...base.service, ...(overrides.service ?? {}) },
    permission: { ...base.permission, ...(overrides.permission ?? {}) },
  }
}

function createMittStub() {
  const handlers: Record<string, MittHandler[]> = {}
  return {
    handlers,
    on: vi.fn((event: string, handler: MittHandler) => {
      handlers[event] = handlers[event] ?? []
      handlers[event].push(handler)
    }),
    off: vi.fn((event: string, handler?: MittHandler) => {
      if (!handlers[event])
        return
      if (!handler) {
        handlers[event] = []
        return
      }
      handlers[event] = handlers[event].filter(fn => fn !== handler)
    }),
  }
}

function mountDetail(options: { crudOverrides?: Partial<CrudStub>, mounting?: MountingOptions<any> } = {}) {
  const crud = createCrudStub(options.crudOverrides)
  const mitt = createMittStub()
  coreStore.crud = crud
  coreStore.mitt = mitt
  const baseSlots: NonNullable<MountingOptions<any>["slots"]> = {}
  const mountOptions: MountingOptions<any> = {
    ...options.mounting,
    slots: {
      ...baseSlots,
      ...(options.mounting?.slots ?? {}),
    },
    global: {
      directives: {
        loading: () => {},
      },
      stubs: {
        "fd-dialog": FdDialogStub,
        "el-descriptions": ElDescriptionsStub,
        "el-descriptions-item": ElDescriptionsItemStub,
        "el-space": ElSpaceStub,
        "el-button": ElButtonStub,
        "el-tag": ElTagStub,
        ...(options.mounting?.global?.stubs ?? {}),
      },
      ...(options.mounting?.global ?? {}),
    },
  }
  const wrapper = mount(Detail as any, mountOptions as any)
  return { wrapper, crud, mitt }
}

function getExpose(wrapper: ReturnType<typeof mountDetail>["wrapper"]): DetailExpose {
  return (wrapper.vm.$.exposed ?? {}) as DetailExpose
}

describe("fd-detail", () => {
  it("use 与 setData 能够渲染描述项", async () => {
    const { wrapper } = mountDetail()
    const exposed = getExpose(wrapper)
    exposed.use({
      items: [
        { prop: "name", label: "姓名" },
      ],
    })
    exposed.setData({ name: "张三" })
    await nextTick()
    const item = wrapper.find(".el-descriptions-item-stub")
    expect(item.find(".label").text()).toBe("姓名")
    expect(item.find(".value").text()).toContain("张三")
  })

  it("detail 方法会调用 service 并更新数据", async () => {
    const detailFn = vi.fn().mockResolvedValue({ name: "李四" })
    const { wrapper } = mountDetail({ crudOverrides: { service: { detail: detailFn } } })
    const exposed = getExpose(wrapper)
    exposed.use({ items: [{ prop: "name", label: "姓名" }] })
    await exposed.detail({ id: "100", extra: "ignored" })
    await nextTick()
    expect(detailFn).toHaveBeenCalledWith({ id: "100" })
    expect(exposed.data.name).toBe("李四")
  })

  it("默认动作按钮使用字典文案", async () => {
    const { wrapper } = mountDetail()
    await nextTick()
    const button = wrapper.find(".el-button-stub")
    expect(button.text()).toBe("确认")
  })
})
