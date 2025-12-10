import globalStore from "../global"
import { Mitt } from "../mitt"
import { dataset } from "../dataset"
import { downloadFile } from "../file"
import { h, defineComponent } from "vue"
import { it, vi, expect, describe, afterEach } from "vitest"
import { parse, isConfig, slotName, componentIs } from "../component"

describe("utils 补充覆盖", () => {
  describe("dataset", () => {
    it("能够读取与写入深层路径，并支持数组索引/匹配", () => {
      const obj: any = {
        user: { name: "alice", profile: { city: "sh" } },
        list: [
          { id: "1", name: "foo" },
          { id: "2", name: "bar" },
        ],
      }

      expect(dataset(obj, "user.name")).toBe("alice")
      dataset(obj, "user.age", 18)
      expect(obj.user.age).toBe(18)

      expect(dataset(obj, "list[0].name")).toBe("foo")
      expect(dataset(obj, "list[id:2].name")).toBe("bar")

      dataset(obj, "list[1]", { extra: true })
      expect(obj.list[1]).toEqual({ extra: true })
    })

    it("非法路径或解析异常时返回空对象", () => {
      const obj: any = { arr: "not-array" }
      expect(dataset(obj, "arr[id:1].foo")).toEqual({})
    })
  })

  describe("mitt", () => {
    it("on/emit 支持特定事件与通配符事件", () => {
      interface Events {
        foo: string
        bar: number
        [key: string]: unknown
        [key: symbol]: unknown
      }
      const mitt = new Mitt<Events>()
      const fooHandler = vi.fn()
      const wildcard = vi.fn()

      mitt.on("foo", fooHandler)
      mitt.on("*", wildcard)

      mitt.emit("foo", "payload")
      expect(fooHandler).toHaveBeenCalledWith("payload")
      expect(wildcard).toHaveBeenCalledWith("foo", "payload")
    })

    it("off 可以移除指定或全部处理器，clear 清空事件表", () => {
      interface Events {
        foo: string
        [key: string]: unknown
        [key: symbol]: unknown
      }
      const mitt = new Mitt<Events>()
      const handler = vi.fn()
      const wildcard = vi.fn()

      mitt.on("foo", handler)
      mitt.on("*", wildcard)
      mitt.off("foo", handler)
      mitt.emit("foo", "ignored")
      expect(handler).not.toHaveBeenCalled()
      expect(wildcard).toHaveBeenCalledWith("foo", "ignored")
      wildcard.mockClear()

      mitt.off("*")
      mitt.emit("foo", "ignored-again")
      expect(wildcard).not.toHaveBeenCalled()

      mitt.on("foo", handler)
      mitt.clear()
      mitt.emit("foo", "still-ignored")
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe("component 工具", () => {
    const Dummy = defineComponent({ name: "Dummy", setup: () => () => h("div") })

    it("isConfig 判定配置对象", () => {
      expect(isConfig({ is: "el-button" })).toBe(true)
      expect(isConfig({ props: { type: "primary" } })).toBe(true)
      expect(isConfig("el-button")).toBe(false)
      expect(isConfig(Dummy)).toBe(false)
      expect(isConfig(h("span"))).toBe(false)
    })

    it("parse 解析字符串、VNode、组件与配置对象", () => {
      const vnodeResult = parse(h("p"), {})
      expect(vnodeResult.is && (vnodeResult.is as any).type).toBe("p")

      const componentResult = parse(Dummy, {})
      expect(componentResult.is).toBe(Dummy)

      const ctx = { flag: true, id: 1, slotName: "named" }
      const configResult = parse(
        {
          is: (c: typeof ctx) => (c.flag ? "section" : "div"),
          props: (c: typeof ctx) => ({ id: c.id }),
          style: { color: "red" },
          on: { click: vi.fn() },
          slots: { default: () => "slot" },
          slot: (c: typeof ctx) => c.slotName,
          ref: "ref-el",
        },
        ctx,
      )

      expect(configResult.is).toBe("section")
      expect(configResult.props).toEqual({ id: 1 })
      expect((configResult.events as any).click).toBeTypeOf("function")
      expect((configResult.slots as any).default?.()).toBe("slot")
      expect(configResult.slotName).toBe("named")
      expect(configResult.ref).toBe("ref-el")
    })

    it("slotName 与 componentIs 便捷方法", () => {
      const ctx = { use: true }
      expect(slotName("outer", ctx)).toBe("outer")
      expect(slotName({ slot: () => "inner" } as any, ctx)).toBe("inner")

      expect(componentIs("plain", ctx)).toBeUndefined()
      const vnode = h("span")
      expect(componentIs(vnode, ctx)).toBe(vnode)
      expect(componentIs(Dummy, ctx)).toBe(Dummy)
      expect(componentIs({ is: () => "custom" } as any, ctx)).toBe("custom")
    })
  })

  describe("global/file", () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it("global store 能 set/get", () => {
      globalStore.set("key", { value: 1 })
      expect(globalStore.get<{ value: number }>("key")?.value).toBe(1)
    })

    it("downloadFile 创建隐藏链接并触发点击", () => {
      const fakeLink: any = { style: {}, click: vi.fn() }
      const createSpy = vi.spyOn(document, "createElement").mockReturnValue(fakeLink)
      const appendSpy = vi.spyOn(document.body, "appendChild").mockImplementation(() => fakeLink as any)
      const removeSpy = vi.spyOn(document.body, "removeChild").mockImplementation(() => fakeLink as any)

      downloadFile("http://example.com/report", "report.csv")

      expect(createSpy).toHaveBeenCalledWith("a")
      expect(fakeLink.href).toBe("http://example.com/report")
      expect(fakeLink.download).toBe("report.csv")
      expect(appendSpy).toHaveBeenCalledWith(fakeLink)
      expect(fakeLink.click).toHaveBeenCalled()
      expect(removeSpy).toHaveBeenCalledWith(fakeLink)
    })
  })
})
