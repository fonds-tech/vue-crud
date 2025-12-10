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
      const options = [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ]
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

  describe("reloadOptions", () => {
    it("重新加载选项数据", async () => {
      const item = ctx.options.items.find(i => i.prop === "tags")!
      item.component!.options = Promise.resolve([{ label: "X", value: "x" }])

      const result = await actions.reloadOptions("tags")
      expect(result).toEqual([{ label: "X", value: "x" }])
    })

    it("promise 拒绝时返回 undefined 并记录错误", async () => {
      const item = ctx.options.items.find(i => i.prop === "tags")!
      item.component!.options = Promise.reject(new Error("加载失败"))

      const result = await actions.reloadOptions("tags")
      expect(result).toBeUndefined()
      expect(actions.getOptionsState("tags")?.error).toBeDefined()
    })

    it("无 options 配置时返回当前状态值", async () => {
      const result = await actions.reloadOptions("tags")
      expect(result).toBeUndefined()
    })
  })

  describe("setRequired 边缘情况", () => {
    it("对不存在的字段不抛出错误", () => {
      expect(() => actions.setRequired("nonExistent", true)).not.toThrow()
    })

    it("对有现存规则的字段正确合并规则", () => {
      const item = ctx.options.items.find(i => i.prop === "name")!
      item.rules = [{ pattern: /\w+/, message: "格式错误" }]

      actions.setRequired("name", true)

      const rules = item.rules as Array<{ required?: boolean, _inner?: boolean, pattern?: RegExp }>
      expect(rules.length).toBe(2)
      expect(rules[0]._inner).toBe(true)
      expect(rules[1].pattern).toBeDefined()
    })

    it("更新已存在的 _inner 规则而非添加新规则", () => {
      actions.setRequired("name", true)
      actions.setRequired("name", true) // 再次设置

      const item = ctx.options.items.find(i => i.prop === "name")!
      const rules = item.rules as Array<{ _inner?: boolean }>
      const innerRules = rules.filter(r => r._inner)
      expect(innerRules.length).toBe(1)
    })
  })

  describe("collapse 边缘情况", () => {
    it("options.grid 为 undefined 时自动初始化", () => {
      delete (ctx.options as any).grid
      actions.collapse(true)
      expect(ctx.options.grid?.collapsed).toBe(true)
    })
  })

  describe("setItem 边缘情况", () => {
    it("对不存在的字段不抛出错误", () => {
      expect(() => actions.setItem("nonExistent", { label: "测试" })).not.toThrow()
    })
  })

  describe("setData 嵌套路径", () => {
    it("设置深层嵌套配置", () => {
      actions.setData("grid.cols", 3)
      expect((ctx.options.grid as any)?.cols).toBe(3)
    })
  })

  // 新增覆盖测试：bindFields 中传入数据覆盖默认值
  describe("bindFields 默认值与传入数据处理", () => {
    it("传入数据覆盖表单项的默认值", () => {
      // 设置表单项有默认值
      ctx.options.items = [
        { ...baseItemDefaults, prop: "name", label: "名称", value: "默认名称", component: { is: "el-input" } },
        { ...baseItemDefaults, prop: "status", label: "状态", value: "active", component: { is: "el-select" } },
      ]
      actions = useAction(ctx)

      // bindFields 传入 name 字段，但不传入 status
      actions.bindFields({ name: "覆盖的名称" })

      // name 应该使用传入的值
      expect(ctx.model.name).toBe("覆盖的名称")
      // status 应该使用默认值
      expect((ctx.model as any).status).toBe("active")
    })

    it("传入 undefined 不会使用默认值", () => {
      ctx.options.items = [{ ...baseItemDefaults, prop: "name", label: "名称", value: "默认名称", component: { is: "el-input" } }]
      actions = useAction(ctx)

      // 传入空对象，触发默认值逻辑
      actions.bindFields({})

      // 应该使用默认值
      expect(ctx.model.name).toBe("默认名称")
    })

    it("默认值为 undefined 时不设置到 model", () => {
      ctx.options.items = [
        { ...baseItemDefaults, prop: "name", label: "名称", component: { is: "el-input" } }, // 无默认值
      ]
      actions = useAction(ctx)

      actions.bindFields({})

      // name 不应存在于 model 中（未设置默认值）
      expect(ctx.model.name).toBeUndefined()
    })

    it("带 hook 的字段触发 bind 阶段钩子", () => {
      ctx.options.items = [{ ...baseItemDefaults, prop: "tags", label: "标签", hook: "split", component: { is: "el-select" } }]
      actions = useAction(ctx)

      actions.bindFields({ tags: "a,b,c" })

      // split hook 应该将字符串分割为数组
      expect(ctx.model.tags).toEqual(["a", "b", "c"])
    })
  })

  // 新增覆盖测试：getOptions 从配置中解析函数形式的 options
  describe("getOptions 边缘情况", () => {
    it("从函数形式的 options 配置获取数据", () => {
      const optionsFn = vi.fn(() => [{ label: "A", value: "a" }])
      ctx.options.items = [{ ...baseItemDefaults, prop: "type", label: "类型", component: { is: "el-select", options: optionsFn } }]
      actions = useAction(ctx)

      const result = actions.getOptions("type")
      expect(optionsFn).toHaveBeenCalled()
      expect(result).toEqual([{ label: "A", value: "a" }])
    })

    it("无 component.options 时返回状态中的值", () => {
      ctx.options.items = [{ ...baseItemDefaults, prop: "type", label: "类型", component: { is: "el-select" } }]
      ctx.optionState.type = { value: [{ label: "B", value: "b" }], loading: false }
      actions = useAction(ctx)

      const result = actions.getOptions("type")
      expect(result).toEqual([{ label: "B", value: "b" }])
    })
  })
})
