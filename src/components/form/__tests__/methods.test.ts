import type { FormRecord, FormOptions, FormAsyncOptionsState } from "../types"
import { ref, reactive } from "vue"
import { useFormApi, useMethods } from "../core/methods"
import { it, vi, expect, describe, beforeEach } from "vitest"

const baseItemDefaults = { labelPosition: "", labelWidth: "", showMessage: true } as const

/**
 * 创建 methods 测试上下文
 */
function createMethodsContext<T extends FormRecord = FormRecord>() {
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
    validate: vi.fn((callback) => {
      callback?.(true, undefined)
      return Promise.resolve(true)
    }),
    validateField: vi.fn((_, callback) => {
      callback?.(true)
      return Promise.resolve(true)
    }),
    resetFields: vi.fn(),
    clearValidate: vi.fn(),
    setFields: vi.fn(),
    scrollToField: vi.fn(),
  })
  const optionState = reactive<Record<string, FormAsyncOptionsState>>({})
  return { options: options as FormOptions<T>, model: model as T, form, optionState }
}

describe("fd-form methods", () => {
  let ctx: ReturnType<typeof createMethodsContext<{ name: string, price: number, tags: string }>>
  let methods: ReturnType<typeof useMethods>

  beforeEach(() => {
    ctx = createMethodsContext()
    ctx.options.items = [
      { ...baseItemDefaults, prop: "name", label: "名称", component: { is: "el-input" } },
      { ...baseItemDefaults, prop: "price", label: "价格", component: { is: "el-input-number" } },
      { ...baseItemDefaults, prop: "tags", label: "标签", component: { is: "el-select" } },
    ]
    methods = useMethods(ctx as any)
  })

  describe("validate", () => {
    it("表单不存在时返回 true", async () => {
      ctx.form.value = undefined
      const callback = vi.fn()
      const result = await methods.validate(callback)
      expect(result).toBe(true)
      expect(callback).toHaveBeenCalledWith(true)
    })

    it("表单存在时调用原生 validate", async () => {
      const callback = vi.fn()
      await methods.validate(callback)
      expect(ctx.form.value.validate).toHaveBeenCalled()
      expect(callback).toHaveBeenCalledWith(true, undefined)
    })
  })

  describe("validateField", () => {
    it("表单不存在时返回 true", async () => {
      ctx.form.value = undefined
      const callback = vi.fn()
      const result = await methods.validateField("name", callback)
      expect(result).toBe(true)
      expect(callback).toHaveBeenCalledWith(true)
    })

    it("表单存在时调用原生 validateField", async () => {
      const callback = vi.fn()
      await methods.validateField("name", callback)
      expect(ctx.form.value.validateField).toHaveBeenCalledWith("name", callback)
    })
  })

  describe("resetFields", () => {
    it("调用原生 resetFields", () => {
      methods.resetFields("name")
      expect(ctx.form.value.resetFields).toHaveBeenCalledWith("name")
    })

    it("表单不存在时不报错", () => {
      ctx.form.value = undefined
      expect(() => methods.resetFields()).not.toThrow()
    })
  })

  describe("clearFields", () => {
    it("清空指定字段", () => {
      ctx.model.name = "测试" as any
      ctx.model.price = 100 as any
      methods.clearFields("name")
      expect(ctx.model.name).toBeUndefined()
      expect(ctx.model.price).toBe(100)
      expect(ctx.form.value.clearValidate).toHaveBeenCalledWith("name")
    })

    it("清空全部字段", () => {
      ctx.model.name = "测试" as any
      ctx.model.price = 100 as any
      methods.clearFields()
      expect(ctx.model.name).toBeUndefined()
      expect(ctx.model.price).toBeUndefined()
    })

    it("支持数组形式批量清空", () => {
      ctx.model.name = "测试" as any
      ctx.model.price = 100 as any
      ctx.model.tags = "a,b" as any
      methods.clearFields(["name", "price"])
      expect(ctx.model.name).toBeUndefined()
      expect(ctx.model.price).toBeUndefined()
      expect(ctx.model.tags).toBe("a,b")
    })
  })

  describe("clearValidate", () => {
    it("调用原生 clearValidate", () => {
      methods.clearValidate("name")
      expect(ctx.form.value.clearValidate).toHaveBeenCalledWith("name")
    })

    it("表单不存在时不报错", () => {
      ctx.form.value = undefined
      expect(() => methods.clearValidate()).not.toThrow()
    })
  })

  describe("setFields", () => {
    it("批量设置字段值", () => {
      methods.setFields({ name: "Tom", price: 50 })
      expect(ctx.model.name).toBe("Tom")
      expect(ctx.model.price).toBe(50)
    })

    it("覆盖已有值", () => {
      ctx.model.name = "旧值" as any
      methods.setFields({ name: "新值" })
      expect(ctx.model.name).toBe("新值")
    })
  })

  describe("scrollToField", () => {
    it("调用原生 scrollToField", () => {
      methods.scrollToField("name")
      expect(ctx.form.value.scrollToField).toHaveBeenCalledWith("name")
    })

    it("表单不存在时不报错", () => {
      ctx.form.value = undefined
      expect(() => methods.scrollToField("name")).not.toThrow()
    })
  })

  describe("submit", () => {
    it("校验通过时返回 values 且无 errors", async () => {
      ctx.model.name = "Tom" as any
      const result = await methods.submit()
      expect(result.values.name).toBe("Tom")
      expect(result.errors).toBeUndefined()
    })

    it("执行 callback", async () => {
      ctx.model.name = "Tom" as any
      const callback = vi.fn()
      await methods.submit(callback)
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Tom" }),
        undefined,
      )
    })

    it("校验通过时调用 onSubmit", async () => {
      const onSubmit = vi.fn()
      ctx.options.onSubmit = onSubmit
      ctx.model.name = "Tom" as any
      await methods.submit()
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Tom" }),
        undefined,
      )
    })

    it("提交时执行 hook 处理", async () => {
      ctx.options.items = [
        { ...baseItemDefaults, prop: "tags", label: "标签", hook: "join", component: { is: "el-select" } },
      ]
      ctx.model.tags = ["a", "b"] as any
      const result = await methods.submit()
      expect(result.values.tags).toBe("a,b")
    })

    it("校验失败时返回错误", async () => {
      const errors = { name: [{ message: "不能为空", required: true }] }
      ctx.form.value.validate = vi.fn((callback: any) => {
        callback?.(false, errors)
        return Promise.resolve(false)
      })
      const result = await methods.submit()
      // 由于值为空，required 错误会被保留
      expect(result.errors).toBeDefined()
    })

    it("校验失败时不调用 onSubmit", async () => {
      const onSubmit = vi.fn()
      ctx.options.onSubmit = onSubmit
      const errors = { name: [{ message: "不能为空", required: true }] }
      ctx.form.value.validate = vi.fn((callback: any) => {
        callback?.(false, errors)
        return Promise.resolve(false)
      })
      await methods.submit()
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })
})

