import type { GridCollector, GridContextState } from "../interface"
import GridItem from "../../grid-item/grid-item"
import { mount } from "@vue/test-utils"
import { h, ref, computed, nextTick } from "vue"
import { it, vi, expect, describe, afterEach } from "vitest"
import { GRID_CONTEXT_KEY, GRID_COLLECTOR_KEY } from "../interface"

afterEach(() => {
  vi.clearAllMocks()
})

describe("fd-grid-item", () => {
  it("无上下文时保持可见并透传属性", () => {
    const slotSpy = vi.fn()
    const wrapper = mount(GridItem, {
      attrs: { "id": "plain", "data-id": "x" },
      slots: {
        default: ({ overflow }) => {
          slotSpy(overflow)
          return h("span", "cell")
        },
      },
    })

    expect(wrapper.classes()).toContain("fd-grid-item")
    expect(wrapper.attributes("data-id")).toBe("x")
    expect(wrapper.attributes("style")).toContain("grid-column: span 1;")
    expect(slotSpy).toHaveBeenCalledWith(false)
  })

  it("感知 Grid 上下文、收集/移除数据并计算偏移样式", async () => {
    const cols = ref(4)
    const colGap = ref(8)
    const viewportWidth = ref(800)
    const displayIndexList = ref([0])
    const overflow = ref(true)
    const collected: Record<number, any> = {}
    const removeSpy = vi.fn()
    const collector: GridCollector = {
      registerItem: () => 0,
      collectItemData: (index, data) => {
        collected[index] = data
      },
      removeItemData: removeSpy,
    }
    const context: GridContextState = {
      cols: computed(() => cols.value),
      colGap: computed(() => colGap.value),
      displayIndexList: computed(() => displayIndexList.value),
      overflow: computed(() => overflow.value),
      viewportWidth,
    }

    const wrapper = mount(GridItem, {
      global: {
        provide: {
          [GRID_CONTEXT_KEY as symbol]: context,
          [GRID_COLLECTOR_KEY as symbol]: collector,
        },
      },
      props: { span: { md: 2, xs: 1 }, offset: { xs: 1 }, suffix: true },
      attrs: { "style": { color: "red" }, "class": "extra", "data-foo": "bar" },
      slots: {
        default: ({ overflow }) => h("div", { class: "slot-content" }, overflow ? "overflow" : "normal"),
      },
    })

    await nextTick()
    expect(collected[0]).toEqual({ span: 2, offset: 1, suffix: true })

    // 初始可见时展示偏移与样式
    const el = wrapper.element as HTMLElement
    const vnodeStyle = (wrapper.vm.$.subTree as any).props?.style
    const styleArray = Array.isArray(vnodeStyle) ? vnodeStyle : [vnodeStyle]
    const baseStyle = styleArray[0] as Record<string, any>

    expect(el.getAttribute("style") ?? "").toContain("grid-column: span 2")
    expect(baseStyle.marginLeft).toBe("calc(((100% - 8px) / 2 * 1) + 8px)")
    expect(el.style.color).toBe("red")
    expect(wrapper.find(".slot-content").text()).toBe("overflow")

    // 不在展示索引时隐藏
    displayIndexList.value = []
    await nextTick()
    expect(wrapper.attributes("style")).toContain("display: none")

    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith(0)
  })
})
