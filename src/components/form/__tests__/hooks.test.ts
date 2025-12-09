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
})
