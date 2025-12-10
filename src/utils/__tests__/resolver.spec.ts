import { resolve, resolveProp } from "../resolver"
import { it, expect, describe } from "vitest"

describe("resolver", () => {
  describe("resolve", () => {
    it("应该返回静态值", () => {
      expect(resolve("hello", {})).toBe("hello")
      expect(resolve(123, {})).toBe(123)
      expect(resolve(true, {})).toBe(true)
      expect(resolve({ key: "value" }, {})).toEqual({ key: "value" })
    })

    it("应该调用函数并返回结果", () => {
      const fn = (ctx: { name: string }) => `Hello, ${ctx.name}`
      expect(resolve(fn, { name: "World" })).toBe("Hello, World")
    })

    it("应该将上下文传递给函数", () => {
      const fn = (ctx: { a: number, b: number }) => ctx.a + ctx.b
      expect(resolve(fn, { a: 1, b: 2 })).toBe(3)
    })

    it("应该处理 undefined", () => {
      expect(resolve(undefined, {})).toBeUndefined()
    })

    it("应该处理返回 undefined 的函数", () => {
      const fn = () => undefined
      expect(resolve(fn, {})).toBeUndefined()
    })

    it("应该处理复杂的上下文", () => {
      interface Context {
        user: { name: string, age: number }
        isAdmin: boolean
      }
      const fn = (ctx: Context) => (ctx.isAdmin ? ctx.user.name : "Guest")

      expect(resolve(fn, { user: { name: "Alice", age: 30 }, isAdmin: true })).toBe("Alice")
      expect(resolve(fn, { user: { name: "Bob", age: 25 }, isAdmin: false })).toBe("Guest")
    })
  })

  describe("resolveProp", () => {
    it("应该返回对象的静态属性", () => {
      const config = { label: "静态标签", count: 10 }
      expect(resolveProp(config, "label", {})).toBe("静态标签")
      expect(resolveProp(config, "count", {})).toBe(10)
    })

    it("应该调用函数属性并返回结果", () => {
      const config = {
        label: "静态",
        visible: (ctx: { show: boolean }) => ctx.show,
      }
      expect(resolveProp(config, "visible", { show: true })).toBe(true)
      expect(resolveProp(config, "visible", { show: false })).toBe(false)
    })

    it("属性不存在时应该返回 undefined", () => {
      const config = { label: "test" }
      expect(resolveProp(config, "notExist", {})).toBeUndefined()
    })

    it("target 为 undefined 时应该返回 undefined", () => {
      expect(resolveProp(undefined, "label", {})).toBeUndefined()
    })

    it("target 不是对象时应该返回 undefined", () => {
      expect(resolveProp("not-object" as any, "label", {})).toBeUndefined()
      expect(resolveProp(123 as any, "label", {})).toBeUndefined()
      expect(resolveProp(null as any, "label", {})).toBeUndefined()
    })

    it("应该传递上下文给函数属性", () => {
      const config = {
        total: (ctx: { price: number, quantity: number }) => ctx.price * ctx.quantity,
      }
      expect(resolveProp(config, "total", { price: 10, quantity: 5 })).toBe(50)
    })

    it("应该处理混合的静态和函数属性", () => {
      const config = {
        static: "value",
        dynamic: (ctx: { x: number }) => ctx.x * 2,
      }
      expect(resolveProp(config, "static", { x: 10 })).toBe("value")
      expect(resolveProp(config, "dynamic", { x: 10 })).toBe(20)
    })
  })
})
