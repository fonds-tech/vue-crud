import FdGrid from "../index.vue"
import FdGridItem from "../../fd-grid-item/index.vue"
import { mount } from "@vue/test-utils"
import { it, expect, describe } from "vitest"

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("fdGrid Layout Fixes", () => {
  it("generates correct margin-left style for offset", () => {
    const wrapper = mount(FdGrid, {
      props: { cols: 24, colGap: 0 },
      slots: {
        default: `
          <fd-grid-item :span="6" :offset="6" id="target-item">
            Content
          </fd-grid-item>
        `,
      },
      global: {
        components: { FdGridItem },
      },
    })

    const item = wrapper.findComponent(FdGridItem)
    const vm = item.vm as any
    const style = vm.itemStyle

    expect(style).toMatchObject({
      gridColumn: "span 6 / span 6",
      marginLeft: "calc(((100% + 0px) / 24) * 6)",
    })
  })

  it("handles colGap in offset calculation", () => {
    const wrapper = mount(FdGrid, {
      props: { cols: 24, colGap: 20 },
      slots: {
        default: `
          <fd-grid-item :span="6" :offset="6">
            Content
          </fd-grid-item>
        `,
      },
      global: {
        components: { FdGridItem },
      },
    })

    const item = wrapper.findComponent(FdGridItem)
    const vm = item.vm as any
    const style = vm.itemStyle

    expect(style).toMatchObject({
      marginLeft: "calc(((100% + 20px) / 24) * 6)",
    })
  })
})
