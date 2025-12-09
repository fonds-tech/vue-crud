import type { FormRecord, FormOptions, FormActionContext, FormAsyncOptionsState } from "../types"
import { useAction } from "../core/actions"
import { ref, reactive } from "vue"
import { it, vi, expect, describe, beforeEach } from "vitest"

const baseItemDefaults = { labelPosition: "", labelWidth: "", showMessage: true } as const

function createActionContext<T extends FormRecord = FormRecord>(): FormActionContext<T> {
  const options = reactive<FormOptions<T>>({
    key: 0,
    mode: "add",
    model: {} as T,
    items: [],
    group: {},
    form: {},
    grid: {},
  })
  const model = reactive<T>({} as T)
  const form = ref<any>({
    resetFields: vi.fn(),
    clearValidate: vi.fn(),
  })
  const optionState = reactive<Record<string, FormAsyncOptionsState>>({})
  return { options: options as FormOptions<T>, model: model as T, form, optionState }
}

describe("fd-form actions", () => {
  let ctx: FormActionContext<{ name: string, price: number, tags: string }>
  let actions: ReturnType<typeof useAction>

  beforeEach(() => {
    ctx = createActionContext()
    ctx.options.items = [
      { ...baseItemDefaults, prop: "name", label: "名称", component: { is: "el-input" } },
      { ...baseItemDefaults, prop: "price", label: "价格", component: { is: "el-input-number" } },
      { ...baseItemDefaults, prop: "tags", label: "标签", component: { is: "el-select" } },
    ]
    actions = useAction(ctx)
  })

  describe("setMode", () => {
    it("切换表单模式", () => {
      expect(ctx.options.mode).toBe("add")
      actions.setMode("update")
      expect(ctx.options.mode).toBe("update")
    })
  })

  describe("getField/setField", () => {
    it("获取和设置字段值", () => {
      actions.setField("name", "测试")
      expect(actions.getField("name")).toBe("测试")
    })

    it("获取整个 model", () => {
      actions.setField("name", "Tom")
      actions.setField("price", 100)
      const model = actions.getField()
      expect(model).toEqual({ name: "Tom", price: 100 })
    })
  })

  describe("setItem", () => {
    it("更新表单项配置", () => {
      actions.setItem("name", { label: "新标签", span: 2 })
      const item = ctx.options.items.find(i => i.prop === "name")
      expect(item?.label).toBe("新标签")
      expect(item?.span).toBe(2)
    })
  })

  describe("setOptions/getOptions", () => {
    it("设置和获取选项数据", () => {
      const options = [{ label: "A", value: "a" }, { label: "B", value: "b" }]
      actions.setOptions("tags", options)
      expect(actions.getOptions("tags")).toEqual(options)
    })
  })

  describe("getOptionsState", () => {
    it("获取选项加载状态", () => {
      actions.setOptions("tags", [])
      const state = actions.getOptionsState("tags")
      expect(state?.loading).toBe(false)
    })
  })

  describe("setProps", () => {
    it("动态设置组件 props", () => {
      actions.setProps("name", { placeholder: "请输入名称", disabled: true })
      const item = ctx.options.items.find(i => i.prop === "name")
      expect(item?.component?.props).toEqual({ placeholder: "请输入名称", disabled: true })
    })

    it("合并现有 props", () => {
      actions.setProps("name", { placeholder: "输入" })
      actions.setProps("name", { disabled: true })
      const item = ctx.options.items.find(i => i.prop === "name")
      expect(item?.component?.props).toEqual({ placeholder: "输入", disabled: true })
    })
  })

  describe("setStyle", () => {
    it("动态设置组件样式", () => {
      actions.setStyle("name", { width: "200px", color: "red" })
      const item = ctx.options.items.find(i => i.prop === "name")
      expect(item?.component?.style).toEqual({ width: "200px", color: "red" })
    })
  })

  describe("hideItem/showItem", () => {
    it("隐藏和显示单个字段", () => {
      actions.hideItem("name")
      expect(ctx.options.items.find(i => i.prop === "name")?.hidden).toBe(true)
      actions.showItem("name")
      expect(ctx.options.items.find(i => i.prop === "name")?.hidden).toBe(false)
    })

    it("批量隐藏和显示多个字段", () => {
      actions.hideItem(["name", "price"])
      expect(ctx.options.items.find(i => i.prop === "name")?.hidden).toBe(true)
      expect(ctx.options.items.find(i => i.prop === "price")?.hidden).toBe(true)
      actions.showItem(["name", "price"])
      expect(ctx.options.items.find(i => i.prop === "name")?.hidden).toBe(false)
      expect(ctx.options.items.find(i => i.prop === "price")?.hidden).toBe(false)
    })
  })

  describe("collapse", () => {
    it("切换折叠状态", () => {
      expect(ctx.options.grid?.collapsed).toBeFalsy()
      actions.collapse()
      expect(ctx.options.grid?.collapsed).toBe(true)
      actions.collapse()
      expect(ctx.options.grid?.collapsed).toBe(false)
    })

    it("指定折叠状态", () => {
      actions.collapse(true)
      expect(ctx.options.grid?.collapsed).toBe(true)
      actions.collapse(false)
      expect(ctx.options.grid?.collapsed).toBe(false)
    })
  })

  describe("setRequired", () => {
    it("动态设置必填状态", () => {
      actions.setRequired("name", true)
      const item = ctx.options.items.find(i => i.prop === "name")
      expect(item?.required).toBe(true)
      const rules = item?.rules as Array<{ required?: boolean, _inner?: boolean }>
      expect(rules?.[0]?.required).toBe(true)
      expect(rules?.[0]?._inner).toBe(true)
    })

    it("取消必填状态会移除内部规则", () => {
      actions.setRequired("name", true)
      actions.setRequired("name", false)
      const item = ctx.options.items.find(i => i.prop === "name")
      expect(item?.required).toBe(false)
      const rules = item?.rules as Array<{ _inner?: boolean }>
      expect(rules?.some(r => r._inner)).toBe(false)
    })
  })

  describe("setData", () => {
    it("通过路径设置配置数据", () => {
      actions.setData("form.labelWidth", "120px")
      expect(ctx.options.form?.labelWidth).toBe("120px")
    })
  })

  describe("bindFields", () => {
    it("批量绑定数据并清空旧数据", () => {
      ctx.model.name = "旧值"
      actions.bindFields({ name: "新值", price: 50 })
      expect(ctx.model.name).toBe("新值")
      expect(ctx.model.price).toBe(50)
    })
  })
})
