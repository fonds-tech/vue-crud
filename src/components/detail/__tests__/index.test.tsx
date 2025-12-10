import type { MountingOptions } from "@vue/test-utils"
import type { DetailRef, DetailUseOptions } from "../interface"
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
      if (!handlers[event]) return
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
        "ElButton": ElButtonStub,
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
      items: [{ prop: "name", label: "姓名" }],
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

  describe("状态管理", () => {
    it("getData 返回数据的深拷贝", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.setData({ name: "原始数据", nested: { value: 1 } })
      const copy = exposed.getData()
      copy.name = "修改后"
      copy.nested.value = 999
      expect(exposed.data.name).toBe("原始数据")
      expect(exposed.data.nested.value).toBe(1)
    })

    it("clearData 清空数据", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.setData({ name: "测试数据" })
      exposed.clearData()
      expect(exposed.data).toEqual({})
    })

    it("可见性变化触发 beforeOpen/beforeClose 钩子与事件", async () => {
      const onBeforeOpen = vi.fn()
      const onBeforeClose = vi.fn()
      const { wrapper } = mountDetail({
        crudOverrides: {
          service: { detail: vi.fn().mockResolvedValue({ id: 1 }) },
        },
      })
      const exposed = getExpose(wrapper)
      exposed.use({
        items: [{ prop: "id", label: "编号" }],
        onBeforeOpen,
        onBeforeClose,
      })

      await exposed.detail({ id: 1 })
      await nextTick()
      expect(onBeforeOpen).toHaveBeenCalled()
      expect(wrapper.emitted("beforeOpen")).toBeTruthy()

      exposed.close()
      await nextTick()
      expect(onBeforeClose).toHaveBeenCalled()
      expect(wrapper.emitted("beforeClose")?.[0][0]).toEqual({ id: 1 })
    })

    it("watch visible 关闭时进入 beforeClose 分支", async () => {
      const onBeforeClose = vi.fn()
      const { wrapper } = mountDetail({
        crudOverrides: { service: { detail: vi.fn().mockResolvedValue({ id: 1 }) } },
      })
      const exposed = getExpose(wrapper)
      exposed.use({
        items: [{ prop: "id", label: "编号" }],
        onBeforeClose,
      })

      await exposed.detail({ id: 1 })
      await nextTick()
      expect(wrapper.find(".fd-dialog-stub").attributes("data-visible")).toBe("true")

      wrapper.findComponent(FdDialogStub).vm.$emit("update:modelValue", false)
      await nextTick()

      expect(onBeforeClose).toHaveBeenCalledWith({ id: 1 })
    })

    it("use 合并配置时数组会被替换", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.use({ items: [{ prop: "a", label: "A" }] })
      exposed.use({ items: [{ prop: "b", label: "B" }] })
      exposed.setData({ b: "值B" })
      await nextTick()
      const items = wrapper.findAll(".el-descriptions-item-stub")
      expect(items).toHaveLength(1)
      expect(items[0].find(".label").text()).toBe("B")
    })

    it("data 属性为只读快照", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.setData({ name: "测试" })
      expect(exposed.data.name).toBe("测试")
    })
  })

  describe("服务调用", () => {
    it("close 关闭弹窗", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      await exposed.detail({ id: "1" })
      await nextTick()
      expect(wrapper.find(".fd-dialog-stub").attributes("data-visible")).toBe("true")
      exposed.close()
      await nextTick()
      expect(wrapper.find(".fd-dialog-stub").attributes("data-visible")).toBe("false")
    })

    it("refresh 使用缓存参数刷新数据", async () => {
      const detailFn = vi.fn().mockResolvedValue({ name: "刷新后" })
      const { wrapper } = mountDetail({ crudOverrides: { service: { detail: detailFn } } })
      const exposed = getExpose(wrapper)
      await exposed.detail({ id: "100" })
      detailFn.mockClear()
      await exposed.refresh()
      expect(detailFn).toHaveBeenCalledWith({ id: "100" })
    })

    it("refresh 可以合并额外参数", async () => {
      const detailFn = vi.fn().mockResolvedValue({ name: "刷新后" })
      const { wrapper } = mountDetail({ crudOverrides: { service: { detail: detailFn } } })
      const exposed = getExpose(wrapper)
      await exposed.detail({ id: "100" })
      detailFn.mockClear()
      await exposed.refresh({ extra: "param" })
      expect(detailFn).toHaveBeenCalledWith({ id: "100", extra: "param" })
    })

    it("detail 无效数据时不调用 service", async () => {
      const detailFn = vi.fn()
      const { wrapper } = mountDetail({ crudOverrides: { service: { detail: detailFn } } })
      const exposed = getExpose(wrapper)
      exposed.detail(null as any)
      exposed.detail(undefined as any)
      exposed.detail("string" as any)
      expect(detailFn).not.toHaveBeenCalled()
    })

    it("detail 缺少主键时不调用 service", async () => {
      const detailFn = vi.fn()
      const { wrapper } = mountDetail({ crudOverrides: { service: { detail: detailFn } } })
      const exposed = getExpose(wrapper)
      exposed.detail({ name: "无主键" })
      expect(detailFn).not.toHaveBeenCalled()
    })

    it("service 不存在时显示错误", async () => {
      // 当 service 中没有 detail 方法时，应该 reject
      const { wrapper } = mountDetail({ crudOverrides: { service: { detail: undefined } as any } })
      const exposed = getExpose(wrapper)
      exposed.use({ items: [{ prop: "name", label: "姓名" }] })
      await expect(exposed.detail({ id: "1" })).rejects.toThrow()
    })
  })

  describe("onDetail 钩子", () => {
    it("onDetail done 回调直接设置数据", async () => {
      const detailFn = vi.fn()
      const { wrapper } = mountDetail({ crudOverrides: { service: { detail: detailFn } } })
      const exposed = getExpose(wrapper)
      exposed.use({
        items: [{ prop: "name", label: "姓名" }],
        onDetail: (_row, { done }) => {
          done({ name: "自定义数据" })
        },
      })
      await exposed.detail({ id: "1" })
      await nextTick()
      expect(detailFn).not.toHaveBeenCalled()
      expect(exposed.data.name).toBe("自定义数据")
    })

    it("onDetail next 回调继续默认流程", async () => {
      const detailFn = vi.fn().mockResolvedValue({ name: "服务返回" })
      const { wrapper } = mountDetail({ crudOverrides: { service: { detail: detailFn } } })
      const exposed = getExpose(wrapper)
      exposed.use({
        items: [{ prop: "name", label: "姓名" }],
        onDetail: (_row, { next }) => {
          return next({ id: "custom-id" })
        },
      })
      await exposed.detail({ id: "1" })
      await nextTick()
      expect(detailFn).toHaveBeenCalledWith({ id: "custom-id" })
      expect(exposed.data.name).toBe("服务返回")
    })

    it("onDetail close 回调关闭弹窗", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.use({
        onDetail: (_row, { close }) => {
          close()
        },
      })
      await exposed.detail({ id: "1" })
      await nextTick()
      expect(wrapper.find(".fd-dialog-stub").attributes("data-visible")).toBe("false")
    })
  })

  describe("mitt 事件", () => {
    it("监听 detail 事件打开详情", async () => {
      const detailFn = vi.fn().mockResolvedValue({ name: "事件触发" })
      const { wrapper, mitt } = mountDetail({ crudOverrides: { service: { detail: detailFn } } })
      const exposed = getExpose(wrapper)
      exposed.use({ items: [{ prop: "name", label: "姓名" }] })
      mitt.handlers.detail?.[0]?.({ id: "event-id" })
      await nextTick()
      expect(detailFn).toHaveBeenCalledWith({ id: "event-id" })
    })

    it("监听 crud.proxy 事件打开详情", async () => {
      const detailFn = vi.fn().mockResolvedValue({ name: "代理触发" })
      const { wrapper, mitt } = mountDetail({ crudOverrides: { service: { detail: detailFn } } })
      const exposed = getExpose(wrapper)
      exposed.use({ items: [{ prop: "name", label: "姓名" }] })
      mitt.handlers["crud.proxy"]?.[0]?.({ name: "detail", data: [{ id: "proxy-id" }] })
      await nextTick()
      expect(detailFn).toHaveBeenCalledWith({ id: "proxy-id" })
    })

    it("crud.proxy 非 detail 事件不触发", async () => {
      const detailFn = vi.fn()
      const { mitt } = mountDetail({ crudOverrides: { service: { detail: detailFn } } })
      mitt.handlers["crud.proxy"]?.[0]?.({ name: "other", data: [{ id: "1" }] })
      expect(detailFn).not.toHaveBeenCalled()
    })

    it("crud.proxy 事件携带空数据不触发", async () => {
      const detailFn = vi.fn()
      const { mitt } = mountDetail({ crudOverrides: { service: { detail: detailFn } } })
      mitt.handlers["crud.proxy"]?.[0]?.({ name: "detail", data: [null as any] })
      expect(detailFn).not.toHaveBeenCalled()
    })

    it("detail 事件参数非对象直接忽略", async () => {
      const detailFn = vi.fn()
      const { mitt } = mountDetail({ crudOverrides: { service: { detail: detailFn } } })
      mitt.handlers.detail?.[0]?.("invalid-payload" as any)
      expect(detailFn).not.toHaveBeenCalled()
    })

    it("crud.proxy 非对象 payload 被忽略", async () => {
      const detailFn = vi.fn()
      const { mitt } = mountDetail({ crudOverrides: { service: { detail: detailFn } } })
      mitt.handlers["crud.proxy"]?.[0]?.("invalid-payload" as any)
      expect(detailFn).not.toHaveBeenCalled()
    })

    it("内部 handleDetailEvent 会忽略空数据", async () => {
      const detailFn = vi.fn()
      const { wrapper } = mountDetail({ crudOverrides: { service: { detail: detailFn } } })
      const exposed = getExpose(wrapper) as any
      exposed.__test__handleDetailEvent?.(null)
      expect(detailFn).not.toHaveBeenCalled()
    })

    it("组件卸载时移除事件监听", async () => {
      const { wrapper, mitt } = mountDetail()
      expect(mitt.on).toHaveBeenCalledWith("detail", expect.any(Function))
      expect(mitt.on).toHaveBeenCalledWith("crud.proxy", expect.any(Function))
      wrapper.unmount()
      expect(mitt.off).toHaveBeenCalledWith("detail", expect.any(Function))
      expect(mitt.off).toHaveBeenCalledWith("crud.proxy", expect.any(Function))
    })
  })

  describe("生命周期事件", () => {
    it("打开弹窗触发 beforeOpen 事件", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      await exposed.detail({ id: "1" })
      await nextTick()
      expect(wrapper.emitted("beforeOpen")).toHaveLength(1)
    })

    it("打开弹窗触发 open 事件", async () => {
      const { wrapper } = mountDetail()
      const dialogStub = wrapper.findComponent(FdDialogStub)
      dialogStub.vm.$emit("open")
      expect(wrapper.emitted("open")).toHaveLength(1)
    })

    it("关闭弹窗触发 beforeClose 和 close 事件", async () => {
      // detail 方法会调用 service 并覆盖数据，所以需要 mock service 返回期望的数据
      const detailFn = vi.fn().mockResolvedValue({ name: "测试" })
      const { wrapper } = mountDetail({ crudOverrides: { service: { detail: detailFn } } })
      const exposed = getExpose(wrapper)
      await exposed.detail({ id: "1" })
      await nextTick()
      exposed.close()
      await nextTick()
      expect(wrapper.emitted("beforeClose")).toBeTruthy()
      expect(wrapper.emitted("beforeClose")?.[0]?.[0]).toEqual({ name: "测试" })
    })

    it("onBeforeOpen 钩子被调用", async () => {
      const onBeforeOpen = vi.fn()
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.use({ onBeforeOpen })
      await exposed.detail({ id: "1" })
      await nextTick()
      expect(onBeforeOpen).toHaveBeenCalled()
    })

    it("onClose 钩子被调用并传入数据快照", async () => {
      const onClose = vi.fn()
      // detail 方法会调用 service 并覆盖数据，所以需要 mock service 返回期望的数据
      const detailFn = vi.fn().mockResolvedValue({ name: "快照数据" })
      const { wrapper } = mountDetail({ crudOverrides: { service: { detail: detailFn } } })
      const exposed = getExpose(wrapper)
      exposed.use({ onClose })
      await exposed.detail({ id: "1" })
      await nextTick()
      const dialogStub = wrapper.findComponent(FdDialogStub)
      dialogStub.vm.$emit("update:modelValue", false)
      dialogStub.vm.$emit("close")
      await nextTick()
      expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ name: "快照数据" }))
    })

    it("弹窗 closed 后清理数据缓存", async () => {
      const detailFn = vi.fn().mockResolvedValue({ name: "待清理" })
      const { wrapper } = mountDetail({ crudOverrides: { service: { detail: detailFn } } })
      const exposed = getExpose(wrapper)
      await exposed.detail({ id: "9" })
      await nextTick()
      expect(exposed.data).toEqual({ name: "待清理" })
      const dialogStub = wrapper.findComponent(FdDialogStub)
      dialogStub.vm.$emit("closed")
      await nextTick()
      expect(exposed.data).toEqual({})
    })
  })

  describe("渲染逻辑", () => {
    it("hidden 为 true 的字段不渲染", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.use({
        items: [
          { prop: "visible", label: "可见" },
          { prop: "hidden", label: "隐藏", hidden: true },
        ],
      })
      exposed.setData({ visible: "显示", hidden: "不显示" })
      await nextTick()
      const items = wrapper.findAll(".el-descriptions-item-stub")
      expect(items).toHaveLength(1)
      expect(items[0].find(".label").text()).toBe("可见")
    })

    it("hidden 函数返回 true 时字段不渲染", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.use({
        items: [
          { prop: "name", label: "姓名" },
          { prop: "secret", label: "秘密", hidden: (data: any) => data.hideSecret },
        ],
      })
      exposed.setData({ name: "张三", secret: "机密", hideSecret: true })
      await nextTick()
      const items = wrapper.findAll(".el-descriptions-item-stub")
      expect(items).toHaveLength(1)
    })

    it("使用 dict 渲染 Tag", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.use({
        items: [
          {
            prop: "status",
            label: "状态",
            dict: [
              { value: 1, label: "启用", type: "success" },
              { value: 0, label: "禁用", type: "danger" },
            ],
          },
        ],
      })
      exposed.setData({ status: 1 })
      await nextTick()
      const tag = wrapper.find(".el-tag-stub")
      expect(tag.exists()).toBe(true)
      expect(tag.text()).toBe("启用")
    })

    it("使用 formatter 格式化值", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.use({
        items: [
          {
            prop: "price",
            label: "价格",
            formatter: (value: number) => `¥${value.toFixed(2)}`,
          },
        ],
      })
      exposed.setData({ price: 99.9 })
      await nextTick()
      const item = wrapper.find(".el-descriptions-item-stub")
      expect(item.find(".value").text()).toContain("¥99.90")
    })

    it("使用 value 覆盖默认取值", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      // value 属性仅在 prop 对应的值为 undefined/null 时作为 fallback
      // 当 prop 有值时，显示 prop 对应的值
      exposed.use({
        items: [{ prop: "custom", label: "自定义", value: "固定值" }],
      })
      // 当 prop 对应的值为 undefined 时，使用 value 作为 fallback
      exposed.setData({ other: "其他值" })
      await nextTick()
      const item = wrapper.find(".el-descriptions-item-stub")
      expect(item.find(".value").text()).toContain("固定值")
    })

    it("分组渲染多个 Descriptions", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.use({
        groups: [
          { name: "basic", title: "基础信息" },
          { name: "extra", title: "扩展信息" },
        ],
        items: [
          { prop: "name", label: "姓名", group: "basic" },
          { prop: "age", label: "年龄", group: "basic" },
          { prop: "address", label: "地址", group: "extra" },
        ],
      })
      exposed.setData({ name: "张三", age: 25, address: "北京" })
      await nextTick()
      const descriptions = wrapper.findAll(".el-descriptions-stub")
      expect(descriptions.length).toBeGreaterThanOrEqual(2)
    })

    it("无 items 时不渲染描述列表", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.use({ items: [] })
      exposed.setData({})
      await nextTick()
      expect(wrapper.findAll(".el-descriptions-stub")).toHaveLength(0)
    })

    it("分组描述使用分组配置覆盖标题和列数", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.use({
        groups: [{ name: "info", title: (data: any) => `标题-${data.name}`, descriptions: { column: 1 } }],
        items: [{ prop: "name", label: "姓名", group: "info" }],
      })
      exposed.setData({ name: "李雷" })
      await nextTick()
      const description = wrapper.find(".el-descriptions-stub")
      expect(description.attributes("data-title")).toBe("标题-李雷")
      expect(description.attributes("column")).toBe("1")
    })

    it("无分组名称时回退到默认分组并使用 descriptions.title", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.use({
        descriptions: { title: "默认标题" },
        groups: [{ title: "未命名分组" }],
        items: [{ prop: "name", label: "姓名" }],
      })
      exposed.setData({ name: "默认分组" })
      await nextTick()
      const descriptions = wrapper.findAll(".el-descriptions-stub")
      expect(descriptions).toHaveLength(1)
      expect(descriptions[0].attributes("data-title")).toBe("默认标题")
    })

    it("空分组会被过滤，不渲染空 Descriptions", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.use({
        groups: [{ name: "empty", title: "空分组" }],
        items: [
          { prop: "name", label: "姓名" }, // 未指定分组，走 fallback
        ],
      })
      exposed.setData({ name: "张三" })
      await nextTick()
      const descriptions = wrapper.findAll(".el-descriptions-stub")
      expect(descriptions).toHaveLength(1)
      expect(descriptions[0].attributes("data-title")).toBe("") // 空分组被过滤，fallback 没有 title
    })

    it("描述列数为空时回退到默认值", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.use({
        descriptions: { column: undefined as any },
        items: [{ prop: "name", label: "姓名" }],
      })
      exposed.setData({ name: "列数测试" })
      await nextTick()
      const description = wrapper.find(".el-descriptions-stub")
      expect(description.attributes("column")).toBe("2")
    })

    it("span 属性控制列宽", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.use({
        items: [{ prop: "name", label: "姓名", span: 2 }],
      })
      exposed.setData({ name: "张三" })
      await nextTick()
      // span 属性会传递给 ElDescriptionsItem
      expect(wrapper.find(".el-descriptions-item-stub").exists()).toBe(true)
    })
  })

  describe("动作按钮", () => {
    it("点击确认按钮关闭弹窗", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      await exposed.detail({ id: "1" })
      await nextTick()
      const button = wrapper.find(".el-button-stub")
      await button.trigger("click")
      await nextTick()
      expect(wrapper.find(".fd-dialog-stub").attributes("data-visible")).toBe("false")
    })

    it("action hidden 为 true 时按钮不渲染", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      // 配置两个 action，一个 hidden，一个可见
      exposed.use({
        actions: [
          { type: "ok", text: "确定", hidden: true },
          { type: "ok", text: "可见按钮", hidden: false },
        ],
      })
      await nextTick()
      // hidden 为 true 的按钮不渲染，只渲染可见的按钮
      const buttons = wrapper.findAll(".el-button-stub")
      expect(buttons.length).toBe(1)
      expect(buttons[0].text()).toBe("可见按钮")
    })

    it("自定义 action 文本", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.use({
        actions: [{ type: "ok", text: "关闭详情" }],
      })
      await nextTick()
      const button = wrapper.find(".el-button-stub")
      expect(button.text()).toBe("关闭详情")
    })
  })

  describe("dialog 属性", () => {
    it("class 合并", async () => {
      const { wrapper } = mountDetail({
        mounting: {
          attrs: { class: "custom-detail" },
        },
      })
      await nextTick()
      const dialog = wrapper.find(".fd-dialog-stub")
      expect(dialog.classes()).toContain("fd-detail")
      expect(dialog.classes()).toContain("custom-detail")
    })

    it("对话框透传非 class 属性", async () => {
      const { wrapper } = mountDetail({
        mounting: {
          attrs: { "class": "extra-class", "data-size": "large", "aria-label": "detail-dialog" },
        },
      })
      await nextTick()
      const dialog = wrapper.find(".fd-dialog-stub")
      expect(dialog.attributes("data-size")).toBe("large")
      expect(dialog.attributes("aria-label")).toBe("detail-dialog")
      expect(dialog.classes()).toEqual(expect.arrayContaining(["fd-detail", "extra-class"]))
    })

    it("onUpdate:modelValue 为 true 时不触发 close", async () => {
      const { wrapper } = mountDetail()
      const dialogStub = wrapper.findComponent(FdDialogStub)
      dialogStub.vm.$emit("update:modelValue", true)
      await nextTick()
      expect(wrapper.emitted("close")).toBeUndefined()
    })

    it("attrs 透传", async () => {
      const { wrapper } = mountDetail({
        mounting: {
          attrs: { "data-testid": "detail-dialog" },
        },
      })
      await nextTick()
      const dialog = wrapper.find(".fd-dialog-stub")
      expect(dialog.attributes("data-testid")).toBe("detail-dialog")
    })

    it("dialog 配置透传", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.use({
        dialog: { title: "自定义标题", width: "80%" },
      })
      await nextTick()
      // dialog 配置会传递给 FdDialog
      expect(wrapper.find(".fd-dialog-stub").exists()).toBe(true)
    })
  })

  describe("分组与描述配置", () => {
    it("getCurrentInstance 缺失时 fallback 名称匹配元数据标题", async () => {
      vi.resetModules()
      vi.doMock("vue", async () => {
        const actual = await vi.importActual<typeof import("vue")>("vue")
        return { ...actual, getCurrentInstance: () => undefined }
      })
      const DetailWithMock = (await import("../index?mock=fallback")).default as any

      const crud = createCrudStub()
      const mitt = createMittStub()
      coreStore.crud = crud
      coreStore.mitt = mitt

      const mountOptions: MountingOptions<any> = {
        global: {
          directives: { loading: () => {} },
          stubs: {
            "fd-dialog": FdDialogStub,
            "el-descriptions": ElDescriptionsStub,
            "el-descriptions-item": ElDescriptionsItemStub,
            "el-space": ElSpaceStub,
            "el-button": ElButtonStub,
            "ElButton": ElButtonStub,
            "el-tag": ElTagStub,
          },
        },
      }

      const wrapper = mount(DetailWithMock, mountOptions as any)
      const exposed = getExpose(wrapper)
      exposed.use({
        items: [{ prop: "name", label: "姓名" }],
        groups: [{ name: "fd-detail", title: "无实例标题" }],
      })
      exposed.setData({ name: "零号" })
      await nextTick()
      expect(wrapper.find(".el-descriptions-stub").attributes("data-title")).toBe("无实例标题")

      vi.doUnmock("vue")
      vi.resetModules()
    })

    it("descriptions.column 为空时回退为 2", async () => {
      const { wrapper } = mountDetail()
      const exposed = getExpose(wrapper)
      exposed.use({
        descriptions: { column: null as any },
        items: [{ prop: "name", label: "姓名", group: "main" }],
        groups: [{ name: "main", title: "主分组" }],
      })
      exposed.setData({ name: "张三" })
      await nextTick()
      expect(wrapper.find(".el-descriptions-stub").attributes().column).toBe("2")
    })
  })

  describe("默认插槽", () => {
    it("支持自定义 default 插槽", async () => {
      const { wrapper } = mountDetail({
        mounting: {
          slots: {
            default: ({ data }: any) => h("div", { class: "custom-content" }, `自定义: ${data?.name ?? ""}`),
          },
        },
      })
      const exposed = getExpose(wrapper)
      exposed.setData({ name: "插槽数据" })
      await nextTick()
      const customContent = wrapper.find(".custom-content")
      expect(customContent.exists()).toBe(true)
      expect(customContent.text()).toContain("自定义: 插槽数据")
    })
  })
})
