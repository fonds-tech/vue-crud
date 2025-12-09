import { reactive } from "vue"
import { it, expect, describe } from "vitest"
import { toPathArray, propToString, getModelValue, setModelValue, deleteModelValue } from "../core/model"

describe("fd-form model 路径操作", () => {
  describe("toPathArray", () => {
    it("字符串路径转换为数组", () => {
      expect(toPathArray("a.b.c")).toEqual(["a", "b", "c"])
    })

    it("数组输入保持为字符串数组", () => {
      expect(toPathArray(["x", "y"])).toEqual(["x", "y"])
    })

    it("空值返回 undefined", () => {
      expect(toPathArray(undefined)).toBeUndefined()
      expect(toPathArray(null as unknown as undefined)).toBeUndefined()
    })

    it("空字符串返回 undefined", () => {
      expect(toPathArray("")).toBeUndefined()
    })

    it("单层路径", () => {
      expect(toPathArray("name")).toEqual(["name"])
    })
  })

  describe("propToString", () => {
    it("字符串路径保持不变", () => {
      expect(propToString("user.name")).toBe("user.name")
    })

    it("数组路径转换为点分隔字符串", () => {
      expect(propToString(["user", "info", "age"])).toBe("user.info.age")
    })

    it("空值返回空字符串", () => {
      expect(propToString(undefined)).toBe("")
    })
  })

  describe("getModelValue", () => {
    it("获取单层属性", () => {
      const model = reactive({ name: "Tom" })
      expect(getModelValue(model, "name")).toBe("Tom")
    })

    it("获取嵌套属性", () => {
      const model = reactive({ user: { info: { age: 25 } } })
      expect(getModelValue(model, "user.info.age")).toBe(25)
    })

    it("数组形式路径", () => {
      const model = reactive({ a: { b: { c: 123 } } })
      expect(getModelValue(model, ["a", "b", "c"])).toBe(123)
    })

    it("路径不存在返回 undefined", () => {
      const model = reactive({ name: "Tom" })
      expect(getModelValue(model, "user.age")).toBeUndefined()
    })

    it("无 prop 返回整个 model", () => {
      const model = reactive({ name: "Tom", age: 20 })
      expect(getModelValue(model)).toEqual({ name: "Tom", age: 20 })
    })
  })

  describe("setModelValue", () => {
    it("设置单层属性", () => {
      const model = reactive<Record<string, unknown>>({})
      setModelValue(model, "name", "Jerry")
      expect(model.name).toBe("Jerry")
    })

    it("设置嵌套属性（自动创建中间对象）", () => {
      const model = reactive<Record<string, unknown>>({})
      setModelValue(model, "user.info.name", "Alice")
      expect((model.user as Record<string, unknown>)).toBeDefined()
      expect(((model.user as Record<string, unknown>).info as Record<string, unknown>).name).toBe("Alice")
    })

    it("覆盖已有值", () => {
      const model = reactive({ count: 10 })
      setModelValue(model, "count", 20)
      expect(model.count).toBe(20)
    })
  })

  describe("deleteModelValue", () => {
    it("删除单层属性", () => {
      const model = reactive({ name: "Tom", age: 20 })
      deleteModelValue(model, "name")
      expect(model.name).toBeUndefined()
      expect(model.age).toBe(20)
    })

    it("删除嵌套属性", () => {
      const model = reactive({ user: { info: { name: "Tom", age: 20 } } })
      deleteModelValue(model, "user.info.name")
      expect(model.user.info.name).toBeUndefined()
      expect(model.user.info.age).toBe(20)
    })

    it("路径不存在时不报错", () => {
      const model = reactive({ name: "Tom" })
      expect(() => deleteModelValue(model, "user.info.age")).not.toThrow()
    })

    it("空路径不做任何操作", () => {
      const model = reactive({ name: "Tom" })
      deleteModelValue(model, "")
      expect(model.name).toBe("Tom")
    })
  })
})
