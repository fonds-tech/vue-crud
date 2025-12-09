import { createDetailState } from "../core/state"
import { it, expect, describe } from "vitest"

describe("createDetailState", () => {
  const mockCrud = {
    dict: { label: { detail: "详情", confirm: "确认" } },
  }

  it("初始化默认状态", () => {
    const state = createDetailState(mockCrud)
    expect(state.options.dialog.title).toBe("详情")
    expect(state.visible.value).toBe(false)
    expect(state.loading.value).toBe(false)
    // 默认应该生成 actions
    expect(state.options.actions).toHaveLength(1)
    expect(state.options.actions[0].text).toBe("确认")
  })

  it("ensureActions 保证默认按钮存在", () => {
    const state = createDetailState(mockCrud)
    state.options.actions = []
    state.ensureActions()
    expect(state.options.actions).toHaveLength(1)
    expect(state.options.actions[0].type).toBe("ok")
  })

  it("use 方法合并配置 (actions 数组替换)", () => {
    const state = createDetailState(mockCrud)
    state.use({
      actions: [{ type: "custom", text: "Custom" } as any],
      dialog: { title: "New Title" },
    })

    expect(state.options.actions).toHaveLength(1)
    expect(state.options.actions[0].text).toBe("Custom")
    // 默认的 ok 按钮应该被替换，而不是合并
    expect(state.options.actions[0].type).toBe("custom")

    expect(state.options.dialog.title).toBe("New Title")
    // 原有配置保留
    expect(state.options.dialog.width).toBe("60%")
  })

  it("setData 设置数据", () => {
    const state = createDetailState(mockCrud)
    const data = { id: 1, name: "Test" }
    state.setData(data)
    expect(state.data.value).toEqual(data)
  })

  it("getData 返回数据副本", () => {
    const state = createDetailState(mockCrud)
    const data = { id: 1, nested: { val: 2 } }
    state.setData(data)

    const copy = state.getData()
    expect(copy).toEqual(data)
    expect(copy).not.toBe(state.data.value) // 引用不同
    expect(copy.nested).not.toBe(state.data.value.nested) // 深拷贝检查
  })

  it("clearData重置状态", () => {
    const state = createDetailState(mockCrud)
    state.setData({ id: 1 })
    state.paramsCache.value = { page: 1 }

    state.clearData()
    expect(state.data.value).toEqual({})
    expect(state.paramsCache.value).toEqual({})
  })
})
