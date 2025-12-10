import type { FormRecord } from "../types"
import formHook from "../core/hooks"
import { reactive } from "vue"
import { it, expect, describe } from "vitest"

describe("fd-form hooks 格式化器", () => {
  function createModel<T extends FormRecord>(data: T): T {
    return reactive(data) as T
  }

  describe("number", () => {
    it("将值转换为数字", () => {
      const model = createModel({ count: "123" })
      formHook.bind({ hook: "number", model, field: "count", value: model.count })
      expect(model.count).toBe(123)
    })

    it("数组中的值批量转换为数字", () => {
      const model = createModel({ ids: ["1", "2", "3"] })
      formHook.bind({ hook: "number", model, field: "ids", value: model.ids })
      expect(model.ids).toEqual([1, 2, 3])
    })
  })

  describe("string", () => {
    it("将值转换为字符串", () => {
      const model = createModel({ code: 100 })
      formHook.bind({ hook: "string", model, field: "code", value: model.code })
      expect(model.code).toBe("100")
    })

    it("数组中的值批量转换为字符串", () => {
      const model = createModel({ codes: [1, 2, 3] })
      formHook.bind({ hook: "string", model, field: "codes", value: model.codes })
      expect(model.codes).toEqual(["1", "2", "3"])
    })
  })

  describe("split", () => {
    it("字符串按逗号分割为数组", () => {
      const model = createModel({ tags: "a,b,c" })
      formHook.bind({ hook: "split", model, field: "tags", value: model.tags })
      expect(model.tags).toEqual(["a", "b", "c"])
    })

    it("已是数组则保持不变", () => {
      const model = createModel({ tags: ["x", "y"] })
      formHook.bind({ hook: "split", model, field: "tags", value: model.tags })
      expect(model.tags).toEqual(["x", "y"])
    })

    it("过滤空字符串", () => {
      const model = createModel({ tags: "a,,b," })
      formHook.bind({ hook: "split", model, field: "tags", value: model.tags })
      expect(model.tags).toEqual(["a", "b"])
    })
  })

  describe("join", () => {
    it("数组按逗号合并为字符串", () => {
      const model = createModel({ tags: ["a", "b", "c"] })
      formHook.submit({ hook: "join", model, field: "tags", value: model.tags })
      expect(model.tags).toBe("a,b,c")
    })

    it("非数组保持不变", () => {
      const model = createModel({ tags: "already-string" })
      formHook.submit({ hook: "join", model, field: "tags", value: model.tags })
      expect(model.tags).toBe("already-string")
    })
  })

  describe("boolean", () => {
    it("转换为布尔值", () => {
      const model = createModel({ active: 1 as unknown })
      formHook.bind({ hook: "boolean", model, field: "active", value: model.active })
      expect(model.active).toBe(true)

      const model2 = createModel({ active: 0 as unknown })
      formHook.bind({ hook: "boolean", model: model2, field: "active", value: model2.active })
      expect(model2.active).toBe(false)
    })
  })

  describe("booleanNumber", () => {
    it("bind 阶段：1/0 转换为 true/false", () => {
      const model = createModel({ enabled: 1 as unknown })
      formHook.bind({ hook: "booleanNumber", model, field: "enabled", value: model.enabled })
      expect(model.enabled).toBe(true)
    })

    it("submit 阶段：true/false 转换为 1/0", () => {
      const model = createModel({ enabled: true as unknown })
      formHook.submit({ hook: "booleanNumber", model, field: "enabled", value: model.enabled })
      expect(model.enabled).toBe(1)

      const model2 = createModel({ enabled: false as unknown })
      formHook.submit({ hook: "booleanNumber", model: model2, field: "enabled", value: model2.enabled })
      expect(model2.enabled).toBe(0)
    })
  })

  describe("splitJoin", () => {
    it("bind 阶段分割，submit 阶段合并", () => {
      const model = createModel({ tags: "x,y" })
      formHook.bind({ hook: "splitJoin", model, field: "tags", value: model.tags })
      expect(model.tags).toEqual(["x", "y"])

      formHook.submit({ hook: "splitJoin", model, field: "tags", value: model.tags })
      expect(model.tags).toBe("x,y")
    })
  })

  describe("json", () => {
    it("bind 阶段解析 JSON 字符串", () => {
      const model = createModel({ config: "{\"a\":1}" })
      formHook.bind({ hook: "json", model, field: "config", value: model.config })
      expect(model.config).toEqual({ a: 1 })
    })

    it("submit 阶段序列化为 JSON 字符串", () => {
      const model = createModel({ config: { b: 2 } })
      formHook.submit({ hook: "json", model, field: "config", value: model.config })
      expect(model.config).toBe("{\"b\":2}")
    })

    it("解析失败返回空对象", () => {
      const model = createModel({ config: "invalid json" })
      formHook.bind({ hook: "json", model, field: "config", value: model.config })
      expect(model.config).toEqual({})
    })
  })

  describe("empty", () => {
    it("空字符串转换为 undefined 并删除字段", () => {
      const model = createModel({ note: "" })
      formHook.submit({ hook: "empty", model, field: "note", value: model.note })
      expect(model.note).toBeUndefined()
    })

    it("空数组转换为 undefined 并删除字段", () => {
      const model = createModel({ items: [] as string[] })
      formHook.submit({ hook: "empty", model, field: "items", value: model.items })
      expect(model.items).toBeUndefined()
    })

    it("非空值保持不变", () => {
      const model = createModel({ note: "hello" })
      formHook.submit({ hook: "empty", model, field: "note", value: model.note })
      expect(model.note).toBe("hello")
    })
  })

  describe("datetimeRange", () => {
    it("bind 阶段：从 startTime/endTime 合并为数组", () => {
      const model = createModel({ time: undefined as unknown, startTime: "2024-01-01", endTime: "2024-12-31" })
      formHook.bind({ hook: "datetimeRange", model, field: "time", value: model.time })
      expect(model.time).toEqual(["2024-01-01", "2024-12-31"])
    })

    it("submit 阶段：数组拆分为 startTime/endTime", () => {
      const model = createModel({ time: ["2024-01-01", "2024-12-31"] as unknown, startTime: undefined, endTime: undefined })
      formHook.submit({ hook: "datetimeRange", model, field: "time", value: model.time })
      expect(model.startTime).toBe("2024-01-01")
      expect(model.endTime).toBe("2024-12-31")
      expect(model.time).toBeUndefined()
    })
  })

  describe("hook 管道组合", () => {
    it("支持数组形式的多个 hook", () => {
      const model = createModel({ tags: "1,2,3" })
      formHook.bind({ hook: ["split", "number"], model, field: "tags", value: model.tags })
      expect(model.tags).toEqual([1, 2, 3])
    })

    it("支持对象形式区分 bind/submit", () => {
      const model = createModel({ tags: "a,b" })
      formHook.bind({
        hook: { bind: "split", submit: "join" },
        model,
        field: "tags",
        value: model.tags,
      })
      expect(model.tags).toEqual(["a", "b"])

      formHook.submit({
        hook: { bind: "split", submit: "join" },
        model,
        field: "tags",
        value: model.tags,
      })
      expect(model.tags).toBe("a,b")
    })
  })

  describe("datetimeRange 边缘情况", () => {
    it("field 为空时不修改 model", () => {
      const model = createModel({ time: ["2024-01-01", "2024-12-31"] })
      formHook.submit({ hook: "datetimeRange", model, field: "", value: model.time })
      // field 为空不做任何操作
      expect(model.time).toEqual(["2024-01-01", "2024-12-31"])
    })

    it("数组长度不足时返回 undefined", () => {
      const model = createModel({ time: ["2024-01-01"] as unknown })
      formHook.submit({ hook: "datetimeRange", model, field: "time", value: model.time })
      expect(model.time).toBeUndefined()
    })

    it("bind 阶段 start/end 都为 undefined 时返回空数组", () => {
      const model = createModel({ time: undefined as unknown, startTime: undefined, endTime: undefined })
      formHook.bind({ hook: "datetimeRange", model, field: "time", value: model.time })
      expect(model.time).toEqual([])
    })
  })

  describe("number/string 边缘情况", () => {
    it("number: undefined/null 保持不变", () => {
      const model = createModel({ count: undefined as unknown })
      formHook.bind({ hook: "number", model, field: "count", value: model.count })
      expect(model.count).toBeUndefined()

      const model2 = createModel({ count: null as unknown })
      formHook.bind({ hook: "number", model: model2, field: "count", value: model2.count })
      expect(model2.count).toBeNull()
    })

    it("string: undefined/null 保持不变", () => {
      const model = createModel({ code: undefined as unknown })
      formHook.bind({ hook: "string", model, field: "code", value: model.code })
      expect(model.code).toBeUndefined()
    })
  })

  describe("split 边缘情况", () => {
    it("非字符串非数组返回空数组", () => {
      const model = createModel({ tags: 123 as unknown })
      formHook.bind({ hook: "split", model, field: "tags", value: model.tags })
      expect(model.tags).toEqual([])
    })
  })

  describe("splitJoin 边缘情况", () => {
    it("bind 阶段非字符串保持不变", () => {
      const model = createModel({ tags: ["a", "b"] })
      formHook.bind({ hook: "splitJoin", model, field: "tags", value: model.tags })
      expect(model.tags).toEqual(["a", "b"])
    })

    it("submit 阶段非数组保持不变", () => {
      const model = createModel({ tags: "abc" })
      formHook.submit({ hook: "splitJoin", model, field: "tags", value: model.tags })
      expect(model.tags).toBe("abc")
    })
  })

  describe("json 边缘情况", () => {
    it("bind 阶段非字符串保持不变", () => {
      const model = createModel({ config: { a: 1 } })
      formHook.bind({ hook: "json", model, field: "config", value: model.config })
      expect(model.config).toEqual({ a: 1 })
    })
  })

  describe("empty 边缘情况", () => {
    it("非字符串非数组保持不变", () => {
      const model = createModel({ value: 123 })
      formHook.submit({ hook: "empty", model, field: "value", value: model.value })
      expect(model.value).toBe(123)
    })

    it("非空数组保持不变", () => {
      const model = createModel({ items: ["a", "b"] })
      formHook.submit({ hook: "empty", model, field: "items", value: model.items })
      expect(model.items).toEqual(["a", "b"])
    })
  })

  describe("无效 hook 处理", () => {
    it("无 hook 配置时不修改 model", () => {
      const model = createModel({ value: "test" })
      formHook.bind({ hook: undefined as any, model, field: "value", value: model.value })
      expect(model.value).toBe("test")
    })

    it("无效的 hook 名称被忽略", () => {
      const model = createModel({ value: "test" })
      formHook.bind({ hook: "nonExistentHook" as any, model, field: "value", value: model.value })
      expect(model.value).toBe("test")
    })
  })

  describe("嵌套字段操作", () => {
    it("设置嵌套路径字段值", () => {
      const model = createModel<Record<string, any>>({})
      formHook.bind({ hook: "string", model, field: "user.profile.name", value: 123 })
      expect(model.user?.profile?.name).toBe("123")
    })

    it("submit 阶段 undefined 返回值删除嵌套字段", () => {
      const model = createModel<Record<string, any>>({ user: { name: "test", age: 18 } })
      formHook.submit({ hook: "empty", model, field: "user.name", value: "" })
      expect(model.user.name).toBeUndefined()
      expect(model.user.age).toBe(18)
    })

    it("删除不存在的嵌套路径不报错", () => {
      const model = createModel<Record<string, any>>({ data: {} })
      expect(() => {
        formHook.submit({ hook: "empty", model, field: "data.nested.deep.field", value: "" })
      }).not.toThrow()
    })
  })

  describe("registerFormHook 自定义钩子", () => {
    it("注册并使用自定义格式化钩子", async () => {
      const { registerFormHook } = await import("../core/hooks")

      // 注册自定义钩子：将值转为大写
      registerFormHook("uppercase", (value) => {
        if (typeof value === "string") return value.toUpperCase()
        return value
      })

      const model = createModel({ name: "hello" })
      formHook.bind({ hook: "uppercase" as any, model, field: "name", value: model.name })
      expect(model.name).toBe("HELLO")
    })

    it("自定义钩子可访问上下文", async () => {
      const { registerFormHook } = await import("../core/hooks")

      registerFormHook("contextTest", (value, ctx) => {
        if (ctx.method === "bind") return `bind:${value}`
        return `submit:${value}`
      })

      const model = createModel<Record<string, any>>({ field: "test" })
      formHook.bind({ hook: "contextTest" as any, model, field: "field", value: model.field })
      expect(model.field).toBe("bind:test")

      formHook.submit({ hook: "contextTest" as any, model, field: "field", value: model.field })
      expect(model.field).toBe("submit:bind:test")
    })
  })

  describe("hook 对象配置", () => {
    it("对象配置只执行对应阶段的钩子", () => {
      const model = createModel({ value: "test" })
      // bind 阶段，submit 配置不执行
      formHook.bind({
        hook: { bind: "string", submit: "number" },
        model,
        field: "value",
        value: 123,
      })
      expect(model.value).toBe("123")
    })

    it("对象配置阶段为数组时依次执行", () => {
      const model = createModel({ tags: "a,b,c" })
      formHook.bind({
        hook: { bind: ["split"], submit: ["join"] },
        model,
        field: "tags",
        value: model.tags,
      })
      expect(model.tags).toEqual(["a", "b", "c"])
    })

    it("对象配置阶段未定义时不执行", () => {
      const model = createModel({ value: "original" })
      formHook.bind({
        hook: { submit: "number" }, // 无 bind 配置
        model,
        field: "value",
        value: model.value,
      })
      // 值应保持不变（因为 bind 阶段无配置）
      expect(model.value).toBe("original")
    })
  })

  describe("field 为空的边缘情况", () => {
    it("field 为 undefined 时不更新 model", () => {
      const model = createModel({ existing: "value" })
      formHook.bind({ hook: "string", model, field: undefined as any, value: 123 })
      // model 应保持不变
      expect(model.existing).toBe("value")
      expect(Object.keys(model)).toEqual(["existing"])
    })

    it("field 为空字符串时仍执行但不更新", () => {
      const model = createModel({ test: "value" })
      formHook.bind({ hook: "string", model, field: "", value: 123 })
      expect(model.test).toBe("value")
    })
  })
})
