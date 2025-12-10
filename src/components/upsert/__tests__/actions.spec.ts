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
    options.actions = [{ type: "ok", text: model => model.label as string }, { type: "cancel", hidden: () => true } as UpsertAction]
    const helper = useUpsertActions({
      options,
      crud: { dict: { label: { close: "取消", confirm: "确定" } } } as any,
      formModel: computed(() => ({ label: "动态" })),
      mode: ref("add"),
    })
    expect(helper.resolveActionText(options.actions[0])).toBe("动态")
    expect(helper.isActionVisible(options.actions[1])).toBe(false)
  })

  describe("resolveActionText 默认文案", () => {
    it("cancel 类型无 text 时使用 crud.dict 的 close 文案", () => {
      const options = createOptions()
      options.actions = [{ type: "cancel" }]
      const helper = useUpsertActions({
        options,
        crud: { dict: { label: { close: "关闭窗口", confirm: "提交" } } } as any,
        formModel: computed(() => ({})),
        mode: ref("add"),
      })
      expect(helper.resolveActionText(options.actions[0])).toBe("关闭窗口")
    })

    it("cancel 类型无 text 且无 dict 时使用默认文案", () => {
      const options = createOptions()
      options.actions = [{ type: "cancel" }]
      const helper = useUpsertActions({
        options,
        crud: { dict: {} } as any,
        formModel: computed(() => ({})),
        mode: ref("add"),
      })
      expect(helper.resolveActionText(options.actions[0])).toBe("取消")
    })

    it("ok 类型无 text 时使用 crud.dict 的 confirm 文案", () => {
      const options = createOptions()
      options.actions = [{ type: "ok" }]
      const helper = useUpsertActions({
        options,
        crud: { dict: { label: { close: "关闭", confirm: "保存修改" } } } as any,
        formModel: computed(() => ({})),
        mode: ref("add"),
      })
      expect(helper.resolveActionText(options.actions[0])).toBe("保存修改")
    })

    it("ok 类型无 text 且无 dict 时使用默认文案", () => {
      const options = createOptions()
      options.actions = [{ type: "ok" }]
      const helper = useUpsertActions({
        options,
        crud: { dict: {} } as any,
        formModel: computed(() => ({})),
        mode: ref("add"),
      })
      expect(helper.resolveActionText(options.actions[0])).toBe("确定")
    })

    it("有静态 text 时直接使用", () => {
      const options = createOptions()
      options.actions = [{ type: "ok", text: "立即保存" }]
      const helper = useUpsertActions({
        options,
        crud: { dict: { label: { confirm: "确定" } } } as any,
        formModel: computed(() => ({})),
        mode: ref("add"),
      })
      expect(helper.resolveActionText(options.actions[0])).toBe("立即保存")
    })
  })

  describe("isActionVisible 边界测试", () => {
    it("hidden 为 true 时返回 false", () => {
      const options = createOptions()
      options.actions = [{ type: "ok", hidden: true }]
      const helper = useUpsertActions({
        options,
        crud: {} as any,
        formModel: computed(() => ({})),
        mode: ref("add"),
      })
      expect(helper.isActionVisible(options.actions[0])).toBe(false)
    })

    it("hidden 为 false 时返回 true", () => {
      const options = createOptions()
      options.actions = [{ type: "ok", hidden: false }]
      const helper = useUpsertActions({
        options,
        crud: {} as any,
        formModel: computed(() => ({})),
        mode: ref("add"),
      })
      expect(helper.isActionVisible(options.actions[0])).toBe(true)
    })

    it("hidden 未定义时返回 true", () => {
      const options = createOptions()
      options.actions = [{ type: "ok" }]
      const helper = useUpsertActions({
        options,
        crud: {} as any,
        formModel: computed(() => ({})),
        mode: ref("add"),
      })
      expect(helper.isActionVisible(options.actions[0])).toBe(true)
    })

    it("hidden 为函数返回 false 时显示", () => {
      const options = createOptions()
      options.actions = [{ type: "ok", hidden: () => false }]
      const helper = useUpsertActions({
        options,
        crud: {} as any,
        formModel: computed(() => ({})),
        mode: ref("add"),
      })
      expect(helper.isActionVisible(options.actions[0])).toBe(true)
    })
  })
})
