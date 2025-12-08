import type { UpsertAction, UpsertOptions } from "../interface"
import { useUpsertActions } from "../core/actions"
import { it, expect, describe } from "vitest"
import { ref, computed, reactive } from "vue"

function createOptions() {
  return reactive<UpsertOptions>({
    key: 0,
    mode: "add",
    form: {},
    model: {},
    items: [],
    group: {},
    grid: { cols: 1 },
    actions: [],
    dialog: { width: "60%" },
  })
}

describe("useUpsertActions", () => {
  it("提供默认动作（非 steps 模式）", () => {
    const options = createOptions()
    const helper = useUpsertActions({
      options,
      crud: { dict: { label: { close: "取消", confirm: "确定" } } } as any,
      formModel: computed(() => ({})),
      mode: ref("add"),
    })
    helper.ensureActions()
    const types = options.actions.map(action => action.type)
    expect(types).toEqual(["cancel", "ok"])
  })

  it("提供默认动作（steps 模式）", () => {
    const options = createOptions()
    options.group = { type: "steps" }
    const helper = useUpsertActions({
      options,
      crud: { dict: { label: { close: "取消", confirm: "确定" } } } as any,
      formModel: computed(() => ({})),
      mode: ref("add"),
    })
    helper.ensureActions()
    const types = options.actions.map(action => action.type)
    expect(types).toEqual(["cancel", "prev", "next", "ok"])
  })

  it("解析函数型文本与隐藏", () => {
    const options = createOptions()
    options.actions = [
      { type: "ok", text: model => model.label as string },
      { type: "cancel", hidden: () => true } as UpsertAction,
    ]
    const helper = useUpsertActions({
      options,
      crud: { dict: { label: { close: "取消", confirm: "确定" } } } as any,
      formModel: computed(() => ({ label: "动态" })),
      mode: ref("add"),
    })
    expect(helper.resolveActionText(options.actions[0])).toBe("动态")
    expect(helper.isActionVisible(options.actions[1])).toBe(false)
  })
})
