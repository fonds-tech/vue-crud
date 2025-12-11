import globalStore from "../global"
import { Mitt } from "../mitt"
import { dataset } from "../dataset"
import { downloadFile } from "../file"
import { parse, componentIs } from "../component"
import { h, defineComponent } from "vue"
import { it, vi, expect, describe } from "vitest"

describe("utils Coverage Supplement", () => {
  describe("dataset", () => {
    it("should return undefined when accessing properties of null", () => {
      // 正常逻辑流转，readValue 返回 undefined，不会抛错进入 catch
      expect(dataset(null as any, "a.b")).toBeUndefined()
    })

    it("should handle array filtering failure", () => {
      const obj = { list: [{ id: 1 }] }
      // 查找不存在的 id
      expect(dataset(obj, "list[id:2].name")).toBeUndefined()

      // 在非数组上使用过滤器
      const notArray = { list: { id: 1 } }
      expect(dataset(notArray, "list[id:1].name")).toEqual({})
    })

    it("should handle writeValue failures", () => {
      const _obj = { arr: [1], obj: { a: 1 } }

      // 尝试用字符串 key 写入数组 (dataset 内部逻辑会阻止或覆盖？)
      // writeValue: if typeof key === 'number' && isRecordArray...
      // dataset 逻辑：resolveKey 返回 number index，所以会走进 number 分支

      // 尝试写入非对象/非数组 cursor
      const primitive = { val: 1 }
      // cursor 指向 1 (number)，尝试写入属性
      // readValue(1, "a") -> undefined -> cursor=undefined -> loop continues
      // 如果路径很长，中间断了
      dataset(primitive, "val.a", 2)
      expect(primitive.val).toBe(1) // 无法写入
    })

    it("should merge object when writing to existing record", () => {
      const obj = { user: { name: "Alice", age: 18 } }
      dataset(obj, "user", { city: "Wonderland" })
      expect(obj.user).toEqual({ name: "Alice", age: 18, city: "Wonderland" })
    })

    it("should handle invalid index and non-object writes", () => {
      const obj: any = { list: [{ id: 1 }] }
      // 非数字下标返回 {} 并终止
      expect(dataset(obj, "list[foo].name")).toEqual({})
      // 写入非对象时使用空对象占位
      dataset(obj, "list[0]", 123)
      expect(obj.list[0]).toEqual({})
      // 合并已有对象
      const mergeTarget = { user: { a: 1 } }
      dataset(mergeTarget, "user", { b: 2 })
      expect(mergeTarget.user).toEqual({ a: 1, b: 2 })
      // 目标为原始值时也能覆盖
      const primMerge = { user: 1 as any }
      dataset(primMerge, "user", { name: "bob" })
      expect(primMerge.user).toEqual({ name: "bob" })
    })
  })

  describe("mitt", () => {
    it("should handle existing handlers in 'on'", () => {
      const mitt = new Mitt()
      const fn1 = vi.fn()
      const fn2 = vi.fn()
      mitt.on("test", fn1)
      mitt.on("test", fn2) // push to existing array

      mitt.emit("test", "payload")
      expect(fn1).toHaveBeenCalledWith("payload")
      expect(fn2).toHaveBeenCalledWith("payload")
    })

    it("should safely handle 'off' for non-existent types/handlers", () => {
      const mitt = new Mitt()
      const fn = vi.fn()

      // Off non-existent type
      expect(() => mitt.off("404", fn)).not.toThrow()

      // Off non-existent handler in existing type
      mitt.on("test", fn)
      const otherFn = vi.fn()
      mitt.off("test", otherFn) // splice -1 ? index >>> 0 handles -1 to huge number, but splice handles logic

      // Splice behavior verification:
      // indexOf returns -1. -1 >>> 0 is 4294967295.
      // splice(4294967295, 1) usually does nothing on small array.

      mitt.emit("test", "payload")
      expect(fn).toHaveBeenCalled() // Should still be there
    })

    it("should safely handle 'emit' for non-existent types", () => {
      const mitt = new Mitt()
      expect(() => mitt.emit("404")).not.toThrow()
    })
  })

  describe("component", () => {
    const Comp = defineComponent({ render: () => h("div") })

    it("should distinguish components from configs", () => {
      // isComponent check logic coverage
      // Valid component object
      expect(parse(Comp, {}).is).toBeDefined()

      // Plain object is NOT component
      const plain = { a: 1 }
      // isComponent(plain) -> false
      // isConfig(plain) -> false
      expect(parse(plain as any, {}).is).toBeUndefined()
    })

    it("should resolve dynamic 'is' in config", () => {
      const ctx = { show: true }
      // config.is returning Component object
      const config = {
        is: () => Comp,
      }
      const res = parse(config, ctx)
      // markRaw wrapper check
      // expect(res.is).toBe(Comp) // markRaw might return same object but marked
      expect(res.is).toEqual(Comp)
    })

    it("componentIs should handle various types", () => {
      const vnode = h("div")
      expect(componentIs(vnode, {})).toBe(vnode)

      expect(componentIs("div", {})).toBeUndefined() // string returns undefined per implementation

      // Config with resolved 'is' as object
      const config = { is: () => Comp }
      expect(componentIs(config, {})).toEqual(Comp)
    })

    it("component helpers return undefined for不支持类型", () => {
      expect(componentIs(123 as any, {})).toBeUndefined()
      expect(componentIs(undefined as any, {})).toBeUndefined()
      expect(parse(123 as any, {}).slotName).toBeUndefined()
      expect(parse(undefined as any, {}).slotName).toBeUndefined()
      // slotName 对非字符串/配置对象返回 undefined
      expect(parse({} as any, {}).slotName).toBeUndefined()
    })
  })

  describe("file", () => {
    it("downloadFile should work without fileName", () => {
      const linkSpy = {
        style: {},
        click: vi.fn(),
        href: "",
        download: "",
      }
      vi.spyOn(document, "createElement").mockReturnValue(linkSpy as any)
      vi.spyOn(document.body, "appendChild").mockImplementation(() => null as any)
      vi.spyOn(document.body, "removeChild").mockImplementation(() => null as any)

      downloadFile("http://url.com")
      expect(linkSpy.href).toBe("http://url.com") // Simple string assignment
      expect(linkSpy.download).toBe("") // Should not be set if undefined
      // Implementation: if (fileName) link.download = fileName
      // So it remains empty string (default mock value)
    })
  })

  describe("global", () => {
    it("get returns undefined for missing key", () => {
      expect(globalStore.get("non-existent")).toBeUndefined()
    })
  })
})
