import { ref } from "vue"
import { it, expect, describe } from "vitest"
import { toArray, getValue, mergeObject } from "../object"

describe("object utils", () => {
  describe("toArray", () => {
    it("应该将单个值转换为数组", () => {
      expect(toArray("hello")).toEqual(["hello"])
      expect(toArray(123)).toEqual([123])
      expect(toArray(true)).toEqual([true])
      expect(toArray({ key: "value" })).toEqual([{ key: "value" }])
    })

    it("数组应该原样返回", () => {
      expect(toArray(["a", "b"])).toEqual(["a", "b"])
      expect(toArray([1, 2, 3])).toEqual([1, 2, 3])
      expect(toArray([])).toEqual([])
    })

    it("应该处理 null 和 undefined", () => {
      expect(toArray(null)).toEqual([null])
      expect(toArray(undefined)).toEqual([undefined])
    })
  })

  describe("getValue", () => {
    it("应该返回普通值", () => {
      expect(getValue("hello")).toBe("hello")
      expect(getValue(123)).toBe(123)
      expect(getValue(true)).toBe(true)
      expect(getValue({ key: "value" })).toEqual({ key: "value" })
    })

    it("应该解包 Ref 并返回值", () => {
      const refValue = ref("hello")
      expect(getValue(refValue)).toBe("hello")

      const refNumber = ref(42)
      expect(getValue(refNumber)).toBe(42)

      const refObject = ref({ name: "Alice" })
      expect(getValue(refObject)).toEqual({ name: "Alice" })
    })

    it("应该调用函数并返回结果", () => {
      const fn = () => "result"
      expect(getValue(fn)).toBe("result")
    })

    it("应该将参数传递给函数", () => {
      const fn = (a: number, b: number) => a + b
      expect(getValue(fn as any, 1, 2)).toBe(3)
    })

    it("应该处理多个参数的函数", () => {
      const fn = (...args: number[]) => args.reduce((sum, val) => sum + val, 0)
      expect(getValue(fn as any, 1, 2, 3, 4)).toBe(10)
    })

    it("应该处理返回函数的函数", () => {
      const fn = () => () => "nested"
      const result = getValue(fn)
      expect(typeof result).toBe("function")
      expect(result()).toBe("nested")
    })
  })

  describe("mergeObject", () => {
    it("应该合并对象", () => {
      const target = { a: 1, b: 2 }
      const source = { b: 3, c: 4 }
      const result = mergeObject(target, source)

      expect(result).toEqual({ a: 1, b: 3, c: 4 })
    })

    it("source 为 undefined 时应该返回 target", () => {
      const target = { a: 1, b: 2 }
      const result = mergeObject(target, undefined)

      expect(result).toEqual(target)
      expect(result).toBe(target)
    })

    it("应该深度合并嵌套对象", () => {
      const target = {
        a: 1,
        nested: { x: 10, y: 20 },
      }
      const source = {
        nested: { y: 30, z: 40 },
      }
      const result = mergeObject(target, source as any)

      expect(result).toEqual({
        a: 1,
        nested: { x: 10, y: 30, z: 40 },
      })
    })

    it("数组应该直接覆盖而不是合并", () => {
      const target = { arr: [1, 2, 3] }
      const source = { arr: [4, 5] }
      const result = mergeObject(target, source)

      expect(result.arr).toEqual([4, 5])
      expect(result.arr).not.toEqual([1, 2, 3, 4, 5])
    })

    it("应该创建数组的副本", () => {
      const sourceArray = [1, 2, 3]
      const target = { arr: [] as number[] }
      const source = { arr: sourceArray }
      const result = mergeObject(target, source)

      expect(result.arr).toEqual(sourceArray)
      expect(result.arr).not.toBe(sourceArray) // 不同的引用
    })

    it("应该处理空对象", () => {
      const target = {}
      const source = { a: 1, b: 2 }
      const result = mergeObject(target, source)

      expect(result).toEqual({ a: 1, b: 2 })
    })

    it("应该处理复杂的嵌套结构", () => {
      const target = {
        user: {
          name: "Alice",
          settings: {
            theme: "dark",
            notifications: true,
          },
        },
        items: [1, 2, 3],
      }
      const source = {
        user: {
          settings: {
            theme: "light",
          },
        },
        items: [4, 5],
      }
      const result = mergeObject(target, source as any)

      expect(result).toEqual({
        user: {
          name: "Alice",
          settings: {
            theme: "light",
            notifications: true,
          },
        },
        items: [4, 5],
      })
    })
  })
})
