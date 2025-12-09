import type { FormRef, FormRecord } from "../../form/types"
import { createUpsertState } from "../core/state"
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

  describe("useUpsert", () => {
    it("函数型 model 接收当前 model 并返回新值", () => {
      const state = createUpsertState({ style: {} })
      state.useUpsert({ model: { name: "初始" } })

      state.useUpsert({
        model: (current: FormRecord) => ({ ...current, extra: "追加" }),
      })

      expect(state.options.model).toEqual({ name: "初始", extra: "追加" })
    })

    it("函数型 model 返回 undefined 时使用空对象", () => {
      const state = createUpsertState({ style: {} })
      state.useUpsert({ model: { name: "有值" } })

      state.useUpsert({ model: () => undefined as any })

      expect(state.options.model).toEqual({})
    })

    it("对象型 model 完全替换现有值", () => {
      const state = createUpsertState({ style: {} })
      state.useUpsert({ model: { name: "旧值", old: true } })

      state.useUpsert({ model: { name: "新值" } })

      expect(state.options.model).toEqual({ name: "新值" })
      expect(state.options.model).not.toHaveProperty("old")
    })

    it("合并 dialog 配置", () => {
      const state = createUpsertState({ style: {} })
      expect(state.options.dialog.width).toBe("60%")

      state.useUpsert({ dialog: { width: "80%", title: "自定义标题" } })

      expect(state.options.dialog.width).toBe("80%")
      expect(state.options.dialog.title).toBe("自定义标题")
    })

    it("过滤 items 中的空值", () => {
      const state = createUpsertState({ style: {} })

      state.useUpsert({
        items: [
          { label: "名称", prop: "name" },
          null as any,
          undefined as any,
          { label: "年龄", prop: "age" },
        ],
      })

      expect(state.options.items).toHaveLength(2)
      expect(state.options.items[0].prop).toBe("name")
      expect(state.options.items[1].prop).toBe("age")
    })

    it("过滤 actions 中的空值", () => {
      const state = createUpsertState({ style: {} })

      state.useUpsert({
        actions: [
          { type: "cancel" },
          null as any,
          { type: "ok" },
        ],
      })

      expect(state.options.actions).toHaveLength(2)
    })
  })

  describe("formModel", () => {
    it("formRef 有值时返回 formRef.model", () => {
      const state = createUpsertState({ style: {} })
      state.useUpsert({ model: { name: "options 中的值" } })

      state.formRef.value = {
        model: { name: "formRef 中的值" },
      } as unknown as FormRef<FormRecord>

      expect(state.formModel.value).toEqual({ name: "formRef 中的值" })
    })

    it("formRef 无值时返回 options.model", () => {
      const state = createUpsertState({ style: {} })
      state.useUpsert({ model: { name: "options 中的值" } })
      state.formRef.value = undefined

      expect(state.formModel.value).toEqual({ name: "options 中的值" })
    })

    it("formRef.model 为 undefined 时返回 options.model", () => {
      const state = createUpsertState({ style: {} })
      state.useUpsert({ model: { name: "options 中的值" } })
      state.formRef.value = { model: undefined } as any

      expect(state.formModel.value).toEqual({ name: "options 中的值" })
    })
  })

  describe("默认值", () => {
    it("创建时包含默认配置", () => {
      const state = createUpsertState({ style: {} })

      expect(state.options.key).toBe(0)
      expect(state.options.mode).toBe("add")
      expect(state.options.dialog.width).toBe("60%")
      expect(state.options.dialog.showClose).toBe(true)
      expect(state.options.dialog.destroyOnClose).toBe(false)
      expect(state.options.grid?.cols).toBe(1)
    })

    it("从 style 继承 labelWidth 和 labelPosition", () => {
      const state = createUpsertState({
        style: {
          form: {
            labelWidth: "120px",
            labelPosition: "top",
          },
        },
      })

      expect(state.options.form?.labelWidth).toBe("120px")
      expect(state.options.form?.labelPosition).toBe("top")
    })

    it("初始状态值正确", () => {
      const state = createUpsertState({ style: {} })

      expect(state.visible.value).toBe(false)
      expect(state.loading.value).toBe(false)
      expect(state.mode.value).toBe("add")
      expect(state.closeAction.value).toBe("cancel")
      expect(state.formRef.value).toBeUndefined()
    })
  })
})
