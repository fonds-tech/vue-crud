import { createUpsertState } from "../state"
import { it, expect, describe } from "vitest"

describe("createUpsertState", () => {
  it("空数组覆盖 actions/items 不会回填默认", () => {
    const state = createUpsertState({ style: {} })
    state.useUpsert({ actions: [], items: [] })
    expect(state.options.actions).toHaveLength(0)
    expect(state.options.items).toHaveLength(0)
  })

  it("labelPosition 只接受合法值", () => {
    const state = createUpsertState({ style: { form: { labelPosition: "left" } } })
    expect(state.options.form?.labelPosition).toBe("left")
    state.useUpsert({ form: { labelPosition: "invalid" as any } })
    expect(state.options.form?.labelPosition).toBeUndefined()
  })
})
