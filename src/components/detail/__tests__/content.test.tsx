import type { RenderCtx } from "../render/content"
import { mount } from "@vue/test-utils"
import { h, defineComponent } from "vue"
import { renderDetailContent } from "../render/content"
import { it, vi, expect, describe, afterEach } from "vitest"
import * as helpers from "../core/helpers"

describe("renderDetailContent", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("渲染分组插槽、组件回退以及 label 插槽", () => {
    const data = { status: 1, name: "张三" }
    const groupSlot = vi.fn(() => "group extra")
    const labelSlot = vi.fn(() => h("span", "label slot"))
    const renderComponentSlotSpy = vi.spyOn(helpers, "renderComponentSlot")

    const ctx: RenderCtx<typeof data> = {
      options: { dialog: { loadingText: "加载" } } as any,
      groups: [
        {
          name: "g1",
          title: "组1",
          descriptions: {
            slots: {
              extra: { slot: "group-extra" },
              custom: { is: "section", props: { class: "desc-slot" } },
            },
          },
          items: [
            {
              prop: "status",
              label: "状态",
              dict: [{ label: "正常", value: 1, type: "success", color: "green" }],
              slots: {
                extra: { is: "i", props: { class: "slot-entry" } },
              },
            },
          ],
        },
      ],
      data: { value: data },
      loading: { value: false },
      cache: { value: 1 },
      userSlots: {
        "group-extra": groupSlot,
        "label": labelSlot,
      },
      onClose: vi.fn(),
    }

    const ElSpaceStub = defineComponent({
      name: "ElSpaceStub",
      setup(_, { slots, attrs }) {
        return () => h("div", { ...attrs, class: ["el-space-stub", attrs.class] }, slots.default?.())
      },
    })
    const ElDescriptionsStub = defineComponent({
      name: "ElDescriptionsStub",
      setup(_, { slots, attrs }) {
        return () => h("section", { ...attrs, class: ["el-descriptions-stub", attrs.class] }, slots.default?.())
      },
    })
    const ElDescriptionsItemStub = defineComponent({
      name: "ElDescriptionsItemStub",
      props: { label: String },
      setup(props, { slots, attrs }) {
        return () =>
          h("div", { ...attrs, class: ["el-descriptions-item-stub", attrs.class] }, [
            h("strong", { class: "label" }, slots.label?.() ?? props.label ?? ""),
            h("div", { class: "value" }, slots.default?.()),
          ])
      },
    })
    const ElTagStub = defineComponent({
      name: "ElTagStub",
      setup(_, { slots, attrs }) {
        return () => h("span", { ...attrs, class: ["el-tag-stub", attrs.class] }, slots.default?.())
      },
    })

    const Wrapper = defineComponent({
      setup: () => () => renderDetailContent(ctx),
    })

    const _wrapper = mount(Wrapper, {
      global: {
        directives: {
          loading: () => ({}),
        },
        stubs: {
          "el-space": ElSpaceStub,
          "el-descriptions": ElDescriptionsStub,
          "el-descriptions-item": ElDescriptionsItemStub,
          "el-tag": ElTagStub,
        },
      },
    })

    expect(groupSlot).toHaveBeenCalledWith({ data, group: ctx.groups[0] })
    expect(labelSlot).toHaveBeenCalledWith({
      index: 0,
      data,
      value: data.status,
      item: ctx.groups[0].items[0],
    })

    const componentCall = renderComponentSlotSpy.mock.results.find(result => (result.value as any)?.type === "section")
    expect(componentCall?.value?.type).toBe("section")
    const slotEntryCall = renderComponentSlotSpy.mock.results.find(result => (result.value as any)?.props?.class === "slot-entry")
    expect(slotEntryCall).toBeDefined()

    renderDetailContent(ctx)
  })
})
