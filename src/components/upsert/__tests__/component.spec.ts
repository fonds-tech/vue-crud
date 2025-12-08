import { ref, computed } from "vue"
import { useComponentHelper } from "../engine/helpers"
import { it, expect, describe } from "vitest"

describe("useComponentHelper", () => {
  it("注入 slot props", () => {
    const helper = useComponentHelper({
      mode: ref("add"),
      formModel: computed(() => ({ name: "Alice" })),
      loading: ref(true),
    })
    const slotProps = helper.createSlotProps({ value: 1 })
    expect(slotProps).toMatchObject({ value: 1, mode: "add", model: { name: "Alice" }, loading: true })
  })

  it("解析 component 与插槽名称", () => {
    const helper = useComponentHelper({
      mode: ref("add"),
      formModel: computed(() => ({ name: "Alice" })),
      loading: ref(false),
    })
    const cfg = {
      is: () => "el-button",
      slot: "custom",
      props: (model: any) => ({ label: model.name }),
      slots: { default: () => "ok" },
    }
    expect(helper.slotNameOf(cfg as any)).toBe("custom")
    expect(helper.componentOf(cfg as any)).toBe("el-button")
    expect(helper.componentProps(cfg as any)).toEqual({ label: "Alice" })
  })
})