describe("normalizeErrors", () => {
  let ctx: ReturnType<typeof createMethodsContext>
  let methods: ReturnType<typeof useMethods>

  beforeEach(() => {
    ctx = createMethodsContext()
    ctx.options.items = [
      { ...baseItemDefaults, prop: "name", label: "名称", component: { is: "el-input" } },
    ]
    methods = useMethods(ctx as any)
  })

  it("空值时 required 错误被保留", async () => {
    ctx.model.name = "" as any
    const errors = { name: [{ required: true, message: "必填项" }] }
    ctx.form.value.validate = vi.fn((callback: any) => {
      callback?.(false, errors)
      return Promise.resolve(false)
    })
    const result = await methods.submit()
    expect(result.errors?.name).toBeDefined()
    expect(result.errors?.name.length).toBe(1)
  })

  it("有值时 required 错误被过滤", async () => {
    ctx.model.name = "有值" as any
    const errors = { name: [{ required: true, message: "必填项" }] }
    ctx.form.value.validate = vi.fn((callback: any) => {
      callback?.(false, errors)
      return Promise.resolve(false)
    })
    const result = await methods.submit()
    expect(result.errors).toBeUndefined()
  })

  it("_inner 标记的错误在有值时被过滤", async () => {
    ctx.model.name = "有值" as any
    const errors = { name: [{ _inner: true, message: "内部规则" }] }
    ctx.form.value.validate = vi.fn((callback: any) => {
      callback?.(false, errors)
      return Promise.resolve(false)
    })
    const result = await methods.submit()
    expect(result.errors).toBeUndefined()
  })

  it("type=required 错误在有值时被过滤", async () => {
    ctx.model.name = "有值" as any
    const errors = { name: [{ type: "required", message: "必填" }] }
    ctx.form.value.validate = vi.fn((callback: any) => {
      callback?.(false, errors)
      return Promise.resolve(false)
    })
    const result = await methods.submit()
    expect(result.errors).toBeUndefined()
  })

  it("包含必填文字的错误在有值时被过滤", async () => {
    ctx.model.name = "有值" as any
    const errors = { name: [{ message: "此字段必填" }] }
    ctx.form.value.validate = vi.fn((callback: any) => {
      callback?.(false, errors)
      return Promise.resolve(false)
    })
    const result = await methods.submit()
    expect(result.errors).toBeUndefined()
  })

  it("非 required 类型错误不被过滤", async () => {
    ctx.model.name = "有值" as any
    const errors = { name: [{ message: "格式不正确" }] }
    ctx.form.value.validate = vi.fn((callback: any) => {
      callback?.(false, errors)
      return Promise.resolve(false)
    })
    const result = await methods.submit()
    expect(result.errors?.name).toBeDefined()
    expect(result.errors?.name[0].message).toBe("格式不正确")
  })
})

describe("useFormApi", () => {
  it("组合 actions 与 methods", () => {
    const ctx = createMethodsContext()
    ctx.options.items = [
      { ...baseItemDefaults, prop: "name", label: "名称", component: { is: "el-input" } },
    ]
    const api = useFormApi(ctx as any)

    expect(api.actions).toBeDefined()
    expect(api.methods).toBeDefined()
    expect(api.setField).toBeDefined()
    expect(api.validate).toBeDefined()
    expect(api.submit).toBeDefined()
  })
})
