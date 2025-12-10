import type { HookHandlers } from "../core/hooks"
import { registerEvents, unregisterEvents } from "../core/hooks"
import { it, vi, expect, describe, afterEach, beforeEach } from "vitest"

describe("table hooks", () => {
  let mitt: any
  let handlers: HookHandlers
  let addEventListenerSpy: any
  let removeEventListenerSpy: any

  beforeEach(() => {
    mitt = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    }
    handlers = {
      refresh: vi.fn(),
      select: vi.fn(),
      selectAll: vi.fn(),
      clearSelection: vi.fn(),
      toggleFullscreen: vi.fn(),
      closeContextMenu: vi.fn(),
    }

    // Mock document.addEventListener/removeEventListener
    addEventListenerSpy = vi.spyOn(document, "addEventListener")
    removeEventListenerSpy = vi.spyOn(document, "removeEventListener")
  })

  afterEach(() => {
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  describe("registerEvents", () => {
    it("应该注册所有 mitt 事件", () => {
      registerEvents(mitt, handlers)

      // 验证调用了 5 次 (不包括 closeContextMenu，它通过 document.addEventListener 注册)
      expect(mitt.on).toHaveBeenCalledTimes(5)
      expect(mitt.on).toHaveBeenCalledWith("table.refresh", expect.any(Function))
      expect(mitt.on).toHaveBeenCalledWith("table.select", expect.any(Function))
      expect(mitt.on).toHaveBeenCalledWith("table.selectAll", expect.any(Function))
      expect(mitt.on).toHaveBeenCalledWith("table.clearSelection", expect.any(Function))
      expect(mitt.on).toHaveBeenCalledWith("table.toggleFullscreen", expect.any(Function))
    })

    it("应该在 document 上注册点击监听器", () => {
      registerEvents(mitt, handlers)

      expect(addEventListenerSpy).toHaveBeenCalledWith("click", handlers.closeContextMenu)
    })

    it("mitt 不存在时应该静默跳过", () => {
      expect(() => registerEvents(undefined, handlers)).not.toThrow()
    })

    it("mitt.on 不存在时应该静默跳过", () => {
      const mittWithoutOn = { off: vi.fn(), emit: vi.fn() }
      expect(() => registerEvents(mittWithoutOn as any, handlers)).not.toThrow()
    })

    it("normalizeRowKey 能处理数组、单值与非法输入", () => {
      registerEvents(mitt, handlers)
      const bound = mitt.on.mock.calls.find((call: any[]) => call[0] === "table.select")?.[1] as any
      bound?.([1, 2, "a"], true)
      bound?.(123, false)
      bound?.({ not: "valid" }, true)
      expect(handlers.select).toHaveBeenCalledWith([1, 2, "a"], true)
      expect(handlers.select).toHaveBeenCalledWith(123, false)
      // 非法输入转为 undefined
      const invalidCall = (handlers.select as any).mock.calls.find((call: any[]) => call[0] === undefined)
      expect(invalidCall).toBeDefined()
    })

    it("selectAll/toggleFullscreen 参数非布尔时会被归一化为 undefined", () => {
      registerEvents(mitt, handlers)
      const selectAllHandler = mitt.on.mock.calls.find((call: any[]) => call[0] === "table.selectAll")?.[1] as any
      const toggleHandler = mitt.on.mock.calls.find((call: any[]) => call[0] === "table.toggleFullscreen")?.[1] as any
      selectAllHandler?.("not-bool")
      toggleHandler?.("yes")
      expect(handlers.selectAll).toHaveBeenCalledWith(undefined)
      expect(handlers.toggleFullscreen).toHaveBeenCalledWith(undefined)
    })
  })

  describe("unregisterEvents", () => {
    beforeEach(() => {
      // 先注册事件
      registerEvents(mitt, handlers)
      // 清除 mock 调用记录
      mitt.off.mockClear()
    })

    it("应该注销所有 mitt 事件", () => {
      unregisterEvents(mitt, handlers)

      expect(mitt.off).toHaveBeenCalledTimes(5)
      expect(mitt.off).toHaveBeenCalledWith("table.refresh", expect.any(Function))
      expect(mitt.off).toHaveBeenCalledWith("table.select", expect.any(Function))
      expect(mitt.off).toHaveBeenCalledWith("table.selectAll", expect.any(Function))
      expect(mitt.off).toHaveBeenCalledWith("table.clearSelection", expect.any(Function))
      expect(mitt.off).toHaveBeenCalledWith("table.toggleFullscreen", expect.any(Function))
    })

    it("应该移除 document 的点击监听器", () => {
      unregisterEvents(mitt, handlers)

      expect(removeEventListenerSpy).toHaveBeenCalledWith("click", handlers.closeContextMenu)
    })

    it("mitt 不存在时也应该移除 document 监听器", () => {
      unregisterEvents(undefined, handlers)

      expect(removeEventListenerSpy).toHaveBeenCalledWith("click", handlers.closeContextMenu)
    })

    it("未注册过事件时也应静默，仅移除 document 监听", () => {
      const freshMitt = { on: vi.fn(), off: vi.fn() }
      unregisterEvents(freshMitt as any, handlers)
      expect(freshMitt.off).not.toHaveBeenCalled()
      expect(removeEventListenerSpy).toHaveBeenCalledWith("click", handlers.closeContextMenu)
    })
  })

  describe("事件处理流程", () => {
    it("完整的注册和注销流程", () => {
      // 注册
      registerEvents(mitt, handlers)
      expect(mitt.on).toHaveBeenCalledTimes(5)
      expect(addEventListenerSpy).toHaveBeenCalled()

      // 注销
      mitt.off.mockClear()
      unregisterEvents(mitt, handlers)
      expect(mitt.off).toHaveBeenCalledTimes(5)
      expect(removeEventListenerSpy).toHaveBeenCalled()
    })
  })
})
